import type { LLMProvider } from './types';

// Ollama Local — Zero cost, runs on user's machine
// Users can self-host with: ollama serve && ollama pull llama3.3
export const ollamaProvider: LLMProvider = {
  name: 'Ollama',
  slug: 'ollama',
  url: `${process.env.OLLAMA_BASE_URL || 'http://localhost:11434'}/api/chat`,
  getApiKey: () => 'local',
  model: 'llama3.3',
  priority: 10,
  supportsStreaming: true,
  buildHeaders: () => ({
    'Content-Type': 'application/json',
  }),
  buildBody: (msg, sys) => JSON.stringify({
    model: 'llama3.3',
    messages: [
      { role: 'system', content: sys },
      { role: 'user', content: msg },
    ],
    stream: true,
  }),
  parseStreamChunk: (line) => {
    try {
      const parsed = JSON.parse(line);
      if (parsed.done) return '__DONE__';
      return parsed.message?.content || null;
    } catch {
      return null;
    }
  },
};
