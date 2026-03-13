import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layers, Zap, HelpCircle, Puzzle } from 'lucide-react';
import { Spinner, Badge, ProgressBar } from '../ui';
import { useUnifiedQuestions } from '../../hooks/useUnifiedQuestions';
import { useAppContext } from '../../context/AppContext';
import { getTopicsForSubject } from '../../data/topics';
import QuickFlashcard from './QuickFlashcard';
import QuickQuiz from './QuickQuiz';
import QuickPuzzle from './QuickPuzzle';
import type { UnifiedQuestion, Subject } from '../../types/studyHub';

// --- Read FSRS + drill progress from localStorage for stats ---
function getCompletedSet(): Set<string> {
  const completed = new Set<string>();
  // From quick_drill_progress
  try {
    const raw = localStorage.getItem('quick_drill_progress');
    if (raw) {
      const data = JSON.parse(raw) as Record<string, { correct?: number }>;
      for (const [uid, entry] of Object.entries(data)) {
        if (entry.correct && entry.correct > 0) completed.add(uid);
      }
    }
  } catch { /* ignore */ }
  // From FSRS state (cards that have been reviewed at least once)
  for (const key of ['quick_drill_fsrs', 'study_hub_fsrs']) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const data = JSON.parse(raw) as Record<string, { reps?: number }>;
        for (const [id, card] of Object.entries(data)) {
          if (card.reps && card.reps > 0) completed.add(id);
        }
      }
    } catch { /* ignore */ }
  }
  return completed;
}

function isQuestionCompleted(q: UnifiedQuestion, completedSet: Set<string>): boolean {
  return completedSet.has(q.uid) || completedSet.has(String(q.sourceId));
}

type QuickModeType = 'flashcard' | 'quiz' | 'puzzle';
type SubjectFilter = 'all' | Subject;

export default function QuickMode() {
  const { questions: allQuestions, loading, error } = useUnifiedQuestions();
  const { progress } = useAppContext();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialSubject = (searchParams.get('subject') as SubjectFilter) || 'all';
  const initialTopic = searchParams.get('topic') || 'all';
  const initialMode = (searchParams.get('mode') as QuickModeType) || 'flashcard';

  const [subject, setSubject] = useState<SubjectFilter>(initialSubject);
  const [topic, setTopic] = useState(initialTopic);
  const [mode, setMode] = useState<QuickModeType>(initialMode);

  // Sync to URL
  const updateParams = (s: SubjectFilter, t: string, m: QuickModeType) => {
    const p = new URLSearchParams();
    if (s !== 'all') p.set('subject', s);
    if (t !== 'all') p.set('topic', t);
    if (m !== 'flashcard') p.set('mode', m);
    setSearchParams(p, { replace: true });
  };

  const handleSubject = (s: SubjectFilter) => {
    setSubject(s);
    setTopic('all');
    updateParams(s, 'all', mode);
  };

  const handleTopic = (t: string) => {
    setTopic(t);
    updateParams(subject, t, mode);
  };

  const handleMode = (m: QuickModeType) => {
    setMode(m);
    updateParams(subject, topic, m);
  };

  // Filter questions
  const subjectFiltered = useMemo(
    () => subject === 'all' ? allQuestions : allQuestions.filter(q => q.subject === subject),
    [allQuestions, subject],
  );

  // Available topics from filtered questions
  const availableTopics = useMemo(() => {
    const topicSet = new Map<string, number>();
    for (const q of subjectFiltered) {
      const t = q.topic || 'Other';
      topicSet.set(t, (topicSet.get(t) || 0) + 1);
    }
    // Sort by canonical order
    const canonical = subject === 'all'
      ? [...getTopicsForSubject('sql'), ...getTopicsForSubject('python')]
      : getTopicsForSubject(subject);
    const sorted: { name: string; count: number }[] = [];
    for (const ct of canonical) {
      if (topicSet.has(ct)) {
        sorted.push({ name: ct, count: topicSet.get(ct)! });
        topicSet.delete(ct);
      }
    }
    // Any remaining topics not in canonical list
    for (const [name, count] of topicSet) {
      sorted.push({ name, count });
    }
    return sorted;
  }, [subjectFiltered, subject]);

  const filtered = useMemo(
    () => topic === 'all' ? subjectFiltered : subjectFiltered.filter(q => (q.topic || 'Other') === topic),
    [subjectFiltered, topic],
  );

  // Stats — read actual progress from localStorage + AppContext
  const stats = useMemo(() => {
    const completedSet = getCompletedSet();
    // Also count AppContext completions
    for (const [, entries] of Object.entries(progress)) {
      for (const e of entries) {
        if (e.completed) completedSet.add(String(e.id));
      }
    }
    const mastered = filtered.filter(q => isQuestionCompleted(q, completedSet)).length;
    return {
      total: filtered.length,
      sql: filtered.filter(q => q.subject === 'sql').length,
      python: filtered.filter(q => q.subject === 'python').length,
      mastered,
    };
  }, [filtered, progress]);

  if (loading) return <div className="flex justify-center pt-16"><Spinner size="lg" /></div>;
  if (error) return <div className="text-red-500 text-center pt-16">{error}</div>;

  const subjectTabs: { value: SubjectFilter; label: string }[] = [
    { value: 'all', label: `All (${allQuestions.length})` },
    { value: 'sql', label: `SQL (${allQuestions.filter(q => q.subject === 'sql').length})` },
    { value: 'python', label: `Python (${allQuestions.filter(q => q.subject === 'python').length})` },
  ];

  const modeTabs: { value: QuickModeType; label: string; icon: React.ReactNode }[] = [
    { value: 'flashcard', label: 'Flashcard', icon: <Layers size={16} /> },
    { value: 'quiz', label: 'Quiz', icon: <HelpCircle size={16} /> },
    { value: 'puzzle', label: 'Puzzle', icon: <Puzzle size={16} /> },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Zap size={24} className="text-amber-500" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quick Mode</h1>
        <Badge variant="info">{stats.mastered}/{stats.total} mastered</Badge>
      </div>

      {/* Subject tabs */}
      <div className="flex gap-2 mb-4">
        {subjectTabs.map(t => (
          <button
            key={t.value}
            onClick={() => handleSubject(t.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              subject === t.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Topic pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => handleTopic('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            topic === 'all'
              ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 ring-1 ring-blue-300 dark:ring-blue-700'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          All Topics
        </button>
        {availableTopics.map(t => (
          <button
            key={t.name}
            onClick={() => handleTopic(t.name)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              topic === t.name
                ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 ring-1 ring-blue-300 dark:ring-blue-700'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {t.name} ({t.count})
          </button>
        ))}
      </div>

      {/* Mode tabs */}
      <div className="flex gap-1 mb-6 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
        {modeTabs.map(t => (
          <button
            key={t.value}
            onClick={() => handleMode(t.value)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              mode === t.value
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Stats bar */}
      {filtered.length > 0 && (
        <div className="mb-6">
          <ProgressBar
            value={stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0}
            label={`${stats.mastered} mastered  |  ${stats.total - stats.mastered} remaining  |  ${stats.sql} SQL · ${stats.python} Python`}
          />
        </div>
      )}

      {/* Mode content */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400 dark:text-gray-500">
          No questions match your filters. Try a different subject or topic.
        </div>
      ) : mode === 'flashcard' ? (
        <QuickFlashcard questions={filtered} />
      ) : mode === 'quiz' ? (
        <QuickQuiz questions={filtered} allQuestions={allQuestions} />
      ) : (
        <QuickPuzzle questions={filtered} />
      )}
    </div>
  );
}
