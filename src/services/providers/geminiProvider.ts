// Gemini provider — uses @google/generative-ai SDK
// API key stored in localStorage key `gemini_api_key`

import { GoogleGenerativeAI } from '@google/generative-ai';
import { CONTEXT_PROMPT } from './prompts';
import { generateMockFeedback } from './mockFeedback';

const DEFAULT_MODEL = 'gemini-2.5-flash';

export const getGeminiApiKey = (): string | undefined => {
  const envKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  const cleaned = typeof envKey === 'string' ? envKey.replace(/^['"]|['"]$/g, '').trim() : undefined;
  if (cleaned) return cleaned;
  return localStorage.getItem('gemini_api_key') || undefined;
};

export const generateFeedback = async (
  question: string,
  userAnswer: string,
  correctAnswer: string,
  pseudoCode?: string
): Promise<string> => {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    return generateMockFeedback(userAnswer, correctAnswer);
  }

  const model = import.meta.env.VITE_GEMINI_MODEL || DEFAULT_MODEL;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const geminiModel = genAI.getGenerativeModel({
      model,
      systemInstruction: CONTEXT_PROMPT
    });

    const prompt = `**INTERVIEW QUESTION:**
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

    const result = await geminiModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 800 }
    });
    const text = result.response.text();

    if (!text) {
      throw new Error('Unexpected empty response from Gemini API');
    }

    return text;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('API_KEY_INVALID') || msg.includes('PERMISSION_DENIED')) {
      throw new Error('Invalid Gemini API key. Please check your key in AI Settings.');
    } else if (msg.includes('RESOURCE_EXHAUSTED')) {
      throw new Error('Gemini quota exceeded. Please try again later.');
    }

    // Unexpected errors → fall back to mock
    return generateMockFeedback(userAnswer, correctAnswer);
  }
};
