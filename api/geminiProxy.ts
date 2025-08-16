import axios from 'axios';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Gemini generateContent endpoint
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

type GenerateRequest = {
  model?: string;
  prompt: string;
  system?: string;
  maxOutputTokens?: number;
  temperature?: number;
};

const buildGeminiBody = (reqBody: GenerateRequest) => {
  const { prompt, system, maxOutputTokens, temperature } = reqBody;
  const parts: Array<{ text: string }> = [];
  if (system && system.trim().length > 0) {
    parts.push({ text: `SYSTEM:\n${system}\n\n` });
  }
  parts.push({ text: prompt });
  return {
    contents: [
      {
        role: 'user',
        parts
      }
    ],
    generationConfig: {
      maxOutputTokens: maxOutputTokens ?? 800,
      temperature: typeof temperature === 'number' ? temperature : 0.3
    }
  };
};

async function vercelHandler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'GEMINI_API_KEY is not set' });
    return;
  }

  try {
    const body = req.body as GenerateRequest;
    const model = body.model || DEFAULT_MODEL;
    const url = `${GEMINI_BASE}/${encodeURIComponent(model)}:generateContent?key=${apiKey}`;
    const geminiBody = buildGeminiBody(body);

    const response = await axios.post(url, geminiBody, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Normalize to Claude-like shape: { content: [{ text: string }] }
    const text =
      response.data?.candidates?.[0]?.content?.parts
        ?.map((p: any) => (typeof p.text === 'string' ? p.text : ''))
        .join('\n') || '';

    res.status(200).json({ content: [{ text }] });
  } catch (err: any) {
    const status = err.response?.status || 500;
    res.status(status).json({ error: err.message, data: err.response?.data });
  }
}

// Netlify-style compatibility export if needed
export const handler = async (event: any) => {
  if (event.httpMethod && event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'GEMINI_API_KEY is not set' }) };
  }
  try {
    const body: GenerateRequest = event.body ? JSON.parse(event.body) : { prompt: '' };
    const model = body.model || DEFAULT_MODEL;
    const url = `${GEMINI_BASE}/${encodeURIComponent(model)}:generateContent?key=${apiKey}`;
    const geminiBody = buildGeminiBody(body);

    const response = await axios.post(url, geminiBody, {
      headers: { 'Content-Type': 'application/json' }
    });

    const text =
      response.data?.candidates?.[0]?.content?.parts
        ?.map((p: any) => (typeof p.text === 'string' ? p.text : ''))
        .join('\n') || '';

    return { statusCode: 200, body: JSON.stringify({ content: [{ text }] }) };
  } catch (err: any) {
    const status = err.response?.status || 500;
    return { statusCode: status, body: JSON.stringify({ error: err.message, data: err.response?.data }) };
  }
};

export default vercelHandler;
