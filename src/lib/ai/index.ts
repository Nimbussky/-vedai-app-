// VedAI AI Module — barrel export
export { streamChat } from './engine';
export { VEDAI_SYSTEM_PROMPT, LANGUAGE_INSTRUCTIONS } from './prompts';
export { getActiveProviders, getProvider, getProviderStatus, ALL_PROVIDERS } from './providers';
export type { LLMProvider, ProviderResult } from './providers/types';
