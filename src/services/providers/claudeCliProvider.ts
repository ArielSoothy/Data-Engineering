// Claude CLI provider — routes through local Vite dev server middleware
// No API key required; uses the authenticated `claude` CLI on the host machine.
// Only functional in dev mode (the /api/claude-cli endpoint is not available in production).

import { CONTEXT_PROMPT } from './prompts';
import { generateMockFeedback } from './mockFeedback';

const CLI_ENDPOINT = '/api/claude-cli';

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
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      return generateMockFeedback(userAnswer, correctAnswer);
    }

    return await response.text();
  } catch {
    return generateMockFeedback(userAnswer, correctAnswer);
  }
};
