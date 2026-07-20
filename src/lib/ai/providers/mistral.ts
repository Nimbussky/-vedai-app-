import type { LLMProvider } from './types';

// Mistral — Good quality backup
export const mistralProvider: LLMProvider = {
  name: 'Mistral',
  slug: 'mistral',
  url: 'https://api.mistral.ai/v1/chat/completions',
  apiKey: process.env.MISTRAL_API_KEY,
  model: 'open-mistral-nemo',
  priority: 4,
  supportsStreaming: true,
  buildHeaders: (key) => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${key}`,
  }),
  buildBody: (msg, sys) => JSON.stringify({
    model: 'open-mistral-nemo',
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
