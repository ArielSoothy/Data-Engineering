import { useState, useCallback } from 'react';
import { createEmptyCard, fsrs, Rating, State, type Card as FSRSCard, type Grade } from 'ts-fsrs';
import { pushProgressDebounced } from '../services/progressSync';
import type { UnifiedQuestion } from '../types/studyHub';

/* ── Types ─────────────────────────────────────────────────────── */

type FSRSStateMap = Record<string, FSRSCard>;

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

/* ── FSRS scheduler ────────────────────────────────────────────── */

const FSRS_STORAGE_KEY = 'quick_drill_fsrs';
const scheduler = fsrs({ request_retention: 0.9, enable_fuzz: true });

/* ── Persistence ───────────────────────────────────────────────── */

function loadFsrsState(): FSRSStateMap {
  try {
    const raw = localStorage.getItem(FSRS_STORAGE_KEY);
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

function saveFsrsState(state: FSRSStateMap) {
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
    localStorage.setItem(FSRS_STORAGE_KEY, JSON.stringify(serialized));
    pushProgressDebounced();
  } catch { /* storage full */ }
}

/* ── Deck building ─────────────────────────────────────────────── */

export function buildSpacedDeck(questions: UnifiedQuestion[], fsrsCards: FSRSStateMap) {
  const now = new Date();
  const due: UnifiedQuestion[] = [];
  const newCards: UnifiedQuestion[] = [];
  const upcoming: UnifiedQuestion[] = [];

  for (const q of questions) {
    const key = q.uid;
    const fc = fsrsCards[key];
    if (!fc) {
      newCards.push(q);
    } else if (fc.due <= now) {
      due.push(q);
    } else {
      upcoming.push(q);
    }
  }

  due.sort((a, b) => fsrsCards[a.uid]!.due.getTime() - fsrsCards[b.uid]!.due.getTime());
  upcoming.sort((a, b) => fsrsCards[a.uid]!.due.getTime() - fsrsCards[b.uid]!.due.getTime());

  return {
    deck: [...due, ...newCards, ...upcoming],
    stats: { due: due.length, new: newCards.length, upcoming: upcoming.length },
  };
}

/* ── Hook ──────────────────────────────────────────────────────── */

export function useSpacedRepetition() {
  const [fsrsCards, setFsrsCards] = useState<FSRSStateMap>(loadFsrsState);

  const gradeCard = useCallback((questionId: string, grade: Grade) => {
    setFsrsCards(prev => {
      const card = prev[questionId] || createEmptyCard();
      const now = new Date();
      const result = scheduler.repeat(card, now);
      const next = { ...prev, [questionId]: result[grade].card };
      saveFsrsState(next);
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    localStorage.removeItem(FSRS_STORAGE_KEY);
    setFsrsCards({});
    pushProgressDebounced();
  }, []);

  return { fsrsCards, gradeCard, resetAll, Rating };
}
