import type { LLMProvider } from './types';

// Groq — Ultra-fast inference on Llama models, free tier
export const groqProvider: LLMProvider = {
  name: 'Groq',
  slug: 'groq',
  url: 'https://api.groq.com/openai/v1/chat/completions',
  apiKey: process.env.GROQ_API_KEY,
  model: 'llama-3.3-70b-versatile',
  priority: 2,
  supportsStreaming: true,
  buildHeaders: (key) => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${key}`,
  }),
  buildBody: (msg, sys) => JSON.stringify({
    model: 'llama-3.3-70b-versatile',
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
