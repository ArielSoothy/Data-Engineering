import type { CategoryProgress } from '../context/AppContext';

// Which JSON file a question came from
export type QuestionSource =
  | 'sqlBasics'
  | 'sqlAdvanced'
  | 'pythonBasics'
  | 'pythonAdvanced'
  | 'metaOfficial'
  | 'quickDrill';

export type Subject = 'sql' | 'python';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type StudyMode = 'study' | 'flashcard' | 'quiz' | 'code' | 'adaptive';

export interface UnifiedQuestion {
  uid: string;                              // "{source}:{id}" e.g. "sqlBasics:3"
  sourceId: number;                         // Original id from JSON
  source: QuestionSource;
  question: string;                         // Normalized from 'q' or 'question'
  answer: string;                           // Normalized from 'a' or 'answer'
  subject: Subject;
  difficulty: Difficulty;
  timeEstimate: number;
  pseudoCode?: string;
  topic?: string;
  tags?: string[];
  hints?: string[];
  progressKey: keyof CategoryProgress;      // For backward-compat progress writes
  progressId: number;                       // Original id for progress tracking
}

export interface StudyHubFilters {
  subject: Subject | 'all';
  difficulty: Difficulty | 'all';
  mode: StudyMode;
  search: string;
}

export const DEFAULT_FILTERS: StudyHubFilters = {
  subject: 'all',
  difficulty: 'all',
  mode: 'study',
  search: '',
};

// Maps source → AppContext progress key
export const SOURCE_TO_PROGRESS_KEY: Record<QuestionSource, keyof CategoryProgress> = {
  sqlBasics: 'sqlBasics',
  sqlAdvanced: 'sqlAdvanced',
  pythonBasics: 'pythonBasics',
  pythonAdvanced: 'pythonAdvanced',
  metaOfficial: 'metaOfficial',
  quickDrill: 'sqlBasics', // Quick Drill uses its own localStorage, not AppContext
};
