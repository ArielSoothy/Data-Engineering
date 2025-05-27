/**
 * Enhanced Trivia Service for Microsoft Data Engineer Interview Preparation
 * 
 * This service provides intelligent trivia answer generation with multiple strategies:
 * 1. Claude API integration for sophisticated wrong answers (when available)
 * 2. Context-aware fallback generation based on question content
 * 3. Smart wrong answer selection from related questions
 * 
 * Features:
 * - Difficulty-based question filtering
 * - Domain-specific wrong answer generation (SQL vs Python)
 * - Performance analytics and scoring
 * - Realistic distractors that test genuine understanding
 * 
 * @author MS Interview Prep App
 * @version 1.0.0
 */

import { generateFeedback } from './claudeApi';
import type { Question } from '../hooks/useQuestions';

export interface TriviaAnswer {
  id: string;
  text: string;
  isCorrect: boolean;
}

// Generate plausible wrong answers from other questions in the same domain
const generateFallbackAnswers = (question: Question, allQuestions: Question[]): TriviaAnswer[] => {
  const questionText = question.question.toLowerCase();
  
  // Determine question type/domain for better wrong answer selection
  let relatedQuestions = allQuestions.filter(q => q.id !== question.id);
  
  // Try to find questions in same domain/topic
  if (questionText.includes('sql') || questionText.includes('query') || questionText.includes('database')) {
    relatedQuestions = relatedQuestions.filter(q => 
      q.question.toLowerCase().includes('sql') || 
      q.question.toLowerCase().includes('query') || 
      q.question.toLowerCase().includes('database') ||
      q.question.toLowerCase().includes('table')
    );
  } else if (questionText.includes('python') || questionText.includes('pandas') || questionText.includes('dataframe')) {
    relatedQuestions = relatedQuestions.filter(q => 
      q.question.toLowerCase().includes('python') || 
      q.question.toLowerCase().includes('pandas') || 
      q.question.toLowerCase().includes('dataframe') ||
      q.question.toLowerCase().includes('list') ||
      q.question.toLowerCase().includes('dict')
    );
  }
  
  // If we don't have enough related questions, use all questions
  if (relatedQuestions.length < 10) {
    relatedQuestions = allQuestions.filter(q => q.id !== question.id);
  }
  
  // Shuffle and take first few answers as wrong answers
  const shuffled = [...relatedQuestions].sort(() => Math.random() - 0.5);
  
  // Create wrong answers by taking parts of other answers or creating variations
  const wrongAnswers: TriviaAnswer[] = [];
  
  // Strategy 1: Use shortened/modified versions of other answers
  for (let i = 0; i < Math.min(2, shuffled.length); i++) {
    const otherQuestion = shuffled[i];
    let wrongAnswer = otherQuestion.answer;
    
    // Shorten if too long
    if (wrongAnswer.length > 200) {
      wrongAnswer = wrongAnswer.split('.')[0] + '.';
    }
    
    // Make it slightly different to avoid being obviously wrong
    if (questionText.includes('difference') && wrongAnswer.includes('difference')) {
      wrongAnswer = wrongAnswer.replace(/difference/gi, 'similarity');
    }
    
    wrongAnswers.push({
      id: `wrong_${i + 1}`,
      text: wrongAnswer,
      isCorrect: false
    });
  }
  
  // Strategy 2: Generate context-aware wrong answers
  if (wrongAnswers.length < 2) {
    const contextualWrongAnswers = generateContextualWrongAnswers(question);
    wrongAnswers.push(...contextualWrongAnswers.slice(0, 2 - wrongAnswers.length));
  }
  
  // Ensure we have exactly 2 wrong answers
  while (wrongAnswers.length < 2) {
    wrongAnswers.push({
      id: `fallback_${wrongAnswers.length + 1}`,
      text: `This is not the correct answer. ${question.answer.split('.')[0]} is not accurate.`,
      isCorrect: false
    });
  }
  
  // Add the correct answer
  const correctAnswer: TriviaAnswer = {
    id: 'correct',
    text: question.answer,
    isCorrect: true
  };
  
  return [correctAnswer, ...wrongAnswers.slice(0, 2)];
};

// Generate context-aware wrong answers based on question type
const generateContextualWrongAnswers = (question: Question): TriviaAnswer[] => {
  const questionText = question.question.toLowerCase();
  const wrongAnswers: TriviaAnswer[] = [];
  
  // SQL-specific wrong answers
  if (questionText.includes('sql') || questionText.includes('query') || questionText.includes('database')) {
    if (questionText.includes('join')) {
      wrongAnswers.push({
        id: 'wrong_sql_1',
        text: 'INNER JOIN combines all rows from both tables regardless of matching conditions, while OUTER JOIN only returns matching rows.',
        isCorrect: false
      });
    } else if (questionText.includes('index')) {
      wrongAnswers.push({
        id: 'wrong_sql_2',
        text: 'Indexes slow down query performance by creating additional overhead for data retrieval operations.',
        isCorrect: false
      });
    } else if (questionText.includes('normalization')) {
      wrongAnswers.push({
        id: 'wrong_sql_3',
        text: 'Normalization increases data redundancy to improve query performance and reduce storage requirements.',
        isCorrect: false
      });
    }
  }
  
  // Python-specific wrong answers
  if (questionText.includes('python') || questionText.includes('pandas') || questionText.includes('list')) {
    if (questionText.includes('list') && questionText.includes('tuple')) {
      wrongAnswers.push({
        id: 'wrong_python_1',
        text: 'Lists are immutable while tuples are mutable, making lists better for data that needs to change frequently.',
        isCorrect: false
      });
    } else if (questionText.includes('pandas')) {
      wrongAnswers.push({
        id: 'wrong_python_2',
        text: 'Pandas DataFrames can only store one data type per DataFrame, unlike NumPy arrays which support mixed types.',
        isCorrect: false
      });
    } else if (questionText.includes('exception')) {
      wrongAnswers.push({
        id: 'wrong_python_3',
        text: 'Python exceptions should always be caught using a generic except clause to handle all possible errors.',
        isCorrect: false
      });
    }
  }
  
  // Generic wrong answers if we don't have specific ones
  if (wrongAnswers.length === 0) {
    wrongAnswers.push(
      {
        id: 'wrong_generic_1',
        text: 'This approach is deprecated and should not be used in modern development practices.',
        isCorrect: false
      },
      {
        id: 'wrong_generic_2',
        text: 'The opposite of the correct answer - this is commonly confused but incorrect.',
        isCorrect: false
      }
    );
  }
  
  return wrongAnswers;
};

// Enhanced answer generation using Claude API (optional)
const generateEnhancedAnswers = async (question: Question): Promise<TriviaAnswer[]> => {
  try {
    // Create a prompt for generating realistic wrong answers
    const prompt = `Generate 2 plausible but incorrect answers for this technical interview question. Make them believable but clearly wrong to someone who knows the topic.

Question: ${question.question}
Correct Answer: ${question.answer}

The wrong answers should:
1. Be related to the topic but contain subtle errors
2. Be roughly the same length as the correct answer
3. Sound professional and technical
4. Avoid being obviously wrong

Format your response as:
WRONG ANSWER 1: [answer]
WRONG ANSWER 2: [answer]`;

    const response = await generateFeedback(
      question.question,
      prompt,
      question.answer,
      question.pseudoCode
    );

    // Parse the response to extract wrong answers
    const wrongAnswers: TriviaAnswer[] = [];
    const lines = response.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      if (line.includes('WRONG ANSWER 1:')) {
        wrongAnswers.push({
          id: 'wrong_ai_1',
          text: line.replace(/^.*WRONG ANSWER 1:\s*/, '').trim(),
          isCorrect: false
        });
      } else if (line.includes('WRONG ANSWER 2:')) {
        wrongAnswers.push({
          id: 'wrong_ai_2',
          text: line.replace(/^.*WRONG ANSWER 2:\s*/, '').trim(),
          isCorrect: false
        });
      }
    }

    // If we successfully got 2 wrong answers from AI, use them
    if (wrongAnswers.length >= 2) {
      const correctAnswer: TriviaAnswer = {
        id: 'correct',
        text: question.answer,
        isCorrect: true
      };
      
      return [correctAnswer, ...wrongAnswers.slice(0, 2)];
    }
    
    // Otherwise fall back to our logic
    throw new Error('Could not parse AI response');
    
  } catch (error) {
    console.log('Claude API not available, using fallback answer generation');
    // Signal that we should use fallback
    throw error;
  }
};

// Main function to generate trivia answers
export const generateTriviaAnswers = async (
  question: Question, 
  allQuestions: Question[]
): Promise<TriviaAnswer[]> => {
  // Try enhanced (Claude API) generation first
  try {
    const enhancedAnswers = await generateEnhancedAnswers(question);
    if (enhancedAnswers) {
      console.log('✨ Generated enhanced trivia answers using Claude API');
      return enhancedAnswers;
    }
  } catch (error) {
    console.log('Claude API unavailable, using fallback method');
  }
  
  // Fall back to our smart logic-based generation
  console.log('📚 Generated trivia answers using fallback logic');
  return generateFallbackAnswers(question, allQuestions);
};

// Utility to validate trivia answers
export const validateTriviaAnswers = (answers: TriviaAnswer[]): boolean => {
  if (answers.length !== 3) return false;
  
  const correctAnswers = answers.filter(a => a.isCorrect);
  const wrongAnswers = answers.filter(a => !a.isCorrect);
  
  return correctAnswers.length === 1 && wrongAnswers.length === 2;
};
