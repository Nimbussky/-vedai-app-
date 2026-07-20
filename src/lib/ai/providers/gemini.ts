import type { LLMProvider } from './types';

// Gemini — Google AI, free tier
export const geminiProvider: LLMProvider = {
  name: 'Gemini',
  slug: 'gemini',
  url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent',
  apiKey: process.env.GEMINI_API_KEY,
  model: 'gemini-2.0-flash',
  priority: 3,
  supportsStreaming: true,
  buildHeaders: () => ({
    'Content-Type': 'application/json',
  }),
  buildBody: (msg, sys) => JSON.stringify({
    system_instruction: { parts: [{ text: sys }] },
    contents: [{ parts: [{ text: msg }] }],
    generationConfig: { temperature: 0.7 },
  }),
  parseStreamChunk: (line) => {
    // Gemini streams JSON array chunks — handled by dedicated parser
    return null;
  },
};
