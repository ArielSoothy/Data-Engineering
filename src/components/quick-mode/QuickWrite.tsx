import { useState, useMemo, useCallback, useEffect } from 'react';
import { Check, X, Minus, ChevronRight, RotateCcw } from 'lucide-react';
import { Button, Badge, ProgressBar } from '../ui';
import { writeQuestions, type WriteQuestion } from '../../data/writeQuestions';

interface Props {
  subject: 'all' | 'sql' | 'python';
  difficulty: 'all' | 'Easy' | 'Medium' | 'Hard';
}

interface QuestionProgress {
  seen: number;
  correct: number;
  partial: number;
  wrong: number;
  lastSeen?: string;
}

type ProgressMap = Record<number, QuestionProgress>;

const STORAGE_KEY = 'quick_write_progress';

const DIFF_LABELS: Record<1 | 2 | 3, { label: string; difficulty: 'Easy' | 'Medium' | 'Hard' }> = {
  1: { label: 'Easy', difficulty: 'Easy' },
  2: { label: 'Medium', difficulty: 'Medium' },
  3: { label: 'Hard', difficulty: 'Hard' },
};

const DIFF_STRING_TO_NUM: Record<string, 1 | 2 | 3> = {
  Easy: 1,
  Medium: 2,
  Hard: 3,
};

function loadProgress(): ProgressMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveProgress(map: ProgressMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch { /* ignore */ }
}

export default function QuickWrite({ subject, difficulty }: Props) {
  const [progressMap, setProgressMap] = useState<ProgressMap>(loadProgress);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [rated, setRated] = useState(false);

  // Filter questions by subject and difficulty
  const questions = useMemo(() => {
    let filtered = writeQuestions;
    if (subject !== 'all') {
      filtered = filtered.filter(q => q.category === subject);
    }
    if (difficulty !== 'all') {
      const d = DIFF_STRING_TO_NUM[difficulty];
      if (d) filtered = filtered.filter(q => q.difficulty === d);
    }
    return filtered;
  }, [subject, difficulty]);

  // Reset index when filters change
  useEffect(() => {
    setIndex(0);
    setAnswer('');
    setRevealed(false);
    setRated(false);
  }, [subject, difficulty]);

  // Stats
  const stats = useMemo(() => {
    const ids = new Set(questions.map(q => q.id));
    let mastered = 0;
    let partial = 0;
    let missed = 0;

    for (const [idStr, p] of Object.entries(progressMap)) {
      const id = Number(idStr);
      if (!ids.has(id)) continue;
      if (p.correct > 0) mastered++;
      else if (p.partial > 0) partial++;
      else if (p.wrong > 0) missed++;
    }
    return { total: questions.length, mastered, partial, missed };
  }, [questions, progressMap]);

  const currentQuestion: WriteQuestion | undefined = questions[index];

  const handleReveal = useCallback(() => {
    setRevealed(true);
  }, []);

  const handleRate = useCallback((rating: 'correct' | 'partial' | 'wrong') => {
    if (!currentQuestion || rated) return;
    setRated(true);

    setProgressMap(prev => {
      const existing = prev[currentQuestion.id] || { seen: 0, correct: 0, partial: 0, wrong: 0 };
      const updated: ProgressMap = {
        ...prev,
        [currentQuestion.id]: {
          ...existing,
          seen: existing.seen + 1,
          correct: existing.correct + (rating === 'correct' ? 1 : 0),
          partial: existing.partial + (rating === 'partial' ? 1 : 0),
          wrong: existing.wrong + (rating === 'wrong' ? 1 : 0),
          lastSeen: new Date().toISOString(),
        },
      };
      saveProgress(updated);
      return updated;
    });
  }, [currentQuestion, rated]);

  const handleNext = useCallback(() => {
    if (index < questions.length - 1) {
      setIndex(i => i + 1);
    } else {
      setIndex(0);
    }
    setAnswer('');
    setRevealed(false);
    setRated(false);
  }, [index, questions.length]);

  const handleReset = useCallback(() => {
    const ids = new Set(questions.map(q => q.id));
    setProgressMap(prev => {
      const updated = { ...prev };
      for (const id of ids) {
        delete updated[id];
      }
      saveProgress(updated);
      return updated;
    });
    setIndex(0);
    setAnswer('');
    setRevealed(false);
    setRated(false);
  }, [questions]);

  if (questions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 dark:text-gray-500">
        No write questions available for the selected filters.
      </div>
    );
  }

  const diffInfo = DIFF_LABELS[currentQuestion.difficulty];

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="text-gray-500 dark:text-gray-400 font-medium">
          {stats.total} questions
        </span>
        <Badge variant="custom" color="green" size="sm">{stats.mastered} mastered</Badge>
        <Badge variant="custom" color="yellow" size="sm">{stats.partial} partial</Badge>
        <Badge variant="custom" color="red" size="sm">{stats.missed} missed</Badge>
        <div className="flex-1" />
        <Button variant="ghost" size="sm" onClick={handleReset} icon={<RotateCcw size={14} />}>
          Reset
        </Button>
      </div>

      <ProgressBar
        value={stats.total > 0 ? Math.round(((stats.mastered + stats.partial) / stats.total) * 100) : 0}
        label={`${stats.mastered + stats.partial} / ${stats.total} attempted`}
      />

      {/* Question card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        {/* Question header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
          <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
            Q {index + 1} / {questions.length}
          </span>
          <div className="flex items-center gap-2">
            <Badge variant="difficulty" difficulty={diffInfo.difficulty} size="sm">
              {diffInfo.label}
            </Badge>
            <Badge variant="custom" color={currentQuestion.category === 'sql' ? 'blue' : 'green'} size="sm">
              {currentQuestion.category.toUpperCase()}
            </Badge>
            <Badge variant="custom" color="purple" size="sm">
              {currentQuestion.topic}
            </Badge>
          </div>
        </div>

        {/* Question body */}
        <div className="px-5 py-5">
          <p className="text-lg font-medium text-gray-900 dark:text-gray-100 leading-relaxed">
            {currentQuestion.question}
          </p>

          {currentQuestion.hint && !revealed && (
            <p className="mt-3 text-sm text-amber-600 dark:text-amber-400 italic">
              Hint: {currentQuestion.hint}
            </p>
          )}

          {/* Tags */}
          {currentQuestion.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {currentQuestion.tags.map(tag => (
                <span
                  key={tag}
                  className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Textarea */}
        <div className="px-5 pb-4">
          <textarea
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            placeholder="Write your answer here..."
            rows={8}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-mono text-sm p-4 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 placeholder-gray-400 dark:placeholder-gray-500"
            disabled={rated}
          />
        </div>

        {/* Show Answer / Rate / Next */}
        <div className="px-5 pb-5 space-y-4">
          {!revealed && (
            <Button
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={handleReveal}
            >
              Show Answer
            </Button>
          )}

          {revealed && (
            <>
              {/* Correct answer */}
              <div className="rounded-xl bg-gray-900 dark:bg-gray-950 border border-gray-700 overflow-hidden">
                <div className="px-4 py-2 border-b border-gray-700 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Answer
                </div>
                <pre className="px-4 py-4 text-sm font-mono text-green-400 whitespace-pre-wrap overflow-x-auto leading-relaxed">
                  {currentQuestion.answer}
                </pre>
              </div>

              {/* Rating buttons */}
              {!rated ? (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="flex-1 !bg-green-50 dark:!bg-green-900/20 !text-green-700 dark:!text-green-400 hover:!bg-green-100 dark:hover:!bg-green-900/40 !border !border-green-200 dark:!border-green-800"
                    icon={<Check size={18} />}
                    onClick={() => handleRate('correct')}
                  >
                    Got It
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    className="flex-1 !bg-amber-50 dark:!bg-amber-900/20 !text-amber-700 dark:!text-amber-400 hover:!bg-amber-100 dark:hover:!bg-amber-900/40 !border !border-amber-200 dark:!border-amber-800"
                    icon={<Minus size={18} />}
                    onClick={() => handleRate('partial')}
                  >
                    Partially
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    className="flex-1 !bg-red-50 dark:!bg-red-900/20 !text-red-700 dark:!text-red-400 hover:!bg-red-100 dark:hover:!bg-red-900/40 !border !border-red-200 dark:!border-red-800"
                    icon={<X size={18} />}
                    onClick={() => handleRate('wrong')}
                  >
                    Missed
                  </Button>
                </div>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  icon={<ChevronRight size={18} />}
                  iconPosition="right"
                  onClick={handleNext}
                >
                  {index < questions.length - 1 ? 'Next Question' : 'Start Over'}
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
