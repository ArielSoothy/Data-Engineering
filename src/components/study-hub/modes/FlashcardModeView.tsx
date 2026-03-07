import { useState, useCallback, useMemo } from 'react';
import { createEmptyCard, fsrs, Rating, State, type Card as FSRSCard, type Grade } from 'ts-fsrs';
import { Card, Badge, Button, ProgressBar } from '../../ui';
import { pushProgressDebounced } from '../../../services/progressSync';
import type { UnifiedQuestion } from '../../../types/studyHub';

// --- FSRS persistence ---

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

type FSRSStateMap = Record<string, FSRSCard>; // keyed by uid

const fsrsScheduler = fsrs({ request_retention: 0.9, enable_fuzz: true });

function loadFsrsState(key: string): FSRSStateMap {
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
  } catch {
    return {};
  }
}

function saveFsrsState(key: string, state: FSRSStateMap) {
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
    pushProgressDebounced();
  } catch (e) {
    console.warn('[FlashcardMode] Failed to save FSRS state:', e);
  }
}

// For drill cards, map uid→numeric id for backward compat with quick_drill_fsrs
function getDrillFsrsId(q: UnifiedQuestion): string {
  return q.source === 'quickDrill' ? String(q.sourceId) : q.uid;
}

function getFsrsKey(q: UnifiedQuestion): string {
  return q.source === 'quickDrill' ? FSRS_KEY_DRILL : FSRS_KEY_HUB;
}

// --- Component ---

interface Props {
  questions: UnifiedQuestion[];
}

export default function FlashcardModeView({ questions }: Props) {
  const [drillFsrs, setDrillFsrs] = useState<FSRSStateMap>(() => {
    // Load drill FSRS with string keys (convert numeric keys)
    const raw = loadFsrsState(FSRS_KEY_DRILL);
    return raw;
  });
  const [hubFsrs, setHubFsrs] = useState<FSRSStateMap>(() => loadFsrsState(FSRS_KEY_HUB));

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, wrong: 0, seen: 0 });
  const [sessionDone, setSessionDone] = useState(false);

  // Build deck: due → new → upcoming
  const deck = useMemo(() => {
    const now = new Date();
    const due: UnifiedQuestion[] = [];
    const newCards: UnifiedQuestion[] = [];
    const upcoming: UnifiedQuestion[] = [];

    for (const q of questions) {
      const fsrsId = getDrillFsrsId(q);
      const store = q.source === 'quickDrill' ? drillFsrs : hubFsrs;
      const fc = store[fsrsId];
      if (!fc) {
        newCards.push(q);
      } else if (fc.due <= now) {
        due.push(q);
      } else {
        upcoming.push(q);
      }
    }

    const getCard = (q: UnifiedQuestion) => {
      const store = q.source === 'quickDrill' ? drillFsrs : hubFsrs;
      return store[getDrillFsrsId(q)]!;
    };

    due.sort((a, b) => getCard(a).due.getTime() - getCard(b).due.getTime());
    upcoming.sort((a, b) => getCard(a).due.getTime() - getCard(b).due.getTime());

    return [...due, ...newCards, ...upcoming];
  }, [questions, drillFsrs, hubFsrs]);

  const currentCard = deck[currentIndex] as UnifiedQuestion | undefined;

  const dueCount = useMemo(() => {
    const now = new Date();
    return questions.filter(q => {
      const store = q.source === 'quickDrill' ? drillFsrs : hubFsrs;
      const fc = store[getDrillFsrsId(q)];
      return fc && fc.due <= now;
    }).length;
  }, [questions, drillFsrs, hubFsrs]);

  const advanceCard = useCallback(() => {
    setShowAnswer(false);
    const next = currentIndex + 1;
    if (next < deck.length) {
      setCurrentIndex(next);
    } else {
      setSessionDone(true);
    }
  }, [currentIndex, deck.length]);

  const markCard = useCallback(
    (grade: Grade) => {
      if (!currentCard) return;
      const now = new Date();
      const fsrsId = getDrillFsrsId(currentCard);
      const fsrsKey = getFsrsKey(currentCard);
      const store = currentCard.source === 'quickDrill' ? drillFsrs : hubFsrs;
      const setStore = currentCard.source === 'quickDrill' ? setDrillFsrs : setHubFsrs;

      const existing = store[fsrsId] || createEmptyCard(now);
      const result = fsrsScheduler.next(existing, now, grade);
      const updated = { ...store, [fsrsId]: result.card };
      setStore(updated);
      saveFsrsState(fsrsKey, updated);

      const knew = grade >= Rating.Good;
      setSessionStats(s => ({
        seen: s.seen + 1,
        correct: s.correct + (knew ? 1 : 0),
        wrong: s.wrong + (knew ? 0 : 1),
      }));
      advanceCard();
    },
    [currentCard, drillFsrs, hubFsrs, advanceCard],
  );

  // --- Session done ---
  if (sessionDone || (deck.length > 0 && !currentCard)) {
    const pct = sessionStats.seen > 0 ? Math.round((sessionStats.correct / sessionStats.seen) * 100) : 0;
    return (
      <div className="max-w-lg mx-auto text-center pt-8">
        <Card padding="lg">
          <p className="text-xs font-bold tracking-widest text-gray-500 dark:text-gray-400 uppercase mb-4">
            SESSION DONE
          </p>
          <p className={`text-6xl font-extrabold ${pct >= 80 ? 'text-green-500' : pct >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
            {pct}%
          </p>
          <div className="flex justify-center gap-6 mt-4 text-sm">
            <span className="text-green-500 font-bold">{sessionStats.correct} correct</span>
            <span className="text-red-500 font-bold">{sessionStats.wrong} wrong</span>
            <span className="text-gray-400">{sessionStats.seen} cards</span>
          </div>
          <div className="mt-6">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => {
                setCurrentIndex(0);
                setShowAnswer(false);
                setSessionStats({ correct: 0, wrong: 0, seen: 0 });
                setSessionDone(false);
              }}
            >
              Restart
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // --- Empty ---
  if (deck.length === 0) {
    return (
      <p className="text-center text-gray-400 dark:text-gray-500 py-12 text-sm">
        No flashcards match your filters.
      </p>
    );
  }

  // --- Flashcard UI ---
  const q = currentCard!;
  const fsrsId = getDrillFsrsId(q);
  const store = q.source === 'quickDrill' ? drillFsrs : hubFsrs;
  const fc = store[fsrsId];

  return (
    <div className="max-w-lg mx-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
          {currentIndex + 1} / {deck.length}
        </span>
        <div className="flex items-center gap-2 text-sm">
          {dueCount > 0 && (
            <Badge label={`${dueCount} due`} color="blue" size="sm" />
          )}
          <span className="text-green-500 font-bold">{sessionStats.correct}</span>
          {sessionStats.wrong > 0 && (
            <span className="text-red-500 font-bold">{sessionStats.wrong}</span>
          )}
        </div>
      </div>

      {/* FSRS status */}
      <div className="flex items-center gap-2 mb-2">
        {!fc ? (
          <Badge label="New" color="gray" size="sm" />
        ) : (
          <>
            <Badge
              label={fc.due <= new Date() ? 'Due' : fc.state === State.Learning || fc.state === State.Relearning ? 'Learning' : 'Scheduled'}
              color={fc.due <= new Date() ? 'blue' : 'green'}
              size="sm"
            />
            {fc.stability > 0 && (
              <div className="flex items-center gap-1.5 ml-1">
                <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-red-400 via-yellow-400 to-green-400"
                    style={{ width: `${Math.min(100, (fc.stability / 30) * 100)}%` }}
                  />
                </div>
                <span className="text-[10px] text-gray-400">{Math.round(fc.stability * 10) / 10}d</span>
              </div>
            )}
          </>
        )}
        <Badge
          label={q.subject.toUpperCase()}
          color={q.subject === 'python' ? 'blue' : 'green'}
          size="sm"
          className="ml-auto"
        />
      </div>

      <ProgressBar
        value={((currentIndex + 1) / deck.length) * 100}
        color="blue"
        size="sm"
        className="mb-4"
      />

      {/* Card */}
      <Card padding="lg" hover onClick={() => setShowAnswer(true)} className="min-h-[180px]">
        <p className="text-xs font-extrabold tracking-widest text-blue-500 dark:text-blue-400 mb-2">Q</p>
        <pre className="font-mono text-sm leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre-wrap m-0">
          {q.question}
        </pre>

        {!showAnswer && (
          <div className="mt-6 flex flex-col items-center gap-2">
            <p className="text-xs text-gray-400 dark:text-gray-600 tracking-widest">tap to reveal</p>
            <button
              onClick={e => { e.stopPropagation(); advanceCard(); }}
              className="text-xs text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 underline"
            >
              skip
            </button>
          </div>
        )}

        {showAnswer && (
          <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs font-extrabold tracking-widest text-green-500 dark:text-green-400 mb-2">A</p>
            <pre className="font-mono text-xs leading-relaxed text-green-700 dark:text-green-300 whitespace-pre-wrap m-0">
              {q.answer}
            </pre>
          </div>
        )}
      </Card>

      {/* Rating buttons */}
      {showAnswer && (
        <div className="flex gap-2 mt-4">
          <Button variant="danger" size="lg" className="flex-1 min-h-[48px]" onClick={() => markCard(Rating.Again)}>
            Again
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="flex-1 min-h-[48px] !bg-orange-500 hover:!bg-orange-600 dark:!bg-orange-600 dark:hover:!bg-orange-700 !text-white"
            onClick={() => markCard(Rating.Hard)}
          >
            Hard
          </Button>
          <Button
            variant="primary"
            size="lg"
            className="flex-1 min-h-[48px] !bg-green-600 hover:!bg-green-700 dark:!bg-green-700 dark:hover:!bg-green-800"
            onClick={() => markCard(Rating.Good)}
          >
            Good
          </Button>
          <Button
            variant="primary"
            size="lg"
            className="flex-1 min-h-[48px] !bg-sky-600 hover:!bg-sky-700 dark:!bg-sky-700 dark:hover:!bg-sky-800"
            onClick={() => markCard(Rating.Easy)}
          >
            Easy
          </Button>
        </div>
      )}
    </div>
  );
}
