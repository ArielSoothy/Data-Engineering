import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { createEmptyCard, fsrs, Rating, State, type Card as FSRSCard, type Grade } from 'ts-fsrs';
import { SkipForward, RotateCcw, ChevronLeft, ChevronRight, ChevronDown, List, CheckCircle } from 'lucide-react';
import { Card, Badge, Button } from '../ui';
import { pushProgressDebounced } from '../../services/progressSync';
import { useAppContext } from '../../context/AppContext';
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

// --- Session persistence (localStorage — survives browser close) ---
const FC_SESSION_KEY = 'quick_flashcard_session';
interface FCSession { currentIndex: number; stats: { correct: number; wrong: number; seen: number }; deckLen: number }

function saveFCSession(s: FCSession) { try { localStorage.setItem(FC_SESSION_KEY, JSON.stringify(s)); } catch {} }
function loadFCSession(): FCSession | null { try { const r = localStorage.getItem(FC_SESSION_KEY); return r ? JSON.parse(r) : null; } catch { return null; } }
function clearFCSession() { localStorage.removeItem(FC_SESSION_KEY); }

// --- Component ---

interface Props { questions: UnifiedQuestion[] }

export default function QuickFlashcard({ questions }: Props) {
  const { updateProgress } = useAppContext();
  const [drillFsrs, setDrillFsrs] = useState<FSRSStateMap>(() => loadFsrs(FSRS_KEY_DRILL));
  const [hubFsrs, setHubFsrs] = useState<FSRSStateMap>(() => loadFsrs(FSRS_KEY_HUB));
  const [currentIndex, setCurrentIndex] = useState(() => { const s = loadFCSession(); return s ? s.currentIndex : 0; });
  const [showAnswer, setShowAnswer] = useState(false);
  const [stats, setStats] = useState(() => { const s = loadFCSession(); return s ? s.stats : { correct: 0, wrong: 0, seen: 0 }; });
  const [done, setDone] = useState(false);
  const [jumpOpen, setJumpOpen] = useState(false);
  const [jumpValue, setJumpValue] = useState('');
  const [listOpen, setListOpen] = useState(false);
  const activeItemRef = useRef<HTMLButtonElement>(null);

  // Scroll active question into view when list opens
  useEffect(() => {
    if (listOpen && activeItemRef.current) {
      activeItemRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [listOpen]);

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
    if (currentIndex + 1 < deck.length) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setStats(s => { saveFCSession({ currentIndex: nextIdx, stats: s, deckLen: deck.length }); return s; });
    } else {
      clearFCSession();
      setDone(true);
    }
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
    setStats(s => {
      const next = { seen: s.seen + 1, correct: s.correct + (knew ? 1 : 0), wrong: s.wrong + (knew ? 0 : 1) };
      saveFCSession({ currentIndex, stats: next, deckLen: deck.length });
      return next;
    });
    // Update AppContext progress so Dashboard reflects it
    if (knew) {
      updateProgress(current.progressKey, current.progressId, true);
    }
    advance();
  }, [current, drillFsrs, hubFsrs, advance, updateProgress]);

  const reset = () => {
    clearFCSession();
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

  const goTo = (idx: number) => {
    const clamped = Math.max(0, Math.min(deck.length - 1, idx));
    setCurrentIndex(clamped);
    setShowAnswer(false);
    setStats(s => { saveFCSession({ currentIndex: clamped, stats: s, deckLen: deck.length }); return s; });
  };

  // Get mastery status for each question
  const getMastery = (q: UnifiedQuestion) => {
    const s = q.source === 'quickDrill' ? drillFsrs : hubFsrs;
    const fc = s[getFsrsId(q)];
    if (!fc) return 'new';
    if (fc.state === State.Review) return 'mastered';
    return 'learning';
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 max-w-4xl mx-auto relative">
      {/* Question List — desktop sidebar */}
      <div className="hidden lg:block w-64 shrink-0">
        <Card padding="none" className="sticky top-4 max-h-[80vh] overflow-hidden flex flex-col">
          <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Questions</span>
            <span className="text-xs text-gray-400">{currentIndex + 1}/{deck.length}</span>
          </div>
          <div className="overflow-y-auto flex-1">
            {deck.map((q, i) => {
              const mastery = getMastery(q);
              return (
                <button
                  key={q.uid}
                  ref={i === currentIndex ? activeItemRef : undefined}
                  onClick={() => goTo(i)}
                  className={`w-full text-left px-3 py-2 text-xs border-b border-gray-50 dark:border-gray-800 flex items-center gap-2 transition-colors ${
                    i === currentIndex
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <span className="w-5 shrink-0 text-right text-gray-400">{i + 1}</span>
                  {mastery === 'mastered' ? (
                    <CheckCircle size={12} className="shrink-0 text-green-500" />
                  ) : mastery === 'learning' ? (
                    <div className="w-3 h-3 rounded-full bg-yellow-400 shrink-0" />
                  ) : (
                    <div className="w-3 h-3 rounded-full border border-gray-300 dark:border-gray-600 shrink-0" />
                  )}
                  <span className="truncate">{q.question.slice(0, 50)}</span>
                </button>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Mobile collapsible question list */}
      <div className="lg:hidden w-full">
        <Card padding="none" className="mb-4 overflow-hidden">
          {/* Collapsed bar — always visible */}
          <button
            onClick={() => setListOpen(o => !o)}
            className="w-full flex items-center justify-between px-4 py-3 text-left"
          >
            <div className="flex items-center gap-2">
              <List size={16} className="text-gray-400" />
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Questions</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">{currentIndex + 1}/{deck.length}</span>
              <ChevronDown size={16} className={`text-gray-400 transition-transform ${listOpen ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {/* Expanded list */}
          {listOpen && (
            <div className="border-t border-gray-100 dark:border-gray-700/60 max-h-[40vh] overflow-y-auto">
              {deck.map((q, i) => {
                const mastery = getMastery(q);
                return (
                  <button
                    key={q.uid}
                    ref={i === currentIndex ? activeItemRef : undefined}
                    onClick={() => { goTo(i); setListOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm border-b border-gray-50 dark:border-gray-800 flex items-center gap-3 ${
                      i === currentIndex
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <span className="w-5 shrink-0 text-right text-gray-400 text-xs">{i + 1}</span>
                    {mastery === 'mastered' ? (
                      <CheckCircle size={13} className="shrink-0 text-green-500" />
                    ) : mastery === 'learning' ? (
                      <div className="w-3 h-3 rounded-full bg-yellow-400 shrink-0" />
                    ) : (
                      <div className="w-3 h-3 rounded-full border border-gray-300 dark:border-gray-600 shrink-0" />
                    )}
                    <span className="truncate text-xs">{q.question.slice(0, 55)}</span>
                  </button>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Main flashcard area */}
      <div className="flex-1 min-w-0">
        {/* Navigation + Progress */}
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => goTo(currentIndex - 1)}
            disabled={currentIndex === 0}
            className="!p-2 !min-h-0"
          >
            <ChevronLeft size={18} />
          </Button>

          <div className="flex-1">
            <div className="flex items-center justify-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-1">
              <button
                onClick={() => { setJumpOpen(true); setJumpValue(String(currentIndex + 1)); }}
                className="font-bold text-sm text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
              >
                {currentIndex + 1} / {deck.length}
              </button>
              <span className="text-amber-500">{dueCount} due</span>
              <span className="text-blue-500">{newCount} new</span>
            </div>
            <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 transition-all" style={{ width: `${((currentIndex + 1) / deck.length) * 100}%` }} />
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => goTo(currentIndex + 1)}
            disabled={currentIndex >= deck.length - 1}
            className="!p-2 !min-h-0"
          >
            <ChevronRight size={18} />
          </Button>
        </div>

        {/* Jump-to dialog */}
        {jumpOpen && (
          <div className="mb-4 flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl p-3">
            <span className="text-xs text-gray-500 dark:text-gray-400">Go to:</span>
            <input
              type="number"
              min={1}
              max={deck.length}
              value={jumpValue}
              onChange={e => setJumpValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') { goTo(Number(jumpValue) - 1); setJumpOpen(false); }
                if (e.key === 'Escape') setJumpOpen(false);
              }}
              autoFocus
              className="w-16 px-2 py-1 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-center text-sm"
            />
            <span className="text-xs text-gray-400">/ {deck.length}</span>
            <Button size="sm" variant="primary" onClick={() => { goTo(Number(jumpValue) - 1); setJumpOpen(false); }}>Go</Button>
            <Button size="sm" variant="ghost" onClick={() => setJumpOpen(false)}>Cancel</Button>
          </div>
        )}

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
              <Button variant="danger" size="md" className="flex-1" onClick={() => markCard(Rating.Again)}>Again</Button>
              <Button variant="secondary" size="md" className="flex-1 !bg-orange-50 dark:!bg-orange-900/20 !text-orange-600 dark:!text-orange-400 hover:!bg-orange-100" onClick={() => markCard(Rating.Hard)}>Hard</Button>
              <Button variant="secondary" size="md" className="flex-1 !bg-green-50 dark:!bg-green-900/20 !text-green-600 dark:!text-green-400 hover:!bg-green-100" onClick={() => markCard(Rating.Good)}>Good</Button>
              <Button variant="primary" size="md" className="flex-1" onClick={() => markCard(Rating.Easy)}>Easy</Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
