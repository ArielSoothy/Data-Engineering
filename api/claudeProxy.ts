import axios from 'axios';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const CLAUDE_ENDPOINT = 'https://api.anthropic.com/v1/messages';
const DEFAULT_MODEL = process.env.CLAUDE_MODEL || 'claude-3-haiku-20240307';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'CLAUDE_API_KEY is not set' });
    return;
  }

  try {
    const body = { ...req.body, model: req.body.model || DEFAULT_MODEL };
    const response = await axios.post(CLAUDE_ENDPOINT, body, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      }
    });
    res.status(response.status).json(response.data);
  } catch (err: any) {
    const status = err.response?.status || 500;
    res.status(status).json({ error: err.message, data: err.response?.data });
  }
}

export const handler = async (event: any) => {
  if (event.httpMethod && event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'CLAUDE_API_KEY is not set' }) };
  }

  const body = event.body ? JSON.parse(event.body) : {};
  const requestBody = { ...body, model: body.model || DEFAULT_MODEL };

  try {
    const response = await axios.post(CLAUDE_ENDPOINT, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      }
    });
    return { statusCode: response.status, body: JSON.stringify(response.data) };
  } catch (err: any) {
    const status = err.response?.status || 500;
    return { statusCode: status, body: JSON.stringify({ error: err.message, data: err.response?.data }) };
  }
};
