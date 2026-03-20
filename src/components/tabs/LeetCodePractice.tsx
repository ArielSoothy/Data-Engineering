import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, Badge, Button, ProgressBar, Spinner } from '../ui';
import { ChevronRight, ChevronLeft, RotateCcw, Eye, EyeOff, Check, X, Shuffle } from 'lucide-react';

/* ── Types ─────────────────────────────────────────────────────────── */

interface Breakdown {
  id: string;
  q: string;
  a: string;
}

interface LCQuestion {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium';
  pattern: string;
  topics: string[];
  problem: string;
  solution: string;
  breakdowns: Breakdown[];
  patternHint: string;
}

interface QuestionProgress {
  solved: boolean;
  buildUpComplete: boolean;
  patternCorrect: boolean | null;
  lastPracticed?: string;
}

type ProgressMap = Record<string, QuestionProgress>;
type Mode = 'menu' | 'full' | 'buildup' | 'pattern';
type TopicFilter = string;
type DifficultyFilter = 'all' | 'Easy' | 'Medium';

/* ── Constants ─────────────────────────────────────────────────────── */

const STORAGE_KEY = 'leetcode_practice_progress';
const ALL_PATTERNS = ['Arrays', 'HashMap', 'Two Pointers', 'Sliding Window', 'Binary Search', 'Sorting', 'Stacks', 'Strings'];

/* ── Helpers ───────────────────────────────────────────────────────── */

function loadProgress(): ProgressMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ProgressMap) : {};
  } catch {
    return {};
  }
}

function saveProgress(p: ProgressMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch (e) {
    console.warn('[LeetCodePractice] Failed to save progress:', e);
  }
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/* ── Component ─────────────────────────────────────────────────────── */

export default function LeetCodePractice() {
  const [allQuestions, setAllQuestions] = useState<LCQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [mode, setMode] = useState<Mode>('menu');
  const [progress, setProgress] = useState<ProgressMap>(loadProgress);
  const [topicFilter, setTopicFilter] = useState<TopicFilter>('all');
  const [diffFilter, setDiffFilter] = useState<DifficultyFilter>('all');

  // Session state
  const [deck, setDeck] = useState<LCQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSolution, setShowSolution] = useState(false);

  // Build Up mode
  const [breakdownStep, setBreakdownStep] = useState(0);
  const [revealedBreakdowns, setRevealedBreakdowns] = useState<Set<number>>(new Set());

  // Pattern Quiz mode
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  const [patternRevealed, setPatternRevealed] = useState(false);
  const [patternChoices, setPatternChoices] = useState<string[]>([]);
  const [sessionStats, setSessionStats] = useState({ correct: 0, wrong: 0, total: 0 });

  /* ── Fetch questions ────────────────────────────────────────────── */

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/data/leetcode-questions.json');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: LCQuestion[] = await res.json();
        if (!cancelled) {
          setAllQuestions(data);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setFetchError(err instanceof Error ? err.message : 'Failed to load questions');
          setLoading(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  /* ── Derived stats ──────────────────────────────────────────────── */

  const stats = useMemo(() => {
    const total = allQuestions.length;
    const solved = Object.values(progress).filter(p => p.solved).length;
    const buildUps = Object.values(progress).filter(p => p.buildUpComplete).length;
    const patternCorrect = Object.values(progress).filter(p => p.patternCorrect === true).length;
    const byTopic: Record<string, { total: number; done: number }> = {};
    for (const q of allQuestions) {
      const key = q.pattern;
      if (!byTopic[key]) byTopic[key] = { total: 0, done: 0 };
      byTopic[key].total++;
      if (progress[q.id]?.solved) byTopic[key].done++;
    }
    return { total, solved, buildUps, patternCorrect, byTopic };
  }, [allQuestions, progress]);

  /* ── Filtered questions ─────────────────────────────────────────── */

  const filteredQuestions = useMemo(() => {
    let filtered = allQuestions;
    if (topicFilter !== 'all') {
      filtered = filtered.filter(q => q.topics.includes(topicFilter) || q.pattern === topicFilter);
    }
    if (diffFilter !== 'all') {
      filtered = filtered.filter(q => q.difficulty === diffFilter);
    }
    return filtered;
  }, [allQuestions, topicFilter, diffFilter]);

  /* ── Persistence ────────────────────────────────────────────────── */

  const persistProgress = useCallback((updated: ProgressMap) => {
    setProgress(updated);
    saveProgress(updated);
  }, []);

  /* ── Generate pattern quiz choices ──────────────────────────────── */

  const generatePatternChoices = useCallback((correctPattern: string) => {
    const others = ALL_PATTERNS.filter(p => p !== correctPattern);
    const picked = shuffleArray(others).slice(0, 3);
    return shuffleArray([correctPattern, ...picked]);
  }, []);

  /* ── Session management ─────────────────────────────────────────── */

  const startSession = useCallback((sessionMode: 'full' | 'buildup' | 'pattern') => {
    const questions = shuffleArray(filteredQuestions);
    if (questions.length === 0) return;

    setDeck(questions);
    setCurrentIndex(0);
    setShowSolution(false);
    setBreakdownStep(0);
    setRevealedBreakdowns(new Set());
    setSelectedPattern(null);
    setPatternRevealed(false);
    setSessionStats({ correct: 0, wrong: 0, total: 0 });

    if (sessionMode === 'pattern') {
      setPatternChoices(generatePatternChoices(questions[0].pattern));
    }

    setMode(sessionMode);
  }, [filteredQuestions, generatePatternChoices]);

  /* ── Navigation ─────────────────────────────────────────────────── */

  const currentQuestion = deck[currentIndex] as LCQuestion | undefined;

  const goNext = useCallback(() => {
    const next = currentIndex + 1;
    if (next < deck.length) {
      setCurrentIndex(next);
      setShowSolution(false);
      setBreakdownStep(0);
      setRevealedBreakdowns(new Set());
      setSelectedPattern(null);
      setPatternRevealed(false);
      if (mode === 'pattern') {
        setPatternChoices(generatePatternChoices(deck[next].pattern));
      }
    } else {
      setMode('menu');
    }
  }, [currentIndex, deck, mode, generatePatternChoices]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowSolution(false);
      setBreakdownStep(0);
      setRevealedBreakdowns(new Set());
      setSelectedPattern(null);
      setPatternRevealed(false);
    }
  }, [currentIndex]);

  /* ── Mark solved ────────────────────────────────────────────────── */

  const markSolved = useCallback(() => {
    if (!currentQuestion) return;
    const prev = progress[currentQuestion.id] || { solved: false, buildUpComplete: false, patternCorrect: null };
    persistProgress({
      ...progress,
      [currentQuestion.id]: { ...prev, solved: true, lastPracticed: new Date().toISOString() },
    });
  }, [currentQuestion, progress, persistProgress]);

  const markBuildUpComplete = useCallback(() => {
    if (!currentQuestion) return;
    const prev = progress[currentQuestion.id] || { solved: false, buildUpComplete: false, patternCorrect: null };
    persistProgress({
      ...progress,
      [currentQuestion.id]: { ...prev, buildUpComplete: true, lastPracticed: new Date().toISOString() },
    });
  }, [currentQuestion, progress, persistProgress]);

  const markPatternResult = useCallback((correct: boolean) => {
    if (!currentQuestion) return;
    const prev = progress[currentQuestion.id] || { solved: false, buildUpComplete: false, patternCorrect: null };
    persistProgress({
      ...progress,
      [currentQuestion.id]: { ...prev, patternCorrect: correct, lastPracticed: new Date().toISOString() },
    });
    setSessionStats(s => ({
      correct: s.correct + (correct ? 1 : 0),
      wrong: s.wrong + (correct ? 0 : 1),
      total: s.total + 1,
    }));
  }, [currentQuestion, progress, persistProgress]);

  /* ── Reset progress ─────────────────────────────────────────────── */

  const resetProgress = useCallback(() => {
    persistProgress({});
  }, [persistProgress]);

  /* ── Loading / Error ────────────────────────────────────────────── */

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-red-500 dark:text-red-400 text-sm">
          Failed to load questions: {fetchError}
        </p>
        <Button variant="secondary" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  /* ── Top Bar (shared across modes) ──────────────────────────────── */

  const TopBar = () => (
    <div className="flex items-center justify-between mb-4">
      <button
        onClick={() => setMode('menu')}
        className="text-xl text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-2 min-w-[48px] min-h-[48px] flex items-center justify-center"
        aria-label="Back to menu"
      >
        &larr;
      </button>
      <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
        {currentIndex + 1} / {deck.length}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30"
          aria-label="Previous"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={goNext}
          className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label="Next"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );

  /* ── Question meta ──────────────────────────────────────────────── */

  const QuestionMeta = ({ q, showPattern = true }: { q: LCQuestion; showPattern?: boolean }) => (
    <div className="flex items-center gap-2 mb-3 flex-wrap">
      <Badge
        variant="difficulty"
        difficulty={q.difficulty}
        size="sm"
      />
      {showPattern && (
        <Badge label={q.pattern} color="blue" size="sm" />
      )}
      {q.topics.filter(t => t !== q.pattern).map(t => (
        <Badge key={t} label={t} color="gray" size="sm" />
      ))}
      {progress[q.id]?.solved && (
        <Badge label="Solved" color="green" size="sm" className="ml-auto" />
      )}
    </div>
  );

  /* ── FULL PROBLEM MODE ──────────────────────────────────────────── */

  if (mode === 'full' && currentQuestion) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-4 pb-32">
        <TopBar />
        <ProgressBar
          value={((currentIndex + 1) / deck.length) * 100}
          color="blue"
          size="sm"
          className="mb-4"
        />

        <Card padding="lg" className="mb-4">
          <QuestionMeta q={currentQuestion} />
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
            {currentQuestion.title}
          </h2>

          {/* Problem statement */}
          <div className="mb-4">
            <p className="text-xs font-extrabold tracking-[0.15em] text-blue-500 dark:text-blue-400 mb-2 uppercase">
              Problem
            </p>
            <pre className="font-mono text-sm leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre-wrap m-0 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              {currentQuestion.problem}
            </pre>
          </div>

          {/* Pattern hint */}
          <div className="mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40">
            <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-1">Pattern Hint</p>
            <p className="text-sm text-amber-700 dark:text-amber-300">{currentQuestion.patternHint}</p>
          </div>

          {/* Solution toggle */}
          {!showSolution ? (
            <Button
              variant="secondary"
              size="lg"
              className="w-full"
              icon={<Eye size={16} />}
              onClick={() => setShowSolution(true)}
            >
              Show Solution
            </Button>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-extrabold tracking-[0.15em] text-green-500 dark:text-green-400 uppercase">
                  Solution
                </p>
                <button
                  onClick={() => setShowSolution(false)}
                  className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex items-center gap-1"
                >
                  <EyeOff size={14} /> Hide
                </button>
              </div>
              <pre className="font-mono text-sm leading-relaxed text-green-700 dark:text-green-300 whitespace-pre-wrap m-0 bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800/40">
                {currentQuestion.solution}
              </pre>
            </div>
          )}
        </Card>

        {/* Actions */}
        <div className="flex gap-2">
          {!progress[currentQuestion.id]?.solved && (
            <Button
              variant="primary"
              size="lg"
              className="flex-1 !bg-green-600 hover:!bg-green-700"
              icon={<Check size={16} />}
              onClick={() => { markSolved(); goNext(); }}
            >
              Mark Solved
            </Button>
          )}
          <Button
            variant="secondary"
            size="lg"
            className="flex-1"
            icon={<ChevronRight size={16} />}
            iconPosition="right"
            onClick={goNext}
          >
            {currentIndex < deck.length - 1 ? 'Next' : 'Finish'}
          </Button>
        </div>
      </div>
    );
  }

  /* ── BUILD UP MODE ──────────────────────────────────────────────── */

  if (mode === 'buildup' && currentQuestion) {
    const breakdowns = currentQuestion.breakdowns;
    const allRevealed = revealedBreakdowns.size === breakdowns.length;

    return (
      <div className="max-w-2xl mx-auto px-4 pt-4 pb-32">
        <TopBar />
        <ProgressBar
          value={((currentIndex + 1) / deck.length) * 100}
          color="purple"
          size="sm"
          className="mb-4"
        />

        {/* Question header */}
        <Card padding="lg" className="mb-4">
          <QuestionMeta q={currentQuestion} />
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">
            {currentQuestion.title}
          </h2>
          <pre className="font-mono text-sm leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre-wrap m-0 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
            {currentQuestion.problem}
          </pre>
        </Card>

        {/* Breakdown steps */}
        <div className="space-y-3 mb-4">
          <p className="text-xs font-extrabold tracking-[0.15em] text-purple-500 dark:text-purple-400 uppercase">
            Build Up — Step {Math.min(breakdownStep + 1, breakdowns.length)} of {breakdowns.length}
          </p>

          {breakdowns.map((bd, i) => {
            const isActive = i <= breakdownStep;
            const isRevealed = revealedBreakdowns.has(i);

            if (!isActive) return null;

            return (
              <Card key={bd.id} padding="sm" className={`transition-all duration-300 ${isRevealed ? 'border-green-300 dark:border-green-700' : 'border-purple-300 dark:border-purple-700'}`}>
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${isRevealed ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'}`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                      {bd.q}
                    </p>
                    {isRevealed ? (
                      <pre className="font-mono text-xs leading-relaxed text-green-700 dark:text-green-300 whitespace-pre-wrap m-0 bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                        {bd.a}
                      </pre>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setRevealedBreakdowns(prev => new Set([...prev, i]));
                          if (i === breakdownStep && i < breakdowns.length - 1) {
                            setBreakdownStep(i + 1);
                          }
                        }}
                      >
                        Reveal Answer
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Full solution after all breakdowns */}
        {allRevealed && (
          <Card padding="lg" className="mb-4 border-green-300 dark:border-green-700">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-extrabold tracking-[0.15em] text-green-500 dark:text-green-400 uppercase">
                Full Solution
              </p>
            </div>
            <pre className="font-mono text-sm leading-relaxed text-green-700 dark:text-green-300 whitespace-pre-wrap m-0 bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              {currentQuestion.solution}
            </pre>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {allRevealed && !progress[currentQuestion.id]?.buildUpComplete && (
            <Button
              variant="primary"
              size="lg"
              className="flex-1 !bg-purple-600 hover:!bg-purple-700"
              icon={<Check size={16} />}
              onClick={() => { markBuildUpComplete(); goNext(); }}
            >
              Complete
            </Button>
          )}
          <Button
            variant="secondary"
            size="lg"
            className="flex-1"
            icon={<ChevronRight size={16} />}
            iconPosition="right"
            onClick={goNext}
          >
            {currentIndex < deck.length - 1 ? 'Skip' : 'Finish'}
          </Button>
        </div>
      </div>
    );
  }

  /* ── PATTERN QUIZ MODE ──────────────────────────────────────────── */

  if (mode === 'pattern' && currentQuestion) {
    const isCorrect = selectedPattern === currentQuestion.pattern;

    return (
      <div className="max-w-2xl mx-auto px-4 pt-4 pb-32">
        <TopBar />
        <ProgressBar
          value={((currentIndex + 1) / deck.length) * 100}
          color="yellow"
          size="sm"
          className="mb-2"
        />

        {/* Session score */}
        {sessionStats.total > 0 && (
          <div className="flex justify-center gap-4 mb-4 text-sm font-bold">
            <span className="text-green-500 dark:text-green-400">{sessionStats.correct} correct</span>
            {sessionStats.wrong > 0 && (
              <span className="text-red-500 dark:text-red-400">{sessionStats.wrong} wrong</span>
            )}
          </div>
        )}

        {/* Problem only (no pattern shown) */}
        <Card padding="lg" className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="difficulty" difficulty={currentQuestion.difficulty} size="sm" />
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{currentQuestion.title}</span>
          </div>
          <pre className="font-mono text-sm leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre-wrap m-0 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
            {currentQuestion.problem}
          </pre>
        </Card>

        {/* Pattern choices */}
        <p className="text-xs font-extrabold tracking-[0.15em] text-yellow-600 dark:text-yellow-400 uppercase mb-3">
          What pattern does this problem use?
        </p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {patternChoices.map(pattern => {
            let btnClass = '';
            if (patternRevealed) {
              if (pattern === currentQuestion.pattern) {
                btnClass = '!bg-green-100 dark:!bg-green-900/30 !border-green-500 !text-green-700 dark:!text-green-400';
              } else if (pattern === selectedPattern && !isCorrect) {
                btnClass = '!bg-red-100 dark:!bg-red-900/30 !border-red-500 !text-red-700 dark:!text-red-400';
              }
            } else if (pattern === selectedPattern) {
              btnClass = '!bg-blue-100 dark:!bg-blue-900/30 !border-blue-500 !text-blue-700 dark:!text-blue-400';
            }

            return (
              <Button
                key={pattern}
                variant="secondary"
                size="lg"
                className={`w-full min-h-[48px] ${btnClass}`}
                disabled={patternRevealed}
                onClick={() => setSelectedPattern(pattern)}
              >
                {pattern}
              </Button>
            );
          })}
        </div>

        {/* Submit / Result */}
        {!patternRevealed && selectedPattern && (
          <Button
            variant="primary"
            size="lg"
            className="w-full min-h-[48px] !bg-yellow-600 hover:!bg-yellow-700"
            onClick={() => {
              setPatternRevealed(true);
              markPatternResult(selectedPattern === currentQuestion.pattern);
            }}
          >
            Check Answer
          </Button>
        )}

        {patternRevealed && (
          <div className="space-y-3">
            <div className={`text-center p-3 rounded-lg font-bold ${
              isCorrect
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
            }`}>
              {isCorrect ? 'Correct!' : `Not quite — it's ${currentQuestion.pattern}`}
            </div>

            {/* Show pattern hint */}
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40">
              <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-1">Why this pattern?</p>
              <p className="text-sm text-amber-700 dark:text-amber-300">{currentQuestion.patternHint}</p>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full min-h-[48px]"
              icon={<ChevronRight size={16} />}
              iconPosition="right"
              onClick={goNext}
            >
              {currentIndex < deck.length - 1 ? 'Next' : 'Finish'}
            </Button>
          </div>
        )}
      </div>
    );
  }

  /* ── MENU MODE ──────────────────────────────────────────────────── */

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-32">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-extrabold tracking-[0.25em] text-gray-900 dark:text-gray-50">
          CODE PRACTICE
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 tracking-widest uppercase mt-1">
          Python Coding Patterns &middot; {stats.total} Problems
        </p>
      </div>

      {/* Overall stats */}
      <Card className="mb-6">
        <div className="flex justify-center gap-6">
          <div className="text-center">
            <p className="text-xl font-bold text-green-500 dark:text-green-400">{stats.solved}</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">Solved</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-purple-500 dark:text-purple-400">{stats.buildUps}</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">Built Up</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-yellow-500 dark:text-yellow-400">{stats.patternCorrect}</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">Patterns</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-gray-400 dark:text-gray-500">{stats.total - stats.solved}</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">Remaining</p>
          </div>
        </div>
        {stats.total > 0 && (
          <ProgressBar
            value={(stats.solved / stats.total) * 100}
            color="green"
            size="sm"
            showLabel
            className="mt-4"
          />
        )}
      </Card>

      {/* Topic breakdown */}
      <Card className="mb-6">
        <h2 className="text-xs font-bold tracking-[0.2em] text-gray-500 dark:text-gray-400 uppercase mb-3">
          By Pattern
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(stats.byTopic).map(([topic, { total, done }]) => (
            <div key={topic} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{topic}</span>
              <span className={`text-xs font-bold ${done === total ? 'text-green-500' : 'text-gray-400'}`}>
                {done}/{total}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Filters */}
      <Card className="mb-6">
        <h2 className="text-xs font-bold tracking-[0.2em] text-gray-500 dark:text-gray-400 uppercase mb-3">
          Filter
        </h2>

        {/* Topic filter */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <Button
            variant={topicFilter === 'all' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setTopicFilter('all')}
          >
            All
          </Button>
          {ALL_PATTERNS.map(pattern => (
            <Button
              key={pattern}
              variant={topicFilter === pattern ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setTopicFilter(pattern)}
            >
              {pattern}
            </Button>
          ))}
        </div>

        {/* Difficulty filter */}
        <div className="flex gap-2">
          {(['all', 'Easy', 'Medium'] as DifficultyFilter[]).map(d => (
            <Button
              key={d}
              variant={diffFilter === d ? 'primary' : 'ghost'}
              size="sm"
              className="flex-1"
              onClick={() => setDiffFilter(d)}
            >
              {d === 'all' ? 'All Levels' : d}
            </Button>
          ))}
        </div>

        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center">
          {filteredQuestions.length} problem{filteredQuestions.length !== 1 ? 's' : ''} match
        </p>
      </Card>

      {/* Mode buttons */}
      <Card className="mb-6">
        <h2 className="text-xs font-bold tracking-[0.2em] text-gray-500 dark:text-gray-400 uppercase mb-1">
          Full Problem
        </h2>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
          Read the problem, try to solve it, then reveal the solution.
        </p>
        <Button
          variant="primary"
          size="lg"
          className="w-full min-h-[48px]"
          icon={<Eye size={16} />}
          disabled={filteredQuestions.length === 0}
          onClick={() => startSession('full')}
        >
          Start Full Problems ({filteredQuestions.length})
        </Button>
      </Card>

      <Card className="mb-6">
        <h2 className="text-xs font-bold tracking-[0.2em] text-gray-500 dark:text-gray-400 uppercase mb-1">
          Build Up
        </h2>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
          Break each problem into atomic sub-questions. Build toward the full solution step by step.
        </p>
        <Button
          variant="primary"
          size="lg"
          className="w-full min-h-[48px] !bg-purple-600 hover:!bg-purple-700 dark:!bg-purple-700 dark:hover:!bg-purple-800"
          icon={<Shuffle size={16} />}
          disabled={filteredQuestions.length === 0}
          onClick={() => startSession('buildup')}
        >
          Start Build Up ({filteredQuestions.length})
        </Button>
      </Card>

      <Card className="mb-6">
        <h2 className="text-xs font-bold tracking-[0.2em] text-gray-500 dark:text-gray-400 uppercase mb-1">
          Pattern Quiz
        </h2>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
          See the problem statement and identify which algorithm pattern to use.
        </p>
        <Button
          variant="primary"
          size="lg"
          className="w-full min-h-[48px] !bg-yellow-600 hover:!bg-yellow-700 dark:!bg-yellow-700 dark:hover:!bg-yellow-800"
          icon={<RotateCcw size={16} />}
          disabled={filteredQuestions.length === 0}
          onClick={() => startSession('pattern')}
        >
          Start Pattern Quiz ({filteredQuestions.length})
        </Button>
      </Card>

      {/* Reset */}
      <Button
        variant="ghost"
        size="sm"
        className="w-full text-gray-400 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400"
        icon={<X size={14} />}
        onClick={resetProgress}
      >
        Reset All Progress
      </Button>
    </div>
  );
}
