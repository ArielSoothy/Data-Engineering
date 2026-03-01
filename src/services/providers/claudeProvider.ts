// Claude provider — extracted from the original claudeApi.ts
// API key stored in localStorage key `claude_api_key`

import axios from 'axios';
import { CONTEXT_PROMPT } from './prompts';
import { generateMockFeedback } from './mockFeedback';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const DEFAULT_MODEL = 'claude-haiku-4-5-20251001';

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
    const response = await axios.post(
      CLAUDE_API_URL,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        timeout: 30000
      }
    );

    if (response.data?.content?.[0]?.text) {
      return response.data.content[0].text;
    }

    throw new Error('Unexpected response format from Claude API');
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Invalid Claude API key. Please check your key in AI Settings.');
      } else if (error.response?.status === 429) {
        throw new Error('Claude rate limit exceeded. Please try again in a moment.');
      } else if (error.response?.status === 400) {
        const errorMessage = (error.response.data as { error?: { message?: string } })?.error?.message || 'Invalid request';
        throw new Error(`Claude API error: ${errorMessage}`);
      } else if (error.response?.status === 404) {
        throw new Error('Claude model not found. Please check the model name.');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout. Please try again.');
      }
      const msg = error.message;
      if (msg.includes('Network Error')) {
        throw new Error('Network error. Please check your internet connection.');
      }
    }

    // Unexpected errors → fall back to mock
    return generateMockFeedback(userAnswer, correctAnswer);
  }
};
