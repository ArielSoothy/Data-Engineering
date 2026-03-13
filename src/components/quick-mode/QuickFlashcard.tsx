import { useState, useCallback, useMemo } from 'react';
import { createEmptyCard, fsrs, Rating, State, type Card as FSRSCard, type Grade } from 'ts-fsrs';
import { SkipForward, RotateCcw } from 'lucide-react';
import { Card, Badge, Button } from '../ui';
import { pushProgressDebounced } from '../../services/progressSync';
import type { UnifiedQuestion } from '../../types/studyHub';

// --- FSRS persistence (shared keys with QuickDrill and StudyHub FlashcardMode) ---

const FSRS_KEY_DRILL = 'quick_drill_fsrs';
const FSRS_KEY_HUB = 'study_hub_fsrs';

interface SerializedFSRSCard {
  due: string;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  learning_steps: number;
  reps: number;
  lapses: number;
  state: number;
  last_review?: string;
}

type FSRSStateMap = Record<string, FSRSCard>;
const scheduler = fsrs({ request_retention: 0.9, enable_fuzz: true });

function loadFsrs(key: string): FSRSStateMap {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, SerializedFSRSCard>;
    const result: FSRSStateMap = {};
    for (const [id, card] of Object.entries(parsed)) {
      result[id] = {
        ...card,
        due: new Date(card.due),
        state: card.state as State,
        last_review: card.last_review ? new Date(card.last_review) : undefined,
      };
    }
    return result;
  } catch { return {}; }
}

function saveFsrs(key: string, state: FSRSStateMap) {
  try {
    const serialized: Record<string, SerializedFSRSCard> = {};
    for (const [id, card] of Object.entries(state)) {
      serialized[id] = {
        ...card,
        due: card.due instanceof Date ? card.due.toISOString() : String(card.due),
        state: card.state as number,
        last_review: card.last_review instanceof Date ? card.last_review.toISOString() : undefined,
      };
    }
    localStorage.setItem(key, JSON.stringify(serialized));
  } catch { /* ignore */ }
}

function getFsrsId(q: UnifiedQuestion): string {
  return q.source === 'quickDrill' ? String(q.sourceId) : q.uid;
}

function getFsrsKey(q: UnifiedQuestion): string {
  return q.source === 'quickDrill' ? FSRS_KEY_DRILL : FSRS_KEY_HUB;
}

// --- Component ---

interface Props { questions: UnifiedQuestion[] }

export default function QuickFlashcard({ questions }: Props) {
  const [drillFsrs, setDrillFsrs] = useState<FSRSStateMap>(() => loadFsrs(FSRS_KEY_DRILL));
  const [hubFsrs, setHubFsrs] = useState<FSRSStateMap>(() => loadFsrs(FSRS_KEY_HUB));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [stats, setStats] = useState({ correct: 0, wrong: 0, seen: 0 });
  const [done, setDone] = useState(false);

  // Build deck: due → new → scheduled
  const deck = useMemo(() => {
    const now = new Date();
    const due: UnifiedQuestion[] = [];
    const fresh: UnifiedQuestion[] = [];
    const later: UnifiedQuestion[] = [];

    for (const q of questions) {
      const store = q.source === 'quickDrill' ? drillFsrs : hubFsrs;
      const fc = store[getFsrsId(q)];
      if (!fc) fresh.push(q);
      else if (fc.due <= now) due.push(q);
      else later.push(q);
    }

    const getCard = (q: UnifiedQuestion) => {
      const store = q.source === 'quickDrill' ? drillFsrs : hubFsrs;
      return store[getFsrsId(q)]!;
    };
    due.sort((a, b) => getCard(a).due.getTime() - getCard(b).due.getTime());
    later.sort((a, b) => getCard(a).due.getTime() - getCard(b).due.getTime());

    return [...due, ...fresh, ...later];
  }, [questions, drillFsrs, hubFsrs]);

  const current = deck[currentIndex] as UnifiedQuestion | undefined;

  const dueCount = useMemo(() => {
    const now = new Date();
    return questions.filter(q => {
      const store = q.source === 'quickDrill' ? drillFsrs : hubFsrs;
      const fc = store[getFsrsId(q)];
      return fc && fc.due <= now;
    }).length;
  }, [questions, drillFsrs, hubFsrs]);

  const newCount = useMemo(() => {
    return questions.filter(q => {
      const store = q.source === 'quickDrill' ? drillFsrs : hubFsrs;
      return !store[getFsrsId(q)];
    }).length;
  }, [questions, drillFsrs, hubFsrs]);

  const advance = useCallback(() => {
    setShowAnswer(false);
    if (currentIndex + 1 < deck.length) setCurrentIndex(i => i + 1);
    else setDone(true);
  }, [currentIndex, deck.length]);

  const markCard = useCallback((grade: Grade) => {
    if (!current) return;
    const now = new Date();
    const fsrsId = getFsrsId(current);
    const key = getFsrsKey(current);
    const store = current.source === 'quickDrill' ? drillFsrs : hubFsrs;
    const setStore = current.source === 'quickDrill' ? setDrillFsrs : setHubFsrs;

    const existing = store[fsrsId] || createEmptyCard(now);
    const result = scheduler.next(existing, now, grade);
    const updated = { ...store, [fsrsId]: result.card };
    setStore(updated);
    saveFsrs(key, updated);
    pushProgressDebounced();

    const knew = grade >= Rating.Good;
    setStats(s => ({ seen: s.seen + 1, correct: s.correct + (knew ? 1 : 0), wrong: s.wrong + (knew ? 0 : 1) }));
    advance();
  }, [current, drillFsrs, hubFsrs, advance]);

  const reset = () => {
    setCurrentIndex(0);
    setShowAnswer(false);
    setStats({ correct: 0, wrong: 0, seen: 0 });
    setDone(false);
  };

  // Session done
  if (done || (deck.length > 0 && !current)) {
    const pct = stats.seen > 0 ? Math.round((stats.correct / stats.seen) * 100) : 0;
    return (
      <div className="max-w-lg mx-auto text-center pt-4">
        <Card padding="lg">
          <p className="text-xs font-bold tracking-widest text-gray-500 dark:text-gray-400 uppercase mb-4">SESSION DONE</p>
          <p className={`text-6xl font-extrabold ${pct >= 80 ? 'text-green-500' : pct >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>{pct}%</p>
          <div className="flex justify-center gap-6 mt-4 text-sm">
            <span className="text-green-500 font-bold">{stats.correct} correct</span>
            <span className="text-red-500 font-bold">{stats.wrong} wrong</span>
            <span className="text-gray-400">{stats.seen} cards</span>
          </div>
          <div className="mt-6">
            <Button variant="secondary" size="lg" onClick={reset} icon={<RotateCcw size={16} />}>Study Again</Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!current) return <div className="text-center py-8 text-gray-400">No cards available.</div>;

  // Card state badge
  const store = current.source === 'quickDrill' ? drillFsrs : hubFsrs;
  const fc = store[getFsrsId(current)];
  const stateLabel = !fc ? 'New' : fc.state === State.Review ? 'Review' : fc.state === State.Learning ? 'Learning' : 'Due';

  return (
    <div className="max-w-lg mx-auto">
      {/* Progress bar */}
      <div className="flex items-center gap-3 mb-4 text-xs text-gray-500 dark:text-gray-400">
        <span>{currentIndex + 1} / {deck.length}</span>
        <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 transition-all" style={{ width: `${((currentIndex + 1) / deck.length) * 100}%` }} />
        </div>
        <span className="text-amber-500">{dueCount} due</span>
        <span className="text-blue-500">{newCount} new</span>
      </div>

      {/* Flashcard */}
      <Card padding="lg" className="min-h-[280px] flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant={current.difficulty === 'Easy' ? 'success' : current.difficulty === 'Medium' ? 'warning' : 'danger'}>
            {current.difficulty}
          </Badge>
          {current.topic && <Badge variant="info">{current.topic}</Badge>}
          <Badge variant={stateLabel === 'New' ? 'info' : stateLabel === 'Review' ? 'success' : 'warning'}>{stateLabel}</Badge>
        </div>

        <div className="flex-1">
          <p className="text-gray-900 dark:text-gray-100 font-medium whitespace-pre-wrap">{current.question}</p>
          {showAnswer && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg overflow-x-auto">
                {current.answer}
              </pre>
            </div>
          )}
        </div>

        {/* Actions */}
        {!showAnswer ? (
          <div className="flex gap-3 mt-4">
            <Button variant="primary" size="lg" className="flex-1" onClick={() => setShowAnswer(true)}>
              Show Answer
            </Button>
            <Button variant="ghost" size="lg" onClick={advance} icon={<SkipForward size={16} />}>
              Skip
            </Button>
          </div>
        ) : (
          <div className="flex gap-2 mt-4">
            <button onClick={() => markCard(Rating.Again)} className="flex-1 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold text-sm hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
              Again
            </button>
            <button onClick={() => markCard(Rating.Hard)} className="flex-1 py-3 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 font-bold text-sm hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors">
              Hard
            </button>
            <button onClick={() => markCard(Rating.Good)} className="flex-1 py-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 font-bold text-sm hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
              Good
            </button>
            <button onClick={() => markCard(Rating.Easy)} className="flex-1 py-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold text-sm hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
              Easy
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}
