import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

// Define types
export interface QuestionProgress {
  id: number;
  completed: boolean;
  lastStudied?: Date;
}

export interface CategoryProgress {
  sqlBasics: QuestionProgress[];
  sqlAdvanced: QuestionProgress[];
  pythonBasics: QuestionProgress[];
  pythonAdvanced: QuestionProgress[];
  decompositionScenarios: QuestionProgress[];
  azureServices: QuestionProgress[];
  mockInterviews: QuestionProgress[];
}

export interface TimerSession {
  startTime: Date;
  duration: number; // in minutes
  category: string;
  questionIds: number[];
}

export interface UserPreferences {
  darkMode: boolean;
  timerSound: boolean;
  autoStart: boolean;
}

interface AppContextType {
  // Progress tracking
  progress: CategoryProgress;
  updateProgress: (category: keyof CategoryProgress, questionId: number, completed: boolean) => void;
  
  // Timer functionality
  currentSession: TimerSession | null;
  startSession: (category: string, questionIds: number[], duration: number) => void;
  endSession: () => void;
  
  // Dark mode and preferences
  preferences: UserPreferences;
  toggleDarkMode: () => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  
  // Stats and metrics
  getTotalProgress: () => number;
  getCategoryProgress: (category: keyof CategoryProgress) => number;
  getEstimatedTimeRemaining: () => number;
}

// Create context with default values
const AppContext = createContext<AppContextType>({
  progress: {
    sqlBasics: [],
    sqlAdvanced: [],
    pythonBasics: [],
    pythonAdvanced: [],
    decompositionScenarios: [],
    azureServices: [],
    mockInterviews: []
  },
  updateProgress: () => {},
  currentSession: null,
  startSession: () => {},
  endSession: () => {},
  preferences: {
    darkMode: false,
    timerSound: true,
    autoStart: false
  },
  toggleDarkMode: () => {},
  updatePreferences: () => {},
  getTotalProgress: () => 0,
  getCategoryProgress: () => 0,
  getEstimatedTimeRemaining: () => 0
});

// Provider component
export const AppProvider = ({ children }: { children: ReactNode }) => {
  // Initialize state from localStorage if available
  const [progress, setProgress] = useState<CategoryProgress>(() => {
    const savedProgress = localStorage.getItem('msInterviewProgress');
    return savedProgress ? JSON.parse(savedProgress) : {
      sqlBasics: [],
      sqlAdvanced: [],
      pythonBasics: [],
      pythonAdvanced: [],
      decompositionScenarios: [],
      azureServices: [],
      mockInterviews: []
    };
  });
  
  const [currentSession, setCurrentSession] = useState<TimerSession | null>(null);
  
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const savedPrefs = localStorage.getItem('msInterviewPreferences');
    return savedPrefs ? JSON.parse(savedPrefs) : {
      darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
      timerSound: true,
      autoStart: false
    };
  });
  
  // Update progress for a specific question
  const updateProgress = (category: keyof CategoryProgress, questionId: number, completed: boolean) => {
    setProgress(prev => {
      const categoryQuestions = [...prev[category]];
      const existingIndex = categoryQuestions.findIndex(q => q.id === questionId);
      
      if (existingIndex >= 0) {
        // Update existing question
        categoryQuestions[existingIndex] = {
          ...categoryQuestions[existingIndex],
          completed,
          lastStudied: new Date()
        };
      } else {
        // Add new question progress
        categoryQuestions.push({
          id: questionId,
          completed,
          lastStudied: new Date()
        });
      }
      
      return {
        ...prev,
        [category]: categoryQuestions
      };
    });
  };
  
  // Timer session functions
  const startSession = (category: string, questionIds: number[], duration: number) => {
    setCurrentSession({
      startTime: new Date(),
      duration,
      category,
      questionIds
    });
  };
  
  const endSession = () => {
    setCurrentSession(null);
  };
  
  // Dark mode toggle
  const toggleDarkMode = () => {
    setPreferences(prev => ({
      ...prev,
      darkMode: !prev.darkMode
    }));
  };
  
  // Update user preferences
  const updatePreferences = (prefs: Partial<UserPreferences>) => {
    setPreferences(prev => ({
      ...prev,
      ...prefs
    }));
  };
  
  // Calculate total progress percentage
  const getTotalProgress = (): number => {
    const totalQuestions = 40 + 20 + 25 + 15 + 10 + 5; // Based on specified counts in requirements
    
    const completedCount = Object.values(progress).reduce((total, category) => {
      return total + category.filter((q: QuestionProgress) => q.completed).length;
    }, 0);
    
    return totalQuestions > 0 ? Math.round((completedCount / totalQuestions) * 100) : 0;
  };
  
  // Calculate category progress percentage
  const getCategoryProgress = (category: keyof CategoryProgress): number => {
    const categoryTotals: Record<keyof CategoryProgress, number> = {
      sqlBasics: 40,
      sqlAdvanced: 20,
      pythonBasics: 25,
      pythonAdvanced: 15,
      decompositionScenarios: 10,
      azureServices: 15,
      mockInterviews: 5
    };
    
    const completed = progress[category].filter(q => q.completed).length;
    const total = categoryTotals[category];
    
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };
  
  // Calculate estimated remaining study time
  const getEstimatedTimeRemaining = (): number => {
    // This is a simplified calculation based on average time per question
    const categoryTimeEstimates: Record<keyof CategoryProgress, number> = {
      sqlBasics: 5, // 5 min average per question
      sqlAdvanced: 10,
      pythonBasics: 6,
      pythonAdvanced: 12,
      decompositionScenarios: 20,
      azureServices: 8,
      mockInterviews: 30
    };
    
    let totalMinutes = 0;
    
    Object.entries(progress).forEach(([category, questions]) => {
      const cat = category as keyof CategoryProgress;
      const remaining = categoryTimeEstimates[cat] * (questions.filter((q: QuestionProgress) => !q.completed).length);
      totalMinutes += remaining;
    });
    
    return totalMinutes;
  };
  
  // Save progress and preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem('msInterviewProgress', JSON.stringify(progress));
  }, [progress]);
  
  useEffect(() => {
    localStorage.setItem('msInterviewPreferences', JSON.stringify(preferences));
    
    // Apply dark mode to document
    if (preferences.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [preferences]);
  
  const contextValue: AppContextType = {
    progress,
    updateProgress,
    currentSession,
    startSession,
    endSession,
    preferences,
    toggleDarkMode,
    updatePreferences,
    getTotalProgress,
    getCategoryProgress,
    getEstimatedTimeRemaining
  };
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook for using the context
export const useAppContext = () => useContext(AppContext);
