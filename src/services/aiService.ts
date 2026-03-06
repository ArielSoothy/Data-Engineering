// Unified AI service — provider-agnostic interface
// Active provider is read from localStorage('ai_provider') or env VITE_AI_PROVIDER, default 'groq'

import * as groqProvider from './providers/groqProvider';
import * as claudeProvider from './providers/claudeProvider';
import * as geminiProvider from './providers/geminiProvider';
import * as claudeCliProvider from './providers/claudeCliProvider';

export type AIProvider = 'groq' | 'claude' | 'gemini' | 'claude-cli';

export interface AIServiceConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
}

const STORAGE_PROVIDER_KEY = 'ai_provider';

const VALID_PROVIDERS: AIProvider[] = ['groq', 'claude', 'gemini', 'claude-cli'];

const PROVIDER_API_KEY_MAP: Record<AIProvider, string> = {
  groq: 'groq_api_key',
  claude: 'claude_api_key',
  gemini: 'gemini_api_key',
  'claude-cli': ''
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

export function getProviderApiKey(provider: AIProvider): string {
  if (provider === 'claude-cli') return '';
  const storageKey = PROVIDER_API_KEY_MAP[provider];
  return localStorage.getItem(storageKey) ?? '';
}

export function setProviderApiKey(provider: AIProvider, key: string): void {
  const storageKey = PROVIDER_API_KEY_MAP[provider];
  if (storageKey) {
    localStorage.setItem(storageKey, key);
  }
}

async function callProvider(
  provider: AIProvider,
  question: string,
  userAnswer: string,
  correctAnswer: string,
  pseudoCode?: string
): Promise<string> {
  switch (provider) {
    case 'groq':
      return groqProvider.generateFeedback(question, userAnswer, correctAnswer, pseudoCode);
    case 'claude':
      return claudeProvider.generateFeedback(question, userAnswer, correctAnswer, pseudoCode);
    case 'gemini':
      return geminiProvider.generateFeedback(question, userAnswer, correctAnswer, pseudoCode);
    case 'claude-cli':
      return claudeCliProvider.generateFeedback(question, userAnswer, correctAnswer, pseudoCode);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

async function callProviderRaw(provider: AIProvider, prompt: string): Promise<string> {
  switch (provider) {
    case 'groq':
      return groqProvider.generateRaw(prompt);
    case 'claude':
      return claudeProvider.generateRaw(prompt);
    case 'gemini':
      return geminiProvider.generateRaw(prompt);
    case 'claude-cli':
      return claudeCliProvider.generateRaw(prompt);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

/** Which provider actually served the last request */
let _lastProvider: AIProvider | null = null;
export function getLastUsedProvider(): AIProvider | null { return _lastProvider; }

export async function generateFeedback(
  question: string,
  userAnswer: string,
  correctAnswer: string,
  pseudoCode?: string
): Promise<string> {
  const provider = getActiveProvider();

  try {
    const result = await callProvider(provider, question, userAnswer, correctAnswer, pseudoCode);
    _lastProvider = provider;
    return result;
  } catch (err) {
    // If primary provider fails and it wasn't already gemini, try gemini as fallback
    if (provider !== 'gemini') {
      try {
        const result = await callProvider('gemini', question, userAnswer, correctAnswer, pseudoCode);
        _lastProvider = 'gemini';
        return result;
      } catch {
        // Gemini fallback also failed — rethrow original error
      }
    }
    throw err;
  }
}

// Kept for backward compatibility — estimates are rough averages across all providers
export function estimateAPICredits(tokens: number): number {
  // Approximate cost per 1K tokens in USD (rough average across providers)
  const costPer1KTokens = 0.0005;
  return tokens * costPer1KTokens;
}

// ---------------------------------------------------------------------------
// Adaptive question generation
// ---------------------------------------------------------------------------

export interface AdaptiveQuestion {
  question: string;
  answer: string;
  pseudoCode: string;
  hints: string[];
}

export async function generateAdaptiveQuestion(
  subject: 'sql' | 'python',
  level: 1 | 2 | 3,
  answeredQuestions: string[]
): Promise<AdaptiveQuestion> {
  const difficulty = level === 1 ? 'Easy' : level === 2 ? 'Medium' : 'Hard';
  const prompt = `Generate a ${difficulty} ${subject.toUpperCase()} question for a Meta Data Engineer interview.

Meta context: Use realistic schemas like user_events(user_id, event_type, event_ts), ad_impressions(impression_id, user_id, campaign_id, revenue), friend_graph(user_id, friend_id).

Already-seen questions to avoid: ${answeredQuestions.length > 0 ? answeredQuestions.slice(0, 5).join('; ') : 'none'}

Return EXACTLY this format (no extra text):
QUESTION: [the question]
ANSWER: [complete answer, 2-4 sentences]
CODE: [SQL or Python code example]
HINT1: [first hint - conceptual direction]
HINT2: [second hint - more specific]
HINT3: [third hint - near-solution]`;

  const provider = getActiveProvider();

  try {
    const raw = await callProviderRaw(provider, prompt);
    _lastProvider = provider;
    return parseAdaptiveQuestion(raw);
  } catch {
    if (provider !== 'gemini') {
      try {
        const raw = await callProviderRaw('gemini', prompt);
        _lastProvider = 'gemini';
        return parseAdaptiveQuestion(raw);
      } catch { /* fall through */ }
    }
    return fallbackAdaptiveQuestion(subject, level);
  }
}

function parseAdaptiveQuestion(raw: string): AdaptiveQuestion {
  const question = raw.match(/QUESTION:\s*(.+?)(?=ANSWER:|$)/s)?.[1]?.trim() ?? '';
  const answer = raw.match(/ANSWER:\s*(.+?)(?=CODE:|HINT1:|$)/s)?.[1]?.trim() ?? '';
  const pseudoCode = raw.match(/CODE:\s*(.+?)(?=HINT1:|$)/s)?.[1]?.trim() ?? '';
  const hint1 = raw.match(/HINT1:\s*(.+?)(?=HINT2:|$)/s)?.[1]?.trim() ?? '';
  const hint2 = raw.match(/HINT2:\s*(.+?)(?=HINT3:|$)/s)?.[1]?.trim() ?? '';
  const hint3 = raw.match(/HINT3:\s*(.+?)$/s)?.[1]?.trim() ?? '';
  const parsed = { question, answer, pseudoCode, hints: [hint1, hint2, hint3].filter(Boolean) };
  // If the AI didn't follow the format, the question will be empty — treat as parse failure
  if (!parsed.question) throw new Error('Parse failed: empty question');
  return parsed;
}

function fallbackAdaptiveQuestion(subject: 'sql' | 'python', level: 1 | 2 | 3): AdaptiveQuestion {
  if (subject === 'sql') {
    return {
      question: level === 1
        ? 'Write a query to count distinct active users per day from user_events(user_id, event_type, event_ts).'
        : level === 2
        ? 'Calculate the 7-day rolling retention rate for users who signed up in the past month.'
        : 'Implement sessionization: group user events into sessions where a session ends after 30 minutes of inactivity.',
      answer: 'Use window functions and date truncation to aggregate events by day, then apply DISTINCT counting.',
      pseudoCode: level === 1
        ? "SELECT DATE_TRUNC('day', event_ts) AS day, COUNT(DISTINCT user_id) AS dau\nFROM user_events\nGROUP BY 1\nORDER BY 1;"
        : "SELECT user_id, event_ts,\n  SUM(is_new_session) OVER (PARTITION BY user_id ORDER BY event_ts) AS session_id\nFROM (\n  SELECT *, CASE WHEN event_ts - LAG(event_ts) OVER (PARTITION BY user_id ORDER BY event_ts) > INTERVAL '30 minutes' THEN 1 ELSE 0 END AS is_new_session\n  FROM user_events\n) t;",
      hints: ['Think about which aggregation window to use', 'Consider LAG() for time gaps', 'Use CASE WHEN to flag session boundaries']
    };
  }
  return {
    question: level === 1
      ? 'Write a pandas function to compute a 7-day rolling average of daily active users.'
      : level === 2
      ? 'Implement a function to deduplicate events keeping the most recent per (user_id, event_type).'
      : 'Write a memory-efficient pipeline to process 100M row event logs using pandas chunked reading.',
    answer: 'Use pandas rolling() with window=7 and min_periods=1 for the rolling average.',
    pseudoCode: level === 1
      ? "df['rolling_dau'] = df['dau'].rolling(window=7, min_periods=1).mean()"
      : "df = df.sort_values('event_ts').drop_duplicates(subset=['user_id', 'event_type'], keep='last')",
    hints: ['Think about the pandas window function API', 'Sort before deduplication', 'Use chunksize parameter in read_csv']
  };
}

// ---------------------------------------------------------------------------
// Question breakdown (Explain tab)
// ---------------------------------------------------------------------------

export interface QuestionBreakdown {
  explanation: string;
  steps: string;
}

export async function generateQuestionBreakdown(
  question: string,
  answer: string,
  pseudoCode?: string
): Promise<QuestionBreakdown> {
  const prompt = `Explain this interview question concisely. Be direct — no filler.

You MUST use these exact markers in your response:

BREAKDOWN:
1-2 sentences: What is this asking? (plain English, no jargon)
Then 2-3 bullet points: key rules/constraints the interviewer expects you to know.

SOLUTION:
Lead with the direct answer in 1-2 sentences.
Then numbered steps (max 4-5) showing HOW, with a short code example if relevant.
Keep total response under 300 words.

Question: ${question}
Answer: ${answer}
${pseudoCode ? `Code:\n${pseudoCode}` : ''}`;

  const provider = getActiveProvider();

  let raw: string;
  try {
    raw = await callProviderRaw(provider, prompt);
    _lastProvider = provider;
  } catch {
    if (provider !== 'gemini') {
      try {
        raw = await callProviderRaw('gemini', prompt);
        _lastProvider = 'gemini';
      } catch {
        return { explanation: '', steps: '' };
      }
    } else {
      return { explanation: '', steps: '' };
    }
  }

  const breakdownMatch = raw.match(/BREAKDOWN:\s*(.+?)(?=SOLUTION:|$)/s);
  const solutionMatch = raw.match(/SOLUTION:\s*(.+?)$/s);

  if (!breakdownMatch && !solutionMatch) {
    return { explanation: '', steps: raw.trim() };
  }

  return {
    explanation: breakdownMatch?.[1]?.trim() ?? '',
    steps: solutionMatch?.[1]?.trim() ?? '',
  };
}

// ---------------------------------------------------------------------------
// Step-by-step hint generation
// ---------------------------------------------------------------------------

export async function generateStepByStep(
  question: string,
  subject: 'sql' | 'python'
): Promise<string[]> {
  const prompt = `For this ${subject.toUpperCase()} interview question: "${question}"

Provide exactly 3 hints that progressively guide toward the solution without giving it away.
Return EXACTLY:
HINT1: [conceptual direction - what approach to think about]
HINT2: [more specific - which function/clause/technique to use]
HINT3: [near-solution - the key insight or structure]`;

  const provider = getActiveProvider();

  try {
    const raw = await callProviderRaw(provider, prompt);
    _lastProvider = provider;
    const h1 = raw.match(/HINT1:\s*(.+?)(?=HINT2:|$)/s)?.[1]?.trim() ?? '';
    const h2 = raw.match(/HINT2:\s*(.+?)(?=HINT3:|$)/s)?.[1]?.trim() ?? '';
    const h3 = raw.match(/HINT3:\s*(.+?)$/s)?.[1]?.trim() ?? '';
    const hints = [h1, h2, h3].filter(Boolean);
    if (hints.length > 0) return hints;
    throw new Error('No hints parsed');
  } catch {
    if (provider !== 'gemini') {
      try {
        const raw = await callProviderRaw('gemini', prompt);
        _lastProvider = 'gemini';
        const h1 = raw.match(/HINT1:\s*(.+?)(?=HINT2:|$)/s)?.[1]?.trim() ?? '';
        const h2 = raw.match(/HINT2:\s*(.+?)(?=HINT3:|$)/s)?.[1]?.trim() ?? '';
        const h3 = raw.match(/HINT3:\s*(.+?)$/s)?.[1]?.trim() ?? '';
        const hints = [h1, h2, h3].filter(Boolean);
        if (hints.length > 0) return hints;
      } catch { /* fall through to defaults */ }
    }
    return ['Think about the data structure needed', 'Consider using a window function', 'Group by the key dimension first'];
  }
}
