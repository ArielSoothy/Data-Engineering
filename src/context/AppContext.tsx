import { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import { pullProgress, pushProgressDebounced, flushSync } from '../services/progressSync';
import { CATEGORY_TOTALS } from '../config';

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
  adaptive: QuestionProgress[];
  metaOfficial: QuestionProgress[];
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
    mockInterviews: [],
    adaptive: [],
    metaOfficial: []
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
    const defaults: CategoryProgress = {
      sqlBasics: [],
      sqlAdvanced: [],
      pythonBasics: [],
      pythonAdvanced: [],
      decompositionScenarios: [],
      azureServices: [],
      mockInterviews: [],
      adaptive: [],
      metaOfficial: []
    };
    const savedProgress = localStorage.getItem('msInterviewProgress');
    return savedProgress ? { ...defaults, ...JSON.parse(savedProgress) } : defaults;
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
  
  const updateProgress = useCallback((category: keyof CategoryProgress, questionId: number, completed: boolean) => {
    setProgress(prev => {
      const categoryQuestions = [...prev[category]];
      const existingIndex = categoryQuestions.findIndex(q => q.id === questionId);

      if (existingIndex >= 0) {
        categoryQuestions[existingIndex] = {
          ...categoryQuestions[existingIndex],
          completed,
          lastStudied: new Date()
        };
      } else {
        categoryQuestions.push({
          id: questionId,
          completed,
          lastStudied: new Date()
        });
      }

      return { ...prev, [category]: categoryQuestions };
    });
  }, []);

  const startSession = useCallback((category: string, questionIds: number[], duration: number) => {
    setCurrentSession({ startTime: new Date(), duration, category, questionIds });
  }, []);

  const endSession = useCallback(() => {
    setCurrentSession(null);
  }, []);

  const toggleDarkMode = useCallback(() => {
    setPreferences(prev => ({ ...prev, darkMode: !prev.darkMode }));
  }, []);

  const updatePreferences = useCallback((prefs: Partial<UserPreferences>) => {
    setPreferences(prev => ({ ...prev, ...prefs }));
  }, []);

  const getTotalProgress = useCallback((): number => {
    const totalQuestions = Object.entries(CATEGORY_TOTALS)
      .filter(([key]) => key !== 'metaOfficial')
      .reduce((sum, [, count]) => sum + count, 0);
    const completedCount = Object.entries(progress).reduce((total, [key, category]) => {
      if (key === 'metaOfficial') return total;
      return total + category.filter((q: QuestionProgress) => q.completed).length;
    }, 0);
    return totalQuestions > 0 ? Math.round((completedCount / totalQuestions) * 100) : 0;
  }, [progress]);

  const getCategoryProgress = useCallback((category: keyof CategoryProgress): number => {
    const completed = (progress[category] ?? []).filter(q => q.completed).length;
    const total = CATEGORY_TOTALS[category] ?? 0;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }, [progress]);

  const getEstimatedTimeRemaining = useCallback((): number => {
    const categoryTimeEstimates: Record<keyof CategoryProgress, number> = {
      sqlBasics: 5, sqlAdvanced: 10, pythonBasics: 6, pythonAdvanced: 12,
      decompositionScenarios: 20, azureServices: 8, mockInterviews: 30,
      adaptive: 8, metaOfficial: 10
    };
    let totalMinutes = 0;
    Object.entries(progress).forEach(([category, questions]) => {
      const cat = category as keyof CategoryProgress;
      const remaining = categoryTimeEstimates[cat] * (questions.filter((q: QuestionProgress) => !q.completed).length);
      totalMinutes += remaining;
    });
    return totalMinutes;
  }, [progress]);
  
  // Restore from cloud backup only if localStorage is empty (e.g., new browser / cleared cache)
  const hasPulled = useRef(false);
  useEffect(() => {
    if (hasPulled.current) return;
    hasPulled.current = true;
    pullProgress().then(restored => {
      if (restored) {
        const saved = localStorage.getItem('msInterviewProgress');
        if (saved) setProgress(prev => ({ ...prev, ...JSON.parse(saved) }));
        const savedPrefs = localStorage.getItem('msInterviewPreferences');
        if (savedPrefs) setPreferences(prev => ({ ...prev, ...JSON.parse(savedPrefs) }));
      }
    }).catch(() => { /* offline — localStorage is the source of truth */ });
  }, []);

  // Flush pending sync when user leaves the page
  useEffect(() => {
    const handleUnload = () => flushSync();
    window.addEventListener('beforeunload', handleUnload);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flushSync();
    });
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);

  // Save progress and preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem('msInterviewProgress', JSON.stringify(progress));
    pushProgressDebounced();
  }, [progress]);

  useEffect(() => {
    localStorage.setItem('msInterviewPreferences', JSON.stringify(preferences));
    pushProgressDebounced();

    // Apply dark mode to document
    if (preferences.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [preferences]);
  
  const contextValue = useMemo<AppContextType>(() => ({
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
  }), [progress, currentSession, preferences, updateProgress, startSession, endSession, toggleDarkMode, updatePreferences, getTotalProgress, getCategoryProgress, getEstimatedTimeRemaining]);
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook for using the context
export const useAppContext = () => useContext(AppContext);
