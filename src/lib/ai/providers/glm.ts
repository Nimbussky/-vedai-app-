import type { LLMProvider } from './types';

// GLM / Zhipu AI — PRIMARY backbone. Free tier is generous.
export const glmProvider: LLMProvider = {
  name: 'GLM',
  slug: 'glm',
  url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
  getApiKey: () => process.env.GLM_API_KEY,
  model: 'glm-4-flash',
  priority: 1,
  supportsStreaming: true,
  buildHeaders: (key) => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${key}`,
  }),
  buildBody: (msg, sys) => JSON.stringify({
    model: 'glm-4-flash',
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
