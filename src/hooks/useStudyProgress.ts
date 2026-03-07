import { useCallback, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import type { UnifiedQuestion } from '../types/studyHub';
import { getFromLocalStorage } from '../utils/helpers';

interface CardProgress {
  seen: number;
  correct: number;
  wrong: number;
  lastReviewed?: string;
}

type ProgressMap = Record<number, CardProgress>;

export function useStudyProgress() {
  const { progress, updateProgress } = useAppContext();

  // Check if a unified question is completed
  const isCompleted = useCallback(
    (q: UnifiedQuestion): boolean => {
      if (q.source === 'quickDrill') {
        // Quick Drill has its own progress system
        const drillProgress = getFromLocalStorage<ProgressMap>('quick_drill_progress', {});
        const cardProg = drillProgress[q.sourceId];
        return cardProg ? cardProg.correct >= 3 : false;
      }
      // Standard AppContext progress
      const cat = progress[q.progressKey] ?? [];
      return cat.some(p => p.id === q.progressId && p.completed);
    },
    [progress],
  );

  // Toggle completion for a unified question
  const toggleCompletion = useCallback(
    (q: UnifiedQuestion, completed?: boolean) => {
      if (q.source === 'quickDrill') {
        // Quick Drill — we don't toggle from Study Hub for drill cards.
        // Flashcard mode handles drill progress via FSRS rating.
        return;
      }
      const current = isCompleted(q);
      const newState = completed ?? !current;
      updateProgress(q.progressKey, q.progressId, newState);
    },
    [updateProgress, isCompleted],
  );

  // Get completion counts for a set of questions
  const getCompletionStats = useCallback(
    (questions: UnifiedQuestion[]) => {
      let completed = 0;
      for (const q of questions) {
        if (isCompleted(q)) completed++;
      }
      return { completed, total: questions.length };
    },
    [isCompleted],
  );

  return useMemo(
    () => ({ isCompleted, toggleCompletion, getCompletionStats }),
    [isCompleted, toggleCompletion, getCompletionStats],
  );
}
