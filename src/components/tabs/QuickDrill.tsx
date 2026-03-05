import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, Badge, Button, ProgressBar, Spinner } from '../ui';

/* ── Types ─────────────────────────────────────────────────────────── */

interface DrillCard {
  id: number;
  cat: string;
  topic: string;
  q: string;
  a: string;
  difficulty: number;
}

interface CardProgress {
  seen: number;
  correct: number;
  wrong: number;
  lastReviewed?: string;
}

type ProgressMap = Record<number, CardProgress>;
type Mode = 'menu' | 'flashcard' | 'quiz' | 'results';
type CategoryFilter = 'all' | 'python' | 'sql';

/* ── Helpers ───────────────────────────────────────────────────────── */

const STORAGE_KEY = 'quick_drill_progress';
const DIFF_OPTIONS = [
  { value: 0, label: 'All' },
  { value: 1, label: 'Easy only' },
  { value: 2, label: '\u2264 Medium' },
  { value: 3, label: '\u2264 Hard' },
] as const;

const DIFF_LABELS: Record<number, string> = { 1: 'Easy', 2: 'Medium', 3: 'Hard' };
const DIFF_BADGE: Record<number, 'Easy' | 'Medium' | 'Hard'> = { 1: 'Easy', 2: 'Medium', 3: 'Hard' };

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
  } catch {
    /* silent */
  }
}

function isToday(iso?: string): boolean {
  if (!iso) return false;
  return new Date(iso).toDateString() === new Date().toDateString();
}

function generateQuizOptions(card: DrillCard, allCards: DrillCard[]): string[] {
  const sameCategory = allCards.filter((c) => c.cat === card.cat && c.id !== card.id);
  const shuffled = [...sameCategory].sort(() => Math.random() - 0.5);
  const wrongAnswers = shuffled.slice(0, 3).map((c) => c.a);
  const options = [...wrongAnswers, card.a].sort(() => Math.random() - 0.5);
  return options;
}

function buildFlashcardDeck(cards: DrillCard[], progress: ProgressMap): DrillCard[] {
  const unseen = cards.filter((c) => !progress[c.id]);
  const weak = cards.filter((c) => progress[c.id] && progress[c.id].wrong > progress[c.id].correct);
  const strong = cards.filter((c) => progress[c.id] && progress[c.id].correct >= 3);
  const middle = cards.filter(
    (c) =>
      progress[c.id] &&
      !(progress[c.id].wrong > progress[c.id].correct) &&
      !(progress[c.id].correct >= 3),
  );

  const sortByReview = (a: DrillCard, b: DrillCard) => {
    const aToday = isToday(progress[a.id]?.lastReviewed);
    const bToday = isToday(progress[b.id]?.lastReviewed);
    if (aToday && !bToday) return 1;
    if (!aToday && bToday) return -1;
    return 0;
  };

  return [
    ...unseen.sort(sortByReview),
    ...weak.sort(sortByReview),
    ...middle.sort(sortByReview),
    ...strong.sort(sortByReview),
  ];
}

function buildQuizDeck(cards: DrillCard[], progress: ProgressMap): DrillCard[] {
  const weakPred = (c: DrillCard) => {
    const p = progress[c.id];
    return p && (p.wrong > 0 || (p.seen > 0 && p.correct < 2));
  };

  const weak = cards.filter(weakPred);
  const rest = cards.filter((c) => !weakPred(c));

  const sortByReview = (a: DrillCard, b: DrillCard) => {
    const aToday = isToday(progress[a.id]?.lastReviewed);
    const bToday = isToday(progress[b.id]?.lastReviewed);
    if (aToday && !bToday) return 1;
    if (!aToday && bToday) return -1;
    return 0;
  };

  return [...weak.sort(sortByReview), ...rest.sort(sortByReview)];
}

/* ── Component ─────────────────────────────────────────────────────── */

export default function QuickDrill() {
  const [allCards, setAllCards] = useState<DrillCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [mode, setMode] = useState<Mode>('menu');
  const [deck, setDeck] = useState<DrillCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [progress, setProgress] = useState<ProgressMap>(loadProgress);
  const [diffFilter, setDiffFilter] = useState(0);
  const [sessionStats, setSessionStats] = useState({ correct: 0, wrong: 0, seen: 0 });

  // Quiz-specific
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);

  /* ── Fetch cards ─────────────────────────────────────────────────── */

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/data/quick-drill-cards.json');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: DrillCard[] = await res.json();
        if (!cancelled) {
          setAllCards(data);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setFetchError(err instanceof Error ? err.message : 'Failed to load cards');
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ── Derived stats ───────────────────────────────────────────────── */

  const stats = useMemo(() => {
    const total = allCards.length;
    const python = allCards.filter((c) => c.cat === 'Python').length;
    const sql = allCards.filter((c) => c.cat === 'SQL').length;
    const mastered = Object.values(progress).filter((v) => v.correct >= 3).length;
    const weak = Object.values(progress).filter((v) => v.wrong > v.correct).length;
    const unseen = total - Object.keys(progress).filter((id) => allCards.some((c) => c.id === Number(id))).length;
    return { total, python, sql, mastered, weak, unseen };
  }, [allCards, progress]);

  /* ── Persistence helper ──────────────────────────────────────────── */

  const persistProgress = useCallback((updated: ProgressMap) => {
    setProgress(updated);
    saveProgress(updated);
  }, []);

  /* ── Session management ──────────────────────────────────────────── */

  const startSession = useCallback(
    (cat: CategoryFilter, studyMode: 'flashcard' | 'quiz') => {
      let filtered = allCards;
      if (cat === 'python') filtered = allCards.filter((c) => c.cat === 'Python');
      if (cat === 'sql') filtered = allCards.filter((c) => c.cat === 'SQL');
      if (diffFilter > 0) filtered = filtered.filter((c) => c.difficulty <= diffFilter);

      const ordered =
        studyMode === 'quiz'
          ? buildQuizDeck(filtered, progress)
          : buildFlashcardDeck(filtered, progress);

      setDeck(ordered);
      setCurrentIndex(0);
      setShowAnswer(false);
      setQuizAnswer(null);
      setSessionStats({ correct: 0, wrong: 0, seen: 0 });

      if (studyMode === 'quiz' && ordered.length > 0) {
        setQuizOptions(generateQuizOptions(ordered[0], allCards));
      }
      setMode(studyMode);
    },
    [allCards, diffFilter, progress],
  );

  /* ── Card interactions ───────────────────────────────────────────── */

  const currentCard = deck[currentIndex] as DrillCard | undefined;

  const advanceCard = useCallback(() => {
    setShowAnswer(false);
    setQuizAnswer(null);
    const next = currentIndex + 1;
    if (next < deck.length) {
      setCurrentIndex(next);
      if (mode === 'quiz') {
        setQuizOptions(generateQuizOptions(deck[next], allCards));
      }
    } else {
      setMode('results');
    }
  }, [currentIndex, deck, mode, allCards]);

  const markFlashcard = useCallback(
    (knew: boolean) => {
      if (!currentCard) return;
      const prev = progress[currentCard.id] || { seen: 0, correct: 0, wrong: 0 };
      const updated: ProgressMap = {
        ...progress,
        [currentCard.id]: {
          seen: prev.seen + 1,
          correct: prev.correct + (knew ? 1 : 0),
          wrong: prev.wrong + (knew ? 0 : 1),
          lastReviewed: new Date().toISOString(),
        },
      };
      persistProgress(updated);
      setSessionStats((s) => ({
        seen: s.seen + 1,
        correct: s.correct + (knew ? 1 : 0),
        wrong: s.wrong + (knew ? 0 : 1),
      }));
      advanceCard();
    },
    [currentCard, progress, persistProgress, advanceCard],
  );

  const handleQuizSelect = useCallback(
    (option: string) => {
      if (quizAnswer !== null || !currentCard) return;
      setQuizAnswer(option);
      const isCorrect = option === currentCard.a;
      const prev = progress[currentCard.id] || { seen: 0, correct: 0, wrong: 0 };
      const updated: ProgressMap = {
        ...progress,
        [currentCard.id]: {
          seen: prev.seen + 1,
          correct: prev.correct + (isCorrect ? 1 : 0),
          wrong: prev.wrong + (isCorrect ? 0 : 1),
          lastReviewed: new Date().toISOString(),
        },
      };
      persistProgress(updated);
      setSessionStats((s) => ({
        seen: s.seen + 1,
        correct: s.correct + (isCorrect ? 1 : 0),
        wrong: s.wrong + (isCorrect ? 0 : 1),
      }));
    },
    [quizAnswer, currentCard, progress, persistProgress],
  );

  const resetProgress = useCallback(() => {
    persistProgress({});
  }, [persistProgress]);

  /* ── Loading / Error ─────────────────────────────────────────────── */

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
          Failed to load drill cards: {fetchError}
        </p>
        <Button variant="secondary" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  /* ── Results Screen ──────────────────────────────────────────────── */

  if (mode === 'results') {
    const pct = sessionStats.seen > 0 ? Math.round((sessionStats.correct / sessionStats.seen) * 100) : 0;
    return (
      <div className="max-w-lg mx-auto px-4 pt-12 pb-32 text-center">
        <Card padding="lg">
          <p className="text-xs font-bold tracking-[0.25em] text-gray-500 dark:text-gray-400 uppercase mb-4">
            SESSION DONE
          </p>
          <p className="text-6xl font-extrabold text-gray-900 dark:text-gray-50 leading-none">
            {pct}%
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            {sessionStats.correct} correct / {sessionStats.seen} total
          </p>
          <p
            className={`text-sm mt-2 ${
              sessionStats.wrong > 0
                ? 'text-red-500 dark:text-red-400'
                : 'text-green-500 dark:text-green-400'
            }`}
          >
            {sessionStats.wrong > 0 ? `${sessionStats.wrong} to review` : 'Clean run!'}
          </p>
          <div className="mt-6">
            <Button variant="secondary" size="lg" onClick={() => setMode('menu')}>
              Back to Menu
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  /* ── Top Bar (shared by flashcard & quiz) ─────────────────────────── */

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
        {currentIndex + 1}/{deck.length}
      </span>
      <span className="text-sm font-bold text-green-500 dark:text-green-400">
        {sessionStats.correct}/{sessionStats.seen}
      </span>
    </div>
  );

  /* ── Card meta badges ────────────────────────────────────────────── */

  const CardMeta = ({ card }: { card: DrillCard }) => (
    <div className="flex items-center gap-2 mb-3 flex-wrap">
      <Badge
        label={card.cat}
        color={card.cat === 'Python' ? 'blue' : 'green'}
        size="sm"
      />
      <Badge label={card.topic} color="gray" size="sm" />
      {DIFF_BADGE[card.difficulty] && (
        <Badge
          label={DIFF_LABELS[card.difficulty]}
          variant="difficulty"
          difficulty={DIFF_BADGE[card.difficulty]}
          size="sm"
          className="ml-auto"
        />
      )}
    </div>
  );

  /* ── Empty deck guard ────────────────────────────────────────────── */

  if ((mode === 'flashcard' || mode === 'quiz') && !currentCard) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-16 pb-32 text-center">
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
          No cards match the current filter.
        </p>
        <Button variant="secondary" onClick={() => setMode('menu')}>
          Back to Menu
        </Button>
      </div>
    );
  }

  /* ── Flashcard Mode ──────────────────────────────────────────────── */

  if (mode === 'flashcard' && currentCard) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-4 pb-32">
        <TopBar />
        <CardMeta card={currentCard} />
        <ProgressBar
          value={((currentIndex + 1) / deck.length) * 100}
          color="blue"
          size="sm"
          className="mb-4"
        />
        <Card
          padding="lg"
          hover
          onClick={() => setShowAnswer(true)}
          className="min-h-[180px] relative"
        >
          <p className="text-xs font-extrabold tracking-[0.15em] text-blue-500 dark:text-blue-400 mb-2">
            Q
          </p>
          <pre className="font-mono text-sm leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre-wrap m-0">
            {currentCard.q}
          </pre>

          {!showAnswer && (
            <p className="text-center text-xs text-gray-400 dark:text-gray-600 tracking-widest mt-6">
              tap to reveal
            </p>
          )}

          {showAnswer && (
            <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs font-extrabold tracking-[0.15em] text-green-500 dark:text-green-400 mb-2">
                A
              </p>
              <pre className="font-mono text-xs leading-relaxed text-green-700 dark:text-green-300 whitespace-pre-wrap m-0">
                {currentCard.a}
              </pre>
            </div>
          )}
        </Card>

        {showAnswer && (
          <div className="flex gap-3 mt-4">
            <Button
              variant="danger"
              size="lg"
              className="flex-1 min-h-[48px]"
              onClick={() => markFlashcard(false)}
            >
              Didn't know
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="flex-1 min-h-[48px] !bg-green-600 hover:!bg-green-700 dark:!bg-green-700 dark:hover:!bg-green-800"
              onClick={() => markFlashcard(true)}
            >
              Knew it
            </Button>
          </div>
        )}
      </div>
    );
  }

  /* ── Quiz Mode ───────────────────────────────────────────────────── */

  if (mode === 'quiz' && currentCard) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-4 pb-32">
        <TopBar />
        <CardMeta card={currentCard} />
        <ProgressBar
          value={((currentIndex + 1) / deck.length) * 100}
          color="purple"
          size="sm"
          className="mb-4"
        />

        <Card padding="lg" className="mb-4">
          <p className="text-xs font-extrabold tracking-[0.15em] text-blue-500 dark:text-blue-400 mb-2">
            Q
          </p>
          <pre className="font-mono text-sm leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre-wrap m-0">
            {currentCard.q}
          </pre>
        </Card>

        <div className="flex flex-col gap-2">
          {quizOptions.map((opt, i) => {
            const isSelected = quizAnswer === opt;
            const isCorrectAnswer = opt === currentCard.a;
            const answered = quizAnswer !== null;

            let borderClass = 'border-gray-200 dark:border-gray-700';
            let bgClass = '';
            if (answered && isCorrectAnswer) {
              borderClass = 'border-green-500 dark:border-green-400';
              bgClass = 'bg-green-50 dark:bg-green-900/20';
            } else if (answered && isSelected && !isCorrectAnswer) {
              borderClass = 'border-red-500 dark:border-red-400';
              bgClass = 'bg-red-50 dark:bg-red-900/20';
            }

            return (
              <button
                key={i}
                onClick={() => handleQuizSelect(opt)}
                disabled={answered}
                className={[
                  'w-full text-left rounded-lg border-2 p-3 min-h-[48px] transition-colors',
                  'bg-white dark:bg-gray-800',
                  borderClass,
                  bgClass,
                  !answered ? 'cursor-pointer hover:border-blue-400 dark:hover:border-blue-500' : 'cursor-default',
                  answered ? '' : 'active:scale-[0.98]',
                ].join(' ')}
              >
                <pre className="font-mono text-xs leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap m-0">
                  {opt}
                </pre>
              </button>
            );
          })}
        </div>

        {quizAnswer !== null && (
          <div className="mt-4">
            <Button size="lg" className="w-full min-h-[48px]" onClick={advanceCard}>
              Next &rarr;
            </Button>
          </div>
        )}
      </div>
    );
  }

  /* ── Menu Mode (default) ─────────────────────────────────────────── */

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-32">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-extrabold tracking-[0.25em] text-gray-900 dark:text-gray-50">
          QUICK DRILL
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 tracking-widest uppercase mt-1">
          Passive Study &middot; {stats.total} Cards
        </p>
      </div>

      {/* Stats */}
      <Card className="mb-6">
        <div className="flex justify-center gap-8">
          <div className="text-center">
            <p className="text-xl font-bold text-green-500 dark:text-green-400">{stats.mastered}</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">
              Mastered
            </p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-yellow-500 dark:text-yellow-400">{stats.weak}</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">
              Weak
            </p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-gray-400 dark:text-gray-500">{stats.unseen}</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">
              Unseen
            </p>
          </div>
        </div>
        {stats.total > 0 && (
          <ProgressBar
            value={((stats.mastered) / stats.total) * 100}
            color="green"
            size="sm"
            className="mt-4"
          />
        )}
      </Card>

      {/* Difficulty Filter */}
      <Card className="mb-6">
        <h2 className="text-xs font-bold tracking-[0.2em] text-gray-500 dark:text-gray-400 uppercase mb-3">
          Difficulty Filter
        </h2>
        <div className="flex gap-2">
          {DIFF_OPTIONS.map((d) => (
            <Button
              key={d.value}
              variant={diffFilter === d.value ? 'primary' : 'ghost'}
              size="sm"
              className="flex-1 min-h-[48px]"
              onClick={() => setDiffFilter(d.value)}
            >
              {d.label}
            </Button>
          ))}
        </div>
      </Card>

      {/* Flashcard Section */}
      <Card className="mb-6">
        <h2 className="text-xs font-bold tracking-[0.2em] text-gray-500 dark:text-gray-400 uppercase mb-1">
          Flashcards
        </h2>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
          Tap to reveal. Unseen first, then weak.
        </p>
        <div className="flex gap-2">
          <Button
            variant="primary"
            size="md"
            className="flex-1 min-h-[48px] !bg-blue-700 hover:!bg-blue-800 dark:!bg-blue-800 dark:hover:!bg-blue-900"
            onClick={() => startSession('python', 'flashcard')}
          >
            Python ({stats.python})
          </Button>
          <Button
            variant="primary"
            size="md"
            className="flex-1 min-h-[48px] !bg-emerald-700 hover:!bg-emerald-800 dark:!bg-emerald-800 dark:hover:!bg-emerald-900"
            onClick={() => startSession('sql', 'flashcard')}
          >
            SQL ({stats.sql})
          </Button>
          <Button
            variant="secondary"
            size="md"
            className="flex-1 min-h-[48px]"
            onClick={() => startSession('all', 'flashcard')}
          >
            All
          </Button>
        </div>
      </Card>

      {/* Quiz Section */}
      <Card className="mb-6">
        <h2 className="text-xs font-bold tracking-[0.2em] text-gray-500 dark:text-gray-400 uppercase mb-1">
          Quiz Mode
        </h2>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
          Multiple choice. Weak cards first.
        </p>
        <div className="flex gap-2">
          <Button
            variant="primary"
            size="md"
            className="flex-1 min-h-[48px] !bg-blue-700 hover:!bg-blue-800 dark:!bg-blue-800 dark:hover:!bg-blue-900"
            onClick={() => startSession('python', 'quiz')}
          >
            Python
          </Button>
          <Button
            variant="primary"
            size="md"
            className="flex-1 min-h-[48px] !bg-emerald-700 hover:!bg-emerald-800 dark:!bg-emerald-800 dark:hover:!bg-emerald-900"
            onClick={() => startSession('sql', 'quiz')}
          >
            SQL
          </Button>
          <Button
            variant="secondary"
            size="md"
            className="flex-1 min-h-[48px]"
            onClick={() => startSession('all', 'quiz')}
          >
            All
          </Button>
        </div>
      </Card>

      {/* Reset */}
      <Button
        variant="ghost"
        size="sm"
        className="w-full text-gray-400 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400"
        onClick={resetProgress}
      >
        Reset All Progress
      </Button>
    </div>
  );
}
