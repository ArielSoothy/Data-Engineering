import axios from 'axios';
import { getApiKey } from '../utils/helpers';

// Provider selection
const AI_PROVIDER = (import.meta.env.VITE_AI_PROVIDER || 'gemini').toLowerCase();

// Use local proxy in dev, relative path in production
const CLAUDE_API_URL = import.meta.env.DEV
  ? 'http://localhost:3000/api/claudeProxy'
  : '/api/claudeProxy';

const GEMINI_API_URL = import.meta.env.DEV
  ? 'http://localhost:3000/api/geminiProxy'
  : '/api/geminiProxy';

// Import shared context prompt (single source of truth)
import { CONTEXT_PROMPT } from './providers/prompts';

// Generate mock feedback when API key is not available
const generateMockFeedback = (userAnswer: string, correctAnswer: string): string => {
  const userLength = userAnswer.length;
  const correctLength = correctAnswer.length;
  const similarityScore = Math.min(userLength / correctLength, correctLength / userLength);
  
  const correctKeywords = correctAnswer.toLowerCase().split(/\s+/).filter(word => word.length > 4);
  const userKeywords = userAnswer.toLowerCase().split(/\s+/);
  const matchedKeywords = correctKeywords.filter(word => userKeywords.includes(word));
  const keywordScore = correctKeywords.length > 0 ? matchedKeywords.length / correctKeywords.length : 0;
  
  const overallScore = (similarityScore * 0.4) + (keywordScore * 0.6);
  
  if (overallScore > 0.8) {
    return `🎯 **Excellent Answer!**

**Strengths:**
- Complete coverage of key concepts
- Clear technical explanation
- Good interview-ready structure

**For Meta Interview:**
- This level of detail is perfect for the technical screen
- You've covered the technical and business aspects they look for

Keep practicing at this level!`;
  } else if (overallScore > 0.5) {
    return `✅ **Good Foundation, Room for Improvement**

**Strengths:**
- You understand the core concept
- Decent technical approach

**Missing for Meta:**
- Add more detail about ${correctKeywords.slice(0, 2).join(', ')}
- Include scalability/production considerations
- Reference your pipeline/dbt experience when relevant

**Next Steps:** Review the complete answer and practice explaining it concisely.`;
  } else {
    return `📚 **Needs More Preparation**

**Key Gaps:**
- Missing fundamental concepts Meta expects at E5/E6
- Limited technical depth for senior role
- Need stronger connection to real-world applications

**Study Plan:**
1. Review the core principles in the reference answer
2. Practice explaining with your pipeline/dbt experience
3. Focus on system design thinking Meta values

Don't get discouraged - targeted practice will get you there!`;
  }
};

export const generateFeedback = async (
  question: string,
  userAnswer: string,
  correctAnswer: string,
  pseudoCode?: string
): Promise<string> => {


  try {
    const basePrompt = `**INTERVIEW QUESTION:**
${question}

**CANDIDATE'S ANSWER:**
${userAnswer}

**REFERENCE ANSWER:**
${correctAnswer}

${pseudoCode ? `**REFERENCE CODE:**\n${pseudoCode}` : ''}

**TASK:** Provide concise, actionable feedback on the candidate's answer for Meta Senior Data Engineer interview success. Focus on:
1. What's missing or incorrect
2. How to improve for interview setting
3. Connection to candidate's fintech background if relevant
4. Key points Meta expects to hear at E5/E6 level

Keep feedback practical and interview-focused (not academic).`;

    if (AI_PROVIDER === 'gemini') {
      console.log('Calling Gemini API via proxy...');
      const model = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash';
      const response = await axios.post(
        GEMINI_API_URL,
        {
          model,
          prompt: basePrompt,
          system: CONTEXT_PROMPT,
          maxOutputTokens: 800,
          temperature: 0.3
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000
        }
      );

      if (response.data && response.data.content && response.data.content.length > 0) {
        const textContent = response.data.content[0].text;
        return textContent;
      }
      console.error('Unexpected response format from Gemini:', response.data);
      throw new Error('Unexpected response format from Gemini API');
    } else {
      console.log('Calling Claude API via proxy...');
      const model = import.meta.env.VITE_CLAUDE_MODEL || 'claude-3-haiku-20240307';
      const payload = {
        model,
        messages: [
          {
            role: 'user',
            content: basePrompt
          }
        ],
        system: CONTEXT_PROMPT,
        max_tokens: 800,
        temperature: 0.3
      };

      const apiKey = getApiKey();
      const response = await axios.post(
        CLAUDE_API_URL,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            ...(apiKey ? { 'x-api-key': apiKey } : {})
          },
          timeout: 30000
        }
      );

      if (response.data && response.data.content && response.data.content.length > 0) {
        const textContent = response.data.content[0].text;
        return textContent;
      }
      console.error('Unexpected response format from Claude:', response.data);
      throw new Error('Unexpected response format from Claude API');
    }
    
  } catch (error: any) {
    console.error('Error calling AI provider:', error);
    
    if (error.response) {
      console.error('API Error Details:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
      
      // Handle specific error cases with clear messages
      if (error.response.status === 401) {
        console.error('Authentication failed. Check your API key.');
        if (AI_PROVIDER === 'gemini') {
          throw new Error('Invalid API key. Please check your GEMINI_API_KEY in the deployment environment.');
        }
        throw new Error('Invalid API key. Please check your Claude API key in the .env file.');
      } else if (error.response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      } else if (error.response.status === 400) {
        const errorMessage = error.response.data?.error?.message || 'Invalid request';
        console.error('Bad request:', errorMessage);
        throw new Error(`API Error: ${errorMessage}`);
      } else if (error.response.status === 404) {
        throw new Error('Model not found. Please check the model name.');
      }
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please try again.');
    } else if (error.message.includes('Network Error')) {
      throw new Error('Network error. Please check your internet connection.');
    }
    
    // Fallback to mock feedback on API errors
    console.log('Falling back to mock feedback due to API error');
    return generateMockFeedback(userAnswer, correctAnswer);
  }
};

// Function to estimate API costs
export const estimateAPICredits = (questions: number): { 
  inputTokens: number, 
  outputTokens: number, 
  estimatedCost: string 
} => {
  // Approximate token estimation for Claude 3.5 Sonnet
  const avgInputTokensPerCall = 500; 
  const avgOutputTokensPerCall = 200;
  
  const totalInputTokens = questions * avgInputTokensPerCall;
  const totalOutputTokens = questions * avgOutputTokensPerCall;
  
  // Current pricing for Claude 3.5 Sonnet: $3 per 1M input tokens, $15 per 1M output tokens
  const inputCost = (totalInputTokens / 1000000) * 3;
  const outputCost = (totalOutputTokens / 1000000) * 15;
  const totalCost = inputCost + outputCost;
  
  return {
    inputTokens: totalInputTokens,
    outputTokens: totalOutputTokens,
    estimatedCost: `$${totalCost.toFixed(4)} (${questions} questions)`
  };
};