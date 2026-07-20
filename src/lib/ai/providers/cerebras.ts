import type { LLMProvider } from './types';

// Cerebras — Ultra-fast inference, free tier
export const cerebrasProvider: LLMProvider = {
  name: 'Cerebras',
  slug: 'cerebras',
  url: 'https://api.cerebras.ai/v1/chat/completions',
  apiKey: process.env.CEREBRAS_API_KEY,
  model: 'llama-4-scout-17b-16e-instruct',
  priority: 2,
  supportsStreaming: true,
  buildHeaders: (key) => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${key}`,
  }),
  buildBody: (msg, sys) => JSON.stringify({
    model: 'llama-4-scout-17b-16e-instruct',
    messages: [
      { role: 'system', content: sys },
      { role: 'user', content: msg },
    ],
    temperature: 0.7,
    stream: true,
  }),
  parseStreamChunk: (line) => {
    const trimmed = line.trim();
    if (!trimmed.startsWith('data: ')) return null;
    const data = trimmed.slice(6);
    if (data === '[DONE]') return '__DONE__';
    try {
      const parsed = JSON.parse(data);
      return parsed.choices?.[0]?.delta?.content || null;
    } catch {
      return null;
    }
  },
};
