// Gemini CLI provider — routes through local Vite dev server middleware
// No API key required; uses the authenticated `gemini` CLI on the host machine.
// Only functional in dev mode (the /api/gemini-cli endpoint is not available in production).

import { CONTEXT_PROMPT } from './prompts';
import { generateMockFeedback } from './mockFeedback';

const CLI_ENDPOINT = '/api/gemini-cli';

function getCliModel(): string {
  return localStorage.getItem('gemini_cli_model')
    || (import.meta.env.VITE_GEMINI_CLI_MODEL as string | undefined)
    || '';
}

export const generateFeedback = async (
  question: string,
  userAnswer: string,
  correctAnswer: string,
  pseudoCode?: string
): Promise<string> => {
  try {
    const prompt = `${CONTEXT_PROMPT}

**INTERVIEW QUESTION:**
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

Keep feedback practical and interview-focused (not academic).`;

    const response = await fetch(CLI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, model: getCliModel() })
    });

    if (!response.ok) {
      return generateMockFeedback(userAnswer, correctAnswer);
    }

    return await response.text();
  } catch {
    return generateMockFeedback(userAnswer, correctAnswer);
  }
};

/** Send a raw prompt without the feedback template wrapper */
export const generateRaw = async (prompt: string): Promise<string> => {
  const fullPrompt = `${CONTEXT_PROMPT}\n\n${prompt}`;
  const response = await fetch(CLI_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: fullPrompt, model: getCliModel() })
  });

  if (!response.ok) {
    throw new Error(`CLI returned ${response.status}`);
  }

  return await response.text();
};
