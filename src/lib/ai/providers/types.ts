// ============================================
// Unified LLM Provider Interface
// Every provider implements this — drop in new ones easily
// ============================================

export interface LLMProvider {
  name: string;
  slug: string;
  url: string;
  apiKey: string | undefined;
  model: string;
  priority: number;
  supportsStreaming: boolean;
  buildHeaders: (key: string) => Record<string, string>;
  buildBody: (message: string, systemPrompt: string) => string;
  parseStreamChunk: (line: string) => string | null;
}

export interface ProviderResult {
  provider: string;
  ok: boolean;
  error?: string;
}
