export const APP_NAME = 'DE Prep';
export const INTERVIEW_DATE = new Date('2026-03-31');

export const AI_MODELS = {
  gemini: 'gemini-2.5-flash',
  claude: 'claude-haiku-4-5-20251001',
  groq: 'llama-3.3-70b-versatile',
} as const;

export const DEFAULT_SYNC_CODE = 'my-code-123';

export const CATEGORY_TOTALS: Record<string, number> = {
  sqlBasics: 37,
  sqlAdvanced: 52,
  pythonBasics: 15,
  pythonAdvanced: 43,
  decompositionScenarios: 8,
  metaOfficial: 34,
};
