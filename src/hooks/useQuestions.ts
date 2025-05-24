import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import type { QuestionProgress } from '../context/AppContext';

// Define interfaces for our data structures
export interface Question {
  id: number;
  question: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeEstimate: number;
  answer: string;
  pseudoCode?: string;
  aiApproach?: string;
}

export interface Scenario {
  id: number;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeEstimate: number;
  systemComponents: string[];
  keyConsiderations: string[];
  solutionApproach: string;
  pseudoCode?: string;
  aiApproach?: string;
}

export interface Service {
  id: number;
  name: string;
  category: string;
  description: string;
  keyFeatures: string[];
  commonUseCases: string[];
  interviewTips: string;
}

export interface MockInterview {
  id: number;
  title: string;
  duration: number;
  questions: {
    id: number;
    question: string;
    expectedAnswer: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    category: string;
    followUpQuestions: string[];
  }[];
}

// Custom hook for loading and managing questions
export const useQuestions = (category: string) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);
  
  const { progress, updateProgress } = useAppContext();
  
  // Map category name to progress key and file path
  const getCategoryInfo = (cat: string): { progressKey: keyof typeof progress, filePath: string } => {
    switch (cat) {
      case 'pythonBasics':
        return { progressKey: 'pythonBasics', filePath: '/python-basics.json' };
      case 'sql-basics':
        return { progressKey: 'sqlBasics', filePath: '/sql-basics.json' };
      case 'sql-advanced':
        return { progressKey: 'sqlAdvanced', filePath: '/sql-advanced.json' };
      case 'pythonAdvanced':
        return { progressKey: 'pythonAdvanced', filePath: '/python-advanced.json' };
      case 'decomposition-scenarios':
        return { progressKey: 'decompositionScenarios', filePath: '/decomposition-scenarios.json' };
      case 'azure-services':
        return { progressKey: 'azureServices', filePath: '/azure-services.json' };
      case 'mock-interviews':
        return { progressKey: 'mockInterviews', filePath: '/mock-interviews.json' };
      default:
        return { progressKey: 'sqlBasics', filePath: '/sql-basics.json' };
    }
  };
  
  // Load data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const { filePath } = getCategoryInfo(category);
        const response = await fetch(`/data${filePath}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }
        
        const jsonData = await response.json();
        
        // Handle different data structures based on category
        if (category === 'decomposition-scenarios') {
          setData(jsonData.scenarios || []);
        } else if (category === 'azure-services') {
          setData(jsonData.services || []);
        } else if (category === 'mock-interviews') {
          setData(jsonData.mockInterviews || []);
        } else {
          setData(jsonData.questions || []);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [category]);
  
  // Get completion status for a question
  const getQuestionProgress = (questionId: number): QuestionProgress | undefined => {
    const { progressKey } = getCategoryInfo(category);
    return progress[progressKey].find(q => q.id === questionId);
  };
  
  // Mark a question as completed or not completed
  const toggleQuestionCompletion = (questionId: number, completed?: boolean) => {
    const { progressKey } = getCategoryInfo(category);
    // If completed is not provided, toggle the current state
    const newState = completed ?? !getQuestionProgress(questionId)?.completed;
    updateProgress(progressKey, questionId, newState);
  };
  
  return {
    data,
    loading,
    error,
    getQuestionProgress,
    toggleQuestionCompletion
  };
};

export default useQuestions;
