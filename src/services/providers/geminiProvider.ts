// Gemini provider — uses @google/generative-ai SDK
// API key stored in localStorage key `gemini_api_key`

import { GoogleGenerativeAI } from '@google/generative-ai';
import { CONTEXT_PROMPT } from './prompts';
import { generateMockFeedback } from './mockFeedback';
import { AI_MODELS } from '../../config';

const DEFAULT_MODEL = AI_MODELS.gemini;

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
  const model = import.meta.env.VITE_GEMINI_MODEL || DEFAULT_MODEL;

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

  // If we have a client-side API key, use the SDK directly
  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const geminiModel = genAI.getGenerativeModel({
        model,
        systemInstruction: CONTEXT_PROMPT
      });

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
  }

  // No client-side key — try the serverless proxy (Vercel)
  try {
    const res = await fetch('/api/geminiProxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        system: CONTEXT_PROMPT,
        maxOutputTokens: 800,
        temperature: 0.3,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Proxy returned ${res.status}`);
    }

    const data = await res.json();
    const text = data?.content?.[0]?.text;
    if (text) return text;
    throw new Error('Empty proxy response');
  } catch {
    // Proxy unavailable (e.g. local dev without proxy) — fall back to mock
    return generateMockFeedback(userAnswer, correctAnswer);
  }
};

/** Send a raw prompt without the feedback template wrapper */
export const generateRaw = async (prompt: string): Promise<string> => {
  const apiKey = getGeminiApiKey();
  const model = import.meta.env.VITE_GEMINI_MODEL || DEFAULT_MODEL;

  if (apiKey) {
    const genAI = new GoogleGenerativeAI(apiKey);
    const geminiModel = genAI.getGenerativeModel({ model, systemInstruction: CONTEXT_PROMPT });
    const result = await geminiModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 800 }
    });
    const text = result.response.text();
    if (!text) throw new Error('Empty Gemini response');
    return text;
  }

  // No client-side key — try proxy
  const res = await fetch('/api/geminiProxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, prompt, system: CONTEXT_PROMPT, maxOutputTokens: 800, temperature: 0.3 }),
  });
  if (!res.ok) throw new Error(`Proxy returned ${res.status}`);
  const data = await res.json();
  const text = data?.content?.[0]?.text;
  if (!text) throw new Error('Empty proxy response');
  return text;
};
