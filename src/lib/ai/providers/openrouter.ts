import type { LLMProvider } from './types';

// OpenRouter — Gateway to 100+ models, free tiers available
export const openRouterProvider: LLMProvider = {
  name: 'OpenRouter',
  slug: 'openrouter',
  url: 'https://openrouter.ai/api/v1/chat/completions',
  apiKey: process.env.OPENROUTER_API_KEY,
  model: 'meta-llama/llama-3.3-70b-instruct:free',
  priority: 5,
  supportsStreaming: true,
  buildHeaders: (key) => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${key}`,
    'HTTP-Referer': 'https://vedai.app',
    'X-Title': 'VedAI',
  }),
  buildBody: (msg, sys) => JSON.stringify({
    model: 'meta-llama/llama-3.3-70b-instruct:free',
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
