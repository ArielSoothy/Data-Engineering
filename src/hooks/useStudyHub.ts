import { useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { UnifiedQuestion, StudyHubFilters, Subject, Difficulty, StudyMode } from '../types/studyHub';
import { DEFAULT_FILTERS } from '../types/studyHub';

const VALID_SUBJECTS: (Subject | 'all')[] = ['all', 'sql', 'python'];
const VALID_DIFFICULTIES: (Difficulty | 'all')[] = ['all', 'Easy', 'Medium', 'Hard'];
const VALID_MODES: StudyMode[] = ['study', 'flashcard', 'quiz', 'code', 'adaptive'];

function parseFiltersFromParams(params: URLSearchParams): StudyHubFilters {
  const subject = params.get('subject') as Subject | 'all' | null;
  const difficulty = params.get('diff') as Difficulty | 'all' | null;
  const mode = params.get('mode') as StudyMode | null;
  const search = params.get('q') ?? '';

  return {
    subject: subject && VALID_SUBJECTS.includes(subject) ? subject : DEFAULT_FILTERS.subject,
    difficulty: difficulty && VALID_DIFFICULTIES.includes(difficulty) ? difficulty : DEFAULT_FILTERS.difficulty,
    mode: mode && VALID_MODES.includes(mode) ? mode : DEFAULT_FILTERS.mode,
    search,
  };
}

export function useStudyHub(allQuestions: UnifiedQuestion[]) {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFilters = useMemo(() => parseFiltersFromParams(searchParams), []);
  const [filters, setFiltersState] = useState<StudyHubFilters>(initialFilters);

  // Sync filters to URL params
  const setFilters = useCallback(
    (updater: StudyHubFilters | ((prev: StudyHubFilters) => StudyHubFilters)) => {
      setFiltersState(prev => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        const params = new URLSearchParams();
        if (next.subject !== 'all') params.set('subject', next.subject);
        if (next.difficulty !== 'all') params.set('diff', next.difficulty);
        if (next.mode !== 'study') params.set('mode', next.mode);
        if (next.search) params.set('q', next.search);
        setSearchParams(params, { replace: true });
        return next;
      });
    },
    [setSearchParams],
  );

  // Apply filters to produce the visible question set
  const filteredQuestions = useMemo(() => {
    let result = allQuestions;

    if (filters.subject !== 'all') {
      result = result.filter(q => q.subject === filters.subject);
    }
    if (filters.difficulty !== 'all') {
      result = result.filter(q => q.difficulty === filters.difficulty);
    }
    if (filters.search) {
      const term = filters.search.toLowerCase();
      result = result.filter(
        q =>
          q.question.toLowerCase().includes(term) ||
          q.answer.toLowerCase().includes(term) ||
          (q.topic && q.topic.toLowerCase().includes(term)),
      );
    }

    return result;
  }, [allQuestions, filters]);

  return { filters, setFilters, filteredQuestions };
}
