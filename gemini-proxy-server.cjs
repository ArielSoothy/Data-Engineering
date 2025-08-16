const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

app.use(express.json());

// CORS for local development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

const buildGeminiBody = (reqBody) => {
  const { prompt, system, maxOutputTokens, temperature } = reqBody;
  const parts = [];
  if (system && String(system).trim().length > 0) {
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

app.post('/api/geminiProxy', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not set' });
  }
  try {
    const body = req.body || {};
    const model = body.model || DEFAULT_MODEL;
    const url = `${GEMINI_BASE}/${encodeURIComponent(model)}:generateContent?key=${apiKey}`;
    const geminiBody = buildGeminiBody(body);

    const response = await axios.post(url, geminiBody, {
      headers: { 'Content-Type': 'application/json' }
    });

    const text =
      response.data?.candidates?.[0]?.content?.parts
        ?.map((p) => (typeof p.text === 'string' ? p.text : ''))
        .join('\n') || '';

    res.status(200).json({ content: [{ text }] });
  } catch (err) {
    const status = err.response?.status || 500;
    res.status(status).json({ error: err.message, data: err.response?.data });
  }
});

app.listen(PORT, () => {
  console.log(`Gemini proxy server running on http://localhost:${PORT}/api/geminiProxy`);
});




