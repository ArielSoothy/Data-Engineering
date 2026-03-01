// Unified AI service — provider-agnostic interface
// Active provider is read from localStorage('ai_provider') or env VITE_AI_PROVIDER, default 'groq'

import * as groqProvider from './providers/groqProvider';
import * as claudeProvider from './providers/claudeProvider';
import * as geminiProvider from './providers/geminiProvider';

export type AIProvider = 'groq' | 'claude' | 'gemini';

export interface AIServiceConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
}

const STORAGE_PROVIDER_KEY = 'ai_provider';

const VALID_PROVIDERS: AIProvider[] = ['groq', 'claude', 'gemini'];

const PROVIDER_API_KEY_MAP: Record<AIProvider, string> = {
  groq: 'groq_api_key',
  claude: 'claude_api_key',
  gemini: 'gemini_api_key'
};

export function getActiveProvider(): AIProvider {
  const stored = localStorage.getItem(STORAGE_PROVIDER_KEY) as AIProvider | null;
  if (stored && VALID_PROVIDERS.includes(stored)) {
    return stored;
  }
  const envProvider = import.meta.env.VITE_AI_PROVIDER as string | undefined;
  if (envProvider && VALID_PROVIDERS.includes(envProvider as AIProvider)) {
    return envProvider as AIProvider;
  }
  return 'groq';
}

export function setActiveProvider(provider: AIProvider): void {
  localStorage.setItem(STORAGE_PROVIDER_KEY, provider);
}

export function getProviderApiKey(provider: AIProvider): string | undefined {
  const storageKey = PROVIDER_API_KEY_MAP[provider];
  return localStorage.getItem(storageKey) || undefined;
}

export function setProviderApiKey(provider: AIProvider, key: string): void {
  const storageKey = PROVIDER_API_KEY_MAP[provider];
  localStorage.setItem(storageKey, key);
}

export async function generateFeedback(
  question: string,
  userAnswer: string,
  correctAnswer: string,
  pseudoCode?: string
): Promise<string> {
  const provider = getActiveProvider();

  switch (provider) {
    case 'groq':
      return groqProvider.generateFeedback(question, userAnswer, correctAnswer, pseudoCode);
    case 'claude':
      return claudeProvider.generateFeedback(question, userAnswer, correctAnswer, pseudoCode);
    case 'gemini':
      return geminiProvider.generateFeedback(question, userAnswer, correctAnswer, pseudoCode);
    default: {
      const _exhaustive: never = provider;
      throw new Error(`Unknown provider: ${_exhaustive}`);
    }
  }
}

// Kept for backward compatibility — estimates are rough averages across all providers
export function estimateAPICredits(tokens: number): number {
  // Approximate cost per 1K tokens in USD (rough average across providers)
  const costPer1KTokens = 0.0005;
  return tokens * costPer1KTokens;
}
