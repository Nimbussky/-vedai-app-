import type { LLMProvider } from './providers/types';
import { getActiveProviders } from './providers';

const PROVIDER_TIMEOUT_MS = 60000;
const MAX_MESSAGE_LENGTH = 2000;

// ============================================
// VEDAI HYBRID BRAIN ENGINE
// Tries providers by priority, never crashes
// ============================================

export async function* streamChat(
  message: string,
  systemPrompt: string,
  chartData?: Record<string, unknown>,
): AsyncGenerator<{ chunk: string; provider: string }> {
  const trimmed = message.trim().slice(0, MAX_MESSAGE_LENGTH);
  if (!trimmed) return;

  let fullPrompt = systemPrompt;
  if (chartData) {
    fullPrompt += `\n\nTHE USER'S BIRTH CHART:\n${JSON.stringify(chartData, null, 2)}\nUse this chart data to give personalized readings.`;
  }

  const providers = getActiveProviders();

  for (const provider of providers) {
      // GLM gets one retry
      const attempts = provider.slug === 'glm' ? 2 : 1;

    for (let attempt = 1; attempt <= attempts; attempt++) {
      let timeout: ReturnType<typeof setTimeout> | undefined;
      try {
        console.log(`[VedAI] Trying ${provider.name} (attempt ${attempt}/${attempts})`);

        const controller = new AbortController();
        timeout = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);

        const url = provider.slug === 'gemini'
          ? `${provider.url}?key=${provider.apiKey}`
          : provider.url;

        const response = await fetch(url, {
          method: 'POST',
          headers: provider.buildHeaders(provider.apiKey || ''),
          body: provider.buildBody(trimmed, fullPrompt),
          signal: controller.signal,
        });

        if (!response.ok) {
          clearTimeout(timeout);
          const err = await response.text().catch(() => '');
          console.error(`[VedAI] ${provider.name} HTTP ${response.status}:`, err.slice(0, 200));
          break; // Don't retry HTTP errors
        }

        console.log(`[VedAI] ${provider.name} SUCCESS`);
        yield* streamFromProvider(provider, response);
        clearTimeout(timeout);
        return; // Success, done

      } catch (err: unknown) {
        if (timeout) clearTimeout(timeout);
        const isTimeout = err instanceof DOMException && err.name === 'AbortError';
        console.error(`[VedAI] ${provider.name} ${isTimeout ? 'TIMEOUT' : 'CRASHED'}:`, err);
      }
    }
  }

  // All providers failed — try non-streaming GLM as last resort
  console.log('[VedAI] All streaming failed, trying non-streaming GLM...');
  const fallback = providers.find((p) => p.slug === 'glm');
  if (fallback?.apiKey) {
    const result = await tryNonStreaming(fallback, trimmed, fullPrompt);
    if (result) {
      yield { chunk: result, provider: 'glm-fallback' };
      return;
    }
  }

  // Absolute last resort — static response
  yield { chunk: getStaticFallback(chartData), provider: 'static' };
}

async function* streamFromProvider(provider: LLMProvider, response: Response) {
  const decoder = new TextDecoder();
  const reader = response.body?.getReader();
  if (!reader) return;

  let buffer = '';

  // Gemini uses JSON array format, everything else is OpenAI SSE
  if (provider.slug === 'gemini') {
    yield* streamGeminiResponse(reader, decoder);
    return;
  }

  // Ollama uses NDJSON, not SSE
  if (provider.slug === 'ollama') {
    yield* streamOllamaResponse(reader, decoder);
    return;
  }

  // Standard OpenAI SSE format (GLM, Cerebras, Groq, Mistral, DeepSeek, OpenRouter)
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const result = provider.parseStreamChunk(line);
        if (result === '__DONE__') return;
        if (result) yield { chunk: result, provider: provider.name };
      }
    }
  } catch (err) {
    console.error(`[VedAI] ${provider.name} stream read error:`, err);
    throw err;
  }
}

async function* streamGeminiResponse(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  decoder: TextDecoder,
) {
  let buffer = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      while (true) {
        const arrayStart = buffer.indexOf('[');
        if (arrayStart === -1) break;

        let depth = 0;
        let endIdx = -1;
        for (let i = arrayStart; i < buffer.length; i++) {
          if (buffer[i] === '[') depth++;
          if (buffer[i] === ']') depth--;
          if (depth === 0) { endIdx = i; break; }
        }

        if (endIdx === -1) break;

        try {
          const arr = JSON.parse(buffer.slice(arrayStart, endIdx + 1));
          for (const item of arr) {
            const text = item?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) yield { chunk: text, provider: 'Gemini' };
          }
          buffer = buffer.slice(endIdx + 1);
        } catch {
          buffer = buffer.slice(endIdx + 1);
        }
      }
    }
  } catch (err) {
    console.error('[VedAI] Gemini stream error:', err);
    throw err;
  }
}

async function* streamOllamaResponse(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  decoder: TextDecoder,
) {
  let buffer = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          if (parsed.done) return;
          if (parsed.message?.content) {
            yield { chunk: parsed.message.content, provider: 'Ollama' };
          }
        } catch { /* skip */ }
      }
    }
  } catch (err) {
    console.error('[VedAI] Ollama stream error:', err);
    throw err;
  }
}

async function tryNonStreaming(
  provider: LLMProvider,
  message: string,
  systemPrompt: string,
): Promise<string | null> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    const controller = new AbortController();
    timeout = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);

    let body: string;
    if (provider.slug === 'gemini') {
      body = JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: message }] }],
        generationConfig: { temperature: 0.7 },
      });
    } else {
      const parsed = JSON.parse(provider.buildBody(message, systemPrompt));
      parsed.stream = false;
      body = JSON.stringify(parsed);
    }

    const url = provider.slug === 'gemini'
      ? `${provider.url.replace(':streamGenerateContent', ':generateContent')}?key=${provider.apiKey}`
      : provider.url;

    const response = await fetch(url, {
      method: 'POST',
      headers: provider.buildHeaders(provider.apiKey || ''),
      body,
      signal: controller.signal,
    });

    clearTimeout(timeout);
    if (!response.ok) return null;

    const data = await response.json();
    if (provider.slug === 'gemini') {
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
    }
    return data?.choices?.[0]?.message?.content || null;
  } catch {
    if (timeout) clearTimeout(timeout);
    return null;
  }
}

function getStaticFallback(chartData?: Record<string, unknown>): string {
  if (chartData) {
    const planets = Array.isArray(chartData.planets) ? chartData.planets : [];
    const summary = (planets as Array<Record<string, unknown>>)
      .filter((p) => p.name)
      .map((p) => `- ${p.name} in ${p.sign || '?'}${p.retrograde ? ' (R)' : ''}`)
      .join('\n');

    return `Namaste! My cosmic channels are temporarily busy, but I can see your birth chart:\n\n${summary || '(Chart data unavailable)'}\n\nPlease try again in a moment for a detailed reading.`;
  }

  return 'Namaste! All AI channels are temporarily busy. Please try again in a moment. You can ask about your birth chart, Lal Kitab remedies, transits, or compatibility.';
}
