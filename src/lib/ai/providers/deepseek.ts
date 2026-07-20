import type { LLMProvider } from './types';

// DeepSeek — High-quality reasoning model
export const deepSeekProvider: LLMProvider = {
  name: 'DeepSeek',
  slug: 'deepseek',
  url: 'https://api.deepseek.com/chat/completions',
  apiKey: process.env.DEEPSEEK_API_KEY,
  model: 'deepseek-chat',
  priority: 3,
  supportsStreaming: true,
  buildHeaders: (key) => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${key}`,
  }),
  buildBody: (msg, sys) => JSON.stringify({
    model: 'deepseek-chat',
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
