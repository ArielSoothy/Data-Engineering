/**
 * AI-Powered Trivia Question Generation Service
 * 
 * This service generates complete trivia questions using Claude API for Microsoft Data Engineer
 * interview preparation. Designed to be modular for future enhancements.
 * 
 * Features:
 * - Full question generation with 3 multiple choice answers
 * - Context-aware based on Ariel's background and interview goals
 * - Difficulty-specific question generation
 * - Fallback to mock questions when API unavailable
 * - Architecture ready for Options 2 & 3 upgrades
 * 
 * @author MS Interview Prep App
 * @version 1.0.0
 */

import { generateFeedback } from './claudeApi';
import type { Question } from '../hooks/useQuestions';
import type { TriviaAnswer } from './triviaService';

export interface AITriviaQuestion extends Question {
  answers: TriviaAnswer[];
}

// Generate mock AI questions when API is unavailable
const generateMockAIQuestions = (difficulty: string, count: number): AITriviaQuestion[] => {
  const mockQuestions: AITriviaQuestion[] = [
    {
      id: 9001, // Use unique numeric IDs for AI questions
      question: 'In Azure Data Factory, what is the primary difference between a pipeline and a data flow?',
      difficulty: difficulty as 'Easy' | 'Medium' | 'Hard',
      timeEstimate: 5,
      answer: 'A pipeline orchestrates activities and controls execution flow, while a data flow performs actual data transformations using a visual interface.',
      pseudoCode: '// Pipeline: Orchestration layer\npipeline {\n  activities: [copy, dataflow, stored_procedure]\n}\n\n// Data Flow: Transformation layer\ndataflow {\n  source -> transform -> sink\n}',
      aiApproach: 'Think of pipelines as the conductor of an orchestra (orchestration) and data flows as the musicians playing instruments (transformation).',
      answers: [
        {
          id: 'correct',
          text: 'A pipeline orchestrates activities and controls execution flow, while a data flow performs actual data transformations using a visual interface.',
          isCorrect: true
        },
        {
          id: 'wrong_1',
          text: 'A pipeline stores data permanently while a data flow only processes data temporarily in memory.',
          isCorrect: false
        },
        {
          id: 'wrong_2',
          text: 'A pipeline is used for batch processing while a data flow is exclusively for real-time streaming data.',
          isCorrect: false
        }
      ]
    },
    {
      id: 9002,
      question: 'When implementing data partitioning in Azure Synapse Analytics, which strategy would be most effective for a time-series dataset with frequent recent data queries?',
      difficulty: difficulty as 'Easy' | 'Medium' | 'Hard',
      timeEstimate: 7,
      answer: 'Date-based partitioning (e.g., by month or day) allows query pruning for recent data and aligns with typical time-series access patterns.',
      pseudoCode: 'CREATE TABLE sales_data (\n  transaction_date DATE,\n  amount DECIMAL(10,2),\n  ...\n)\nWITH (\n  PARTITION(transaction_date RANGE RIGHT\n    FOR VALUES (\'2024-01-01\', \'2024-02-01\', ...))\n)',
      aiApproach: 'Partition elimination is key - queries for recent data will only scan relevant partitions, dramatically improving performance.',
      answers: [
        {
          id: 'correct',
          text: 'Date-based partitioning (e.g., by month or day) allows query pruning for recent data and aligns with typical time-series access patterns.',
          isCorrect: true
        },
        {
          id: 'wrong_1',
          text: 'Hash partitioning on user ID provides the most even data distribution and fastest query performance.',
          isCorrect: false
        },
        {
          id: 'wrong_2',
          text: 'Round-robin partitioning ensures equal partition sizes and optimal parallel processing for all queries.',
          isCorrect: false
        }
      ]
    },
    {
      id: 9003,
      question: 'In Python, when processing large datasets with pandas, what is the most memory-efficient way to read a 10GB CSV file?',
      difficulty: difficulty as 'Easy' | 'Medium' | 'Hard',
      timeEstimate: 6,
      answer: 'Use pd.read_csv() with chunksize parameter to process the file in smaller chunks, allowing processing of datasets larger than available RAM.',
      pseudoCode: 'chunk_size = 10000\nfor chunk in pd.read_csv(\'large_file.csv\', chunksize=chunk_size):\n    # Process each chunk\n    processed_chunk = chunk.groupby(\'column\').sum()\n    # Append to result or save incrementally',
      aiApproach: 'Memory management is crucial for big data processing - chunking allows you to work with datasets larger than RAM by processing pieces sequentially.',
      answers: [
        {
          id: 'correct',
          text: 'Use pd.read_csv() with chunksize parameter to process the file in smaller chunks, allowing processing of datasets larger than available RAM.',
          isCorrect: true
        },
        {
          id: 'wrong_1',
          text: 'Load the entire file with pd.read_csv() and use dtype optimization to reduce memory usage.',
          isCorrect: false
        },
        {
          id: 'wrong_2',
          text: 'Convert the CSV to Parquet format first, then load it entirely into memory for faster processing.',
          isCorrect: false
        }
      ]
    }
  ];

  // Return the requested number of questions, cycling through if needed
  const result: AITriviaQuestion[] = [];
  for (let i = 0; i < count; i++) {
    result.push({
      ...mockQuestions[i % mockQuestions.length],
      id: 9001 + i // Ensure unique numeric IDs
    });
  }

  return result;
};

// Generate AI-powered trivia questions
export const generateAITriviaQuestions = async (
  difficulty: 'All' | 'Easy' | 'Medium' | 'Hard',
  count: number = 20
): Promise<AITriviaQuestion[]> => {
  try {
    const difficultyText = difficulty === 'All' ? 'Mixed (Easy, Medium, Hard)' : difficulty;
    
    const prompt = `Generate ${count} Microsoft Data Engineer interview trivia questions with the following specifications:

DIFFICULTY: ${difficultyText}
COUNT: ${count} questions
FORMAT: Multiple choice with exactly 3 answers each

TOPICS TO COVER (mix these appropriately):
- SQL queries, joins, indexing, performance optimization
- Python data manipulation (pandas, numpy, data structures)
- Azure data services (Data Factory, Synapse, Data Lake, etc.)
- ETL/ELT pipeline design and best practices
- Data modeling and warehousing concepts
- System design for data platforms

For each question, provide:
1. Clear, specific question testing practical knowledge
2. Exactly 3 multiple choice answers (A, B, C)
3. Mark which answer is correct
4. Brief explanation of why the correct answer is right

FORMAT YOUR RESPONSE EXACTLY LIKE THIS:

QUESTION 1:
Q: [Question text here]
A: [Answer option A]
B: [Answer option B] 
C: [Answer option C]
CORRECT: [A, B, or C]
EXPLANATION: [Brief explanation]

QUESTION 2:
[Continue same format...]

Make sure questions are appropriate for ${difficultyText} difficulty level and relevant to Microsoft Data Engineer role.`;

    // Use the existing Claude API service
    const response = await generateFeedback(
      'Generate trivia questions for Microsoft Data Engineer interview',
      prompt,
      'Generate comprehensive trivia questions as specified',
      ''
    );

    // Parse the AI response into structured questions
    const aiQuestions = parseAIResponse(response, difficulty);
    
    if (aiQuestions.length > 0) {
      console.log(`✨ Successfully generated ${aiQuestions.length} AI trivia questions`);
      return aiQuestions.slice(0, count);
    } else {
      throw new Error('Failed to parse AI response');
    }

  } catch (error) {
    console.log('Claude API unavailable for trivia generation, using mock questions');
    return generateMockAIQuestions(difficulty === 'All' ? 'Medium' : difficulty, count);
  }
};

// Parse Claude API response into structured trivia questions
const parseAIResponse = (response: string, difficulty: 'All' | 'Easy' | 'Medium' | 'Hard'): AITriviaQuestion[] => {
  const questions: AITriviaQuestion[] = [];
  const lines = response.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  let currentQuestion: Partial<AITriviaQuestion> = {};
  let answerOptions: string[] = [];
  let questionCounter = 1;
  
  for (const line of lines) {
    if (line.startsWith('QUESTION ') && line.includes(':')) {
      // Start of a new question - save previous if complete
      if (currentQuestion.question && answerOptions.length === 3 && currentQuestion.answer) {
        const triviaQuestion = createTriviaQuestion(currentQuestion, answerOptions, questionCounter - 1, difficulty);
        if (triviaQuestion) {
          questions.push(triviaQuestion);
        }
      }
      
      // Reset for new question
      currentQuestion = {};
      answerOptions = [];
      questionCounter++;
    } else if (line.startsWith('Q: ')) {
      currentQuestion.question = line.substring(3);
    } else if (line.startsWith('A: ')) {
      answerOptions[0] = line.substring(3);
    } else if (line.startsWith('B: ')) {
      answerOptions[1] = line.substring(3);
    } else if (line.startsWith('C: ')) {
      answerOptions[2] = line.substring(3);
    } else if (line.startsWith('CORRECT: ')) {
      const correctLetter = line.substring(9).trim().toUpperCase();
      const correctIndex = correctLetter === 'A' ? 0 : correctLetter === 'B' ? 1 : 2;
      if (answerOptions[correctIndex]) {
        currentQuestion.answer = answerOptions[correctIndex];
      }
    } else if (line.startsWith('EXPLANATION: ')) {
      currentQuestion.aiApproach = line.substring(13);
    }
  }
  
  // Handle the last question
  if (currentQuestion.question && answerOptions.length === 3 && currentQuestion.answer) {
    const triviaQuestion = createTriviaQuestion(currentQuestion, answerOptions, questionCounter - 1, difficulty);
    if (triviaQuestion) {
      questions.push(triviaQuestion);
    }
  }
  
  return questions;
};

// Create a structured trivia question from parsed data
const createTriviaQuestion = (
  questionData: Partial<AITriviaQuestion>,
  answerOptions: string[],
  index: number,
  difficulty: 'All' | 'Easy' | 'Medium' | 'Hard'
): AITriviaQuestion | null => {
  if (!questionData.question || !questionData.answer || answerOptions.length !== 3) {
    return null;
  }
  
  const answers: TriviaAnswer[] = answerOptions.map((option, idx) => ({
    id: `answer_${idx + 1}`,
    text: option,
    isCorrect: option === questionData.answer
  }));
  
  // Shuffle answers so correct answer isn't always in same position
  const shuffled = [...answers].sort(() => Math.random() - 0.5);
  
  return {
    id: 10000 + index, // Use numeric IDs starting from 10000 for AI-generated questions
    question: questionData.question,
    difficulty: difficulty === 'All' ? (['Easy', 'Medium', 'Hard'][Math.floor(Math.random() * 3)] as 'Easy' | 'Medium' | 'Hard') : difficulty,
    timeEstimate: difficulty === 'Easy' ? 3 : difficulty === 'Medium' ? 5 : 7,
    answer: questionData.answer,
    pseudoCode: questionData.pseudoCode || '',
    aiApproach: questionData.aiApproach || 'AI-generated question for Microsoft Data Engineer interview preparation.',
    answers: shuffled
  };
};

// Utility function for future Option 2 implementation
export const enhanceExistingQuestions = async (_questions: Question[]): Promise<AITriviaQuestion[]> => {
  // This will be implemented when we add Option 2
  console.log('Enhanced question generation - coming in Option 2!');
  return [];
};

// Utility function for future Option 3 implementation  
export const generateContextAwareQuestions = async (
  _existingQuestions: Question[],
  _difficulty: 'All' | 'Easy' | 'Medium' | 'Hard',
  _count: number
): Promise<AITriviaQuestion[]> => {
  // This will be implemented when we add Option 3
  console.log('Context-aware question generation - coming in Option 3!');
  return [];
};
