// Claude provider — extracted from the original claudeApi.ts
// API key stored in localStorage key `claude_api_key`

import { CONTEXT_PROMPT } from './prompts';
import { generateMockFeedback } from './mockFeedback';
import { AI_MODELS } from '../../config';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const DEFAULT_MODEL = AI_MODELS.claude;

export const getClaudeApiKey = (): string | undefined => {
  const envKey = import.meta.env.VITE_CLAUDE_API_KEY as string | undefined;
  const cleaned = typeof envKey === 'string' ? envKey.replace(/^['"]|['"]$/g, '').trim() : undefined;
  if (cleaned) return cleaned;
  return localStorage.getItem('claude_api_key') || undefined;
};

export const generateFeedback = async (
  question: string,
  userAnswer: string,
  correctAnswer: string,
  pseudoCode?: string
): Promise<string> => {
  const apiKey = getClaudeApiKey();

  if (!apiKey) {
    return generateMockFeedback(userAnswer, correctAnswer);
  }

  const model = import.meta.env.VITE_CLAUDE_MODEL || DEFAULT_MODEL;

  const payload = {
    model,
    messages: [
      {
        role: 'user',
        content: `**INTERVIEW QUESTION:**
${question}

**CANDIDATE'S ANSWER:**
${userAnswer}

**REFERENCE ANSWER:**
${correctAnswer}

${pseudoCode ? `**REFERENCE CODE:**\n${pseudoCode}` : ''}

**TASK:** Provide concise, actionable feedback on the candidate's answer for Meta Senior Data Engineer interview success. Focus on:
1. What's missing or incorrect
2. How to improve for interview setting
3. Connection to candidate's pipeline/dbt experience if relevant
4. Key points Meta expects to hear at E5/E6 level

Keep feedback practical and interview-focused (not academic).`
      }
    ],
    system: CONTEXT_PROMPT,
    max_tokens: 800,
    temperature: 0.3
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 401) throw new Error('Invalid Claude API key. Please check your key in AI Settings.');
      if (response.status === 429) throw new Error('Claude rate limit exceeded. Please try again in a moment.');
      if (response.status === 404) throw new Error('Claude model not found. Please check the model name.');
      if (response.status === 400) {
        const errData = await response.json().catch(() => ({}));
        const errorMessage = (errData as { error?: { message?: string } })?.error?.message || 'Invalid request';
        throw new Error(`Claude API error: ${errorMessage}`);
      }
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    if (data?.content?.[0]?.text) {
      return data.content[0].text;
    }

    throw new Error('Unexpected response format from Claude API');
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Request timeout. Please try again.');
    }
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your internet connection.');
    }
    if (error instanceof Error && error.message.startsWith('Claude')) {
      throw error;
    }
    return generateMockFeedback(userAnswer, correctAnswer);
  }
};

/** Send a raw prompt without the feedback template wrapper */
export const generateRaw = async (prompt: string): Promise<string> => {
  const apiKey = getClaudeApiKey();
  if (!apiKey) throw new Error('No Claude API key');

  const model = import.meta.env.VITE_CLAUDE_MODEL || DEFAULT_MODEL;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      system: CONTEXT_PROMPT,
      max_tokens: 800,
      temperature: 0.3
    }),
    signal: controller.signal
  });

  clearTimeout(timeoutId);

  if (!response.ok) throw new Error(`Claude API error: ${response.status}`);
  const data = await response.json();
  const text = data?.content?.[0]?.text;
  if (!text) throw new Error('Empty Claude response');
  return text;
};
