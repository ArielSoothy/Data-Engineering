import axios from 'axios';
import { getApiKey } from '../utils/helpers';

// Requests are now proxied through the serverless function
const CLAUDE_API_URL = '/api/claudeProxy';

// Context prompt for interview preparation
const CONTEXT_PROMPT = `You are helping Ariel, a 42-year-old Senior Data Engineer at Nuvei (fintech/payments) prepare for a Microsoft Data Engineer technical interview. 

ARIEL'S BACKGROUND:
- 4 years experience at Nuvei/Simplex (ETL pipelines, Snowflake, DBT, Airflow, Python/SQL)
- Currently taking Google/Reichman AI & Deep Learning course
- Has IDC MBA background, worked at Taboola, eBay before Nuvei
- Salary: 22.5k NIS, aiming for 30k+ at Microsoft
- Lives in Tel Aviv, has 8-month-old baby

TECHNICAL EXPERIENCE:
- Strong: SQL, Python, ETL, data pipelines, fintech domain knowledge
- Current: Learning AI/ML, agents, modern data stack
- Approach: "AI-augmented development" - uses AI tools for implementation while focusing on architecture/problem-solving
- Pattern: Excels at bridging business problems with technical solutions

INTERVIEW CONTEXT:
- 75-minute Microsoft Data Engineer technical test
- Writing code without AI assistance during interview
- Need concise, memorable answers (not long explanations)
- Questions cover: Python, SQL, System Design, Azure, Problem Decomposition
- Microsoft values: system thinking, scalability, business impact

YOUR ROLE AS FEEDBACK PROVIDER:
1. Provide practical, interview-focused feedback
2. Reference Ariel's fintech experience when relevant
3. Keep feedback concise but actionable
4. Focus on what can be improved for interview success
5. Suggest how to better position technical knowledge
6. Point out missing key concepts that Microsoft expects

Be direct, constructive, and focus on interview performance improvement.`;

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

**For Microsoft Interview:**
- This level of detail is perfect for the 75-minute format
- You've covered the technical and business aspects they look for

Keep practicing at this level!`;
  } else if (overallScore > 0.5) {
    return `✅ **Good Foundation, Room for Improvement**

**Strengths:**
- You understand the core concept
- Decent technical approach

**Missing for Microsoft:**
- Add more detail about ${correctKeywords.slice(0, 2).join(', ')}
- Include scalability/production considerations
- Reference your Nuvei experience when relevant

**Next Steps:** Review the complete answer and practice explaining it concisely.`;
  } else {
    return `📚 **Needs More Preparation**

**Key Gaps:**
- Missing fundamental concepts Microsoft expects
- Limited technical depth for senior role
- Need stronger connection to real-world applications

**Study Plan:**
1. Review the core principles in the reference answer
2. Practice explaining with your fintech background
3. Focus on system design thinking Microsoft values

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
    console.log('Calling Claude API...');

    const model = import.meta.env.VITE_CLAUDE_MODEL || 'claude-3-haiku-20240307';

    const payload = {
      model,
      messages: [
        {
          role: 'user',
          content: `**INTERVIEW QUESTION:**
${question}

**CANDIDATE'S ANSWER:**
${userAnswer}

**REFERENCE ANSWER:**
${correctAnswer}

${pseudoCode ? `**REFERENCE CODE:**\n${pseudoCode}` : ''}

**TASK:** Provide concise, actionable feedback on the candidate's answer for Microsoft Data Engineer interview success. Focus on:
1. What's missing or incorrect
2. How to improve for interview setting
3. Connection to candidate's fintech background if relevant
4. Key points Microsoft expects to hear

Keep feedback practical and interview-focused (not academic).`
        }
      ],
      system: CONTEXT_PROMPT,
      max_tokens: 800,
      temperature: 0.3
    };
    
    console.log('Sending request to Claude API...');
    
    console.log('API Request Headers:', {
      contentType: 'application/json'
    });

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

    console.log('Claude API response received:', response.status);
    
    // Simple response handling - Claude's Messages API returns content in a straightforward way
    if (response.data && response.data.content && response.data.content.length > 0) {
      // Extract text from the first content block
      const textContent = response.data.content[0].text;
      console.log('Extracted feedback successfully');
      return textContent;
    }
    
    console.error('Unexpected response format:', response.data);
    throw new Error('Unexpected response format from Claude API');
    
  } catch (error: any) {
    console.error('Error calling Claude API:', error);
    
    if (error.response) {
      console.error('API Error Details:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
      
      // Handle specific error cases with clear messages
      if (error.response.status === 401) {
        console.error('Authentication failed. Check your API key.');
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