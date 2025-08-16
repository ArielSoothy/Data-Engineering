const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const CLAUDE_ENDPOINT = 'https://api.anthropic.com/v1/messages';
const DEFAULT_MODEL = process.env.CLAUDE_MODEL || 'claude-3-haiku-20240307';

app.use(express.json());

// CORS for local development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // For dev only!
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-api-key');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.post('/api/claudeProxy', async (req, res) => {
  const apiKey = req.headers['x-api-key'] || process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'CLAUDE_API_KEY is not set' });
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
  } catch (err) {
    const status = err.response?.status || 500;
    res.status(status).json({ error: err.message, data: err.response?.data });
  }
});

app.listen(PORT, () => {
  console.log(`Claude proxy server running on http://localhost:${PORT}/api/claudeProxy`);
}); 