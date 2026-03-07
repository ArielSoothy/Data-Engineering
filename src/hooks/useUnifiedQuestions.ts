import { useState, useEffect, useRef } from 'react';
import type { UnifiedQuestion } from '../types/studyHub';
import { fetchAllQuestions } from '../utils/questionNormalizer';

// Module-level cache so multiple components share the same data
let questionsCache: UnifiedQuestion[] | null = null;
let fetchPromise: Promise<UnifiedQuestion[]> | null = null;

export function useUnifiedQuestions() {
  const [questions, setQuestions] = useState<UnifiedQuestion[]>(questionsCache ?? []);
  const [loading, setLoading] = useState(!questionsCache);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    if (questionsCache) {
      setQuestions(questionsCache);
      setLoading(false);
      return;
    }

    // Deduplicate concurrent fetches
    if (!fetchPromise) {
      fetchPromise = fetchAllQuestions();
    }

    fetchPromise
      .then(data => {
        questionsCache = data;
        fetchPromise = null;
        if (mounted.current) {
          setQuestions(data);
          setLoading(false);
        }
      })
      .catch(err => {
        fetchPromise = null;
        if (mounted.current) {
          setError(err instanceof Error ? err.message : 'Failed to load questions');
          setLoading(false);
        }
      });

    return () => { mounted.current = false; };
  }, []);

  return { questions, loading, error };
}
