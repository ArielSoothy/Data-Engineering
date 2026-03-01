// Groq provider — OpenAI-compatible API, free tier
// API key stored in localStorage key `groq_api_key`

import { CONTEXT_PROMPT } from './prompts';
import { generateMockFeedback } from './mockFeedback';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

interface GroqErrorResponse {
  error?: {
    message?: string;
  };
}

export const getGroqApiKey = (): string | undefined => {
  const envKey = import.meta.env.VITE_GROQ_API_KEY as string | undefined;
  const cleaned = typeof envKey === 'string' ? envKey.replace(/^['"]|['"]$/g, '').trim() : undefined;
  if (cleaned) return cleaned;
  return localStorage.getItem('groq_api_key') || undefined;
};

export const generateFeedback = async (
  question: string,
  userAnswer: string,
  correctAnswer: string,
  pseudoCode?: string
): Promise<string> => {
  const apiKey = getGroqApiKey();

  if (!apiKey) {
    return generateMockFeedback(userAnswer, correctAnswer);
  }

  const model = import.meta.env.VITE_GROQ_MODEL || DEFAULT_MODEL;

  const payload = {
    model,
    messages: [
      {
        role: 'system',
        content: CONTEXT_PROMPT
      },
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
    max_tokens: 800,
    temperature: 0.3
  };

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as GroqErrorResponse;
      if (response.status === 401) {
        throw new Error('Invalid Groq API key. Please check your key in AI Settings.');
      } else if (response.status === 429) {
        throw new Error('Groq rate limit exceeded. Please try again in a moment.');
      } else {
        const msg = errorData.error?.message || response.statusText;
        throw new Error(`Groq API error: ${msg}`);
      }
    }

    const data = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const text = data.choices?.[0]?.message?.content;
    if (!text) {
      throw new Error('Unexpected response format from Groq API');
    }

    return text;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('Groq') || msg.includes('rate limit') || msg.includes('API key')) {
      throw error;
    }
    // Network / parse errors → fall back to mock
    return generateMockFeedback(userAnswer, correctAnswer);
  }
};
