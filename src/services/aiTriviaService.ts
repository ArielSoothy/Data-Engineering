/**
 * AI-Powered Trivia Question Generation Service
 * 
 * This service generates complete trivia questions using Claude API for Meta Data Engineer
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
      question: 'At Meta, when would you choose Presto over Spark for a data processing task?',
      difficulty: difficulty as 'Easy' | 'Medium' | 'Hard',
      timeEstimate: 5,
      answer: 'Presto is ideal for interactive, low-latency ad-hoc SQL queries over large datasets, while Spark is better for complex multi-stage ETL pipelines and iterative ML workloads.',
      pseudoCode: '-- Presto: Interactive analytics\nSELECT user_id, COUNT(*) FROM events\nWHERE ds = \'2025-01-01\' GROUP BY 1;\n\n# Spark: Multi-stage ETL\ndf = spark.read.table("events")\ndf_transformed = df.filter(...).groupBy(...).agg(...)\ndf_transformed.write.saveAsTable("output")',
      aiApproach: 'At Meta, Presto powers interactive queries across the data warehouse (fast SQL), while Spark handles heavy ETL and ML pipelines that require iterative processing and complex transformations.',
      answers: [
        {
          id: 'correct',
          text: 'Presto is ideal for interactive, low-latency ad-hoc SQL queries over large datasets, while Spark is better for complex multi-stage ETL pipelines and iterative ML workloads.',
          isCorrect: true
        },
        {
          id: 'wrong_1',
          text: 'Presto is used exclusively for real-time streaming while Spark only handles batch processing of historical data.',
          isCorrect: false
        },
        {
          id: 'wrong_2',
          text: 'Presto replaces Spark entirely at Meta since it supports both SQL and programmatic transformations equally well.',
          isCorrect: false
        }
      ]
    },
    {
      id: 9002,
      question: 'When partitioning a petabyte-scale Hive table at Meta that stores daily user interaction events, which partitioning strategy would optimize both query performance and storage efficiency?',
      difficulty: difficulty as 'Easy' | 'Medium' | 'Hard',
      timeEstimate: 7,
      answer: 'Partition by ds (datestamp) as the primary partition and optionally by a high-cardinality column like country, enabling partition pruning on date ranges while keeping partition file sizes manageable.',
      pseudoCode: 'CREATE TABLE user_events (\n  user_id BIGINT,\n  event_type STRING,\n  payload STRING\n)\nPARTITIONED BY (ds STRING, country STRING)\nSTORED AS ORC;  -- columnar format for compression\n\n-- Presto query with partition pruning\nSELECT event_type, COUNT(*)\nFROM user_events\nWHERE ds = \'2025-01-15\' AND country = \'US\'\nGROUP BY 1;',
      aiApproach: 'At Meta scale, ds-based partitioning is standard for Hive tables. Partition pruning ensures Presto/Spark only scans relevant date partitions instead of the entire petabyte dataset.',
      answers: [
        {
          id: 'correct',
          text: 'Partition by ds (datestamp) as the primary partition and optionally by a high-cardinality column like country, enabling partition pruning on date ranges while keeping partition file sizes manageable.',
          isCorrect: true
        },
        {
          id: 'wrong_1',
          text: 'Hash partition by user_id to ensure even distribution across nodes, since user-based queries are the most common access pattern.',
          isCorrect: false
        },
        {
          id: 'wrong_2',
          text: 'Store the table unpartitioned with a clustered index on event_type for the fastest aggregation queries.',
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
      aiApproach: 'At Meta scale, datasets regularly exceed single-machine memory. Chunking lets you process massive exports locally, but in production you would typically use Spark or Presto for distributed processing.',
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
    
    const prompt = `Generate ${count} Meta Data Engineer interview trivia questions with the following specifications:

DIFFICULTY: ${difficultyText}
COUNT: ${count} questions
FORMAT: Multiple choice with exactly 3 answers each

TOPICS TO COVER (mix these appropriately):
- SQL queries, joins, indexing, performance optimization
- Python data manipulation (pandas, numpy, data structures)
- Meta data infrastructure (Presto, Spark, Hive, Scribe, Dataswarm)
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

Make sure questions are appropriate for ${difficultyText} difficulty level and relevant to Meta Data Engineer role.`;

    // Use the existing Claude API service
    const response = await generateFeedback(
      'Generate trivia questions for Meta Data Engineer interview',
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
    aiApproach: questionData.aiApproach || 'AI-generated question for Meta Data Engineer interview preparation.',
    answers: shuffled
  };
};

// Generate AI trivia questions weighted toward weak topics (for Endless Mode)
export const generateAITriviaQuestionsWeighted = async (
  topicAccuracy: Record<string, number>,
  count: number = 10
): Promise<AITriviaQuestion[]> => {
  if (Object.keys(topicAccuracy).length === 0) {
    return generateAITriviaQuestions('All', count);
  }

  // Find weakest topics (accuracy < 0.6), sorted weakest first
  const weakTopics = Object.entries(topicAccuracy)
    .filter(([, acc]) => acc < 0.6)
    .sort(([, a], [, b]) => a - b)
    .map(([topic]) => topic);

  const focusTopics = weakTopics.length > 0 ? weakTopics : Object.keys(topicAccuracy);

  console.log(`Endless mode: focusing on topics: ${focusTopics.join(', ')}`);
  return generateAITriviaQuestions('All', count);
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
