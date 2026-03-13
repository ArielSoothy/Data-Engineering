import { useState, useCallback, useMemo } from 'react';
import { SkipForward, RotateCcw, CheckCircle, XCircle, Play } from 'lucide-react';
import { Card, Badge, Button } from '../ui';
import { pushProgressDebounced } from '../../services/progressSync';
import type { UnifiedQuestion } from '../../types/studyHub';

// --- Puzzle logic (extracted from QuickDrill.tsx) ---

function extractPuzzleLines(answer: string): string[] {
  return answer
    .split('\n')
    .map(l => l.trimEnd())
    .filter(l => l.trim().length > 0 && !l.trim().startsWith('#') && !l.trim().startsWith('--'));
}

function isPuzzleCard(q: UnifiedQuestion): boolean {
  const lines = extractPuzzleLines(q.answer);
  return lines.length >= 4;
}

function shuffleArray<T>(arr: T[]): T[] {
  const s = [...arr];
  for (let i = s.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [s[i], s[j]] = [s[j], s[i]];
  }
  return s;
}

// --- Progress storage for puzzle (shared with quick_drill_progress) ---
const STORAGE_KEY = 'quick_drill_progress';

interface CardProgress { seen: number; correct: number; wrong: number; lastReviewed?: string }
type ProgressMap = Record<string, CardProgress>;

function loadProgress(): ProgressMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveProgress(p: ProgressMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    pushProgressDebounced();
  } catch { /* ignore */ }
}

// --- Component ---

interface Props { questions: UnifiedQuestion[] }

export default function QuickPuzzle({ questions }: Props) {
  const puzzleQuestions = useMemo(() => questions.filter(isPuzzleCard), [questions]);

  const [started, setStarted] = useState(false);
  const [deck, setDeck] = useState<UnifiedQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [original, setOriginal] = useState<string[]>([]);
  const [available, setAvailable] = useState<number[]>([]);
  const [placed, setPlaced] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const [stats, setStats] = useState({ correct: 0, wrong: 0, seen: 0 });

  const startSession = useCallback(() => {
    const shuffled = shuffleArray(puzzleQuestions).slice(0, 15);
    setDeck(shuffled);
    setIndex(0);
    setStats({ correct: 0, wrong: 0, seen: 0 });
    setStarted(true);
    if (shuffled.length > 0) {
      const lines = extractPuzzleLines(shuffled[0].answer);
      setOriginal(lines);
      setAvailable(shuffleArray(lines.map((_, i) => i)));
      setPlaced([]);
      setChecked(false);
    }
  }, [puzzleQuestions]);

  const setupCard = useCallback((q: UnifiedQuestion) => {
    const lines = extractPuzzleLines(q.answer);
    setOriginal(lines);
    setAvailable(shuffleArray(lines.map((_, i) => i)));
    setPlaced([]);
    setChecked(false);
  }, []);

  const placeLine = (idx: number) => {
    if (checked) return;
    setAvailable(prev => prev.filter(i => i !== idx));
    setPlaced(prev => [...prev, idx]);
  };

  const removeLine = (position: number) => {
    if (checked) return;
    setPlaced(prev => {
      const idx = prev[position];
      setAvailable(a => [...a, idx]);
      return [...prev.slice(0, position), ...prev.slice(position + 1)];
    });
  };

  const checkAnswer = () => {
    if (!deck[index]) return;
    let correctCount = 0;
    for (let i = 0; i < original.length; i++) {
      if (placed[i] === i) correctCount++;
    }
    const pct = original.length > 0 ? Math.round((correctCount / original.length) * 100) : 0;
    const isCorrect = pct >= 80;
    setChecked(true);

    // Save progress
    const progress = loadProgress();
    const key = deck[index].uid;
    const prev = progress[key] || { seen: 0, correct: 0, wrong: 0 };
    progress[key] = {
      seen: prev.seen + 1,
      correct: prev.correct + (isCorrect ? 1 : 0),
      wrong: prev.wrong + (isCorrect ? 0 : 1),
      lastReviewed: new Date().toISOString(),
    };
    saveProgress(progress);

    setStats(s => ({
      seen: s.seen + 1,
      correct: s.correct + (isCorrect ? 1 : 0),
      wrong: s.wrong + (isCorrect ? 0 : 1),
    }));
  };

  const nextCard = () => {
    const next = index + 1;
    if (next < deck.length) {
      setIndex(next);
      setupCard(deck[next]);
    } else {
      setStarted(false);
    }
  };

  const skipCard = () => {
    setStats(s => ({ ...s, seen: s.seen + 1 }));
    nextCard();
  };

  // Not started / done
  if (!started) {
    if (stats.seen > 0) {
      const pct = stats.seen > 0 ? Math.round((stats.correct / stats.seen) * 100) : 0;
      return (
        <div className="max-w-lg mx-auto text-center pt-4">
          <Card padding="lg">
            <p className="text-xs font-bold tracking-widest text-gray-500 dark:text-gray-400 uppercase mb-4">PUZZLE COMPLETE</p>
            <p className={`text-6xl font-extrabold ${pct >= 80 ? 'text-green-500' : pct >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>{pct}%</p>
            <p className="text-gray-500 mt-2">{stats.correct} / {stats.seen} correct</p>
            <div className="mt-6">
              <Button variant="primary" size="lg" onClick={startSession} icon={<RotateCcw size={16} />}>Play Again</Button>
            </div>
          </Card>
        </div>
      );
    }

    return (
      <div className="max-w-lg mx-auto text-center pt-4">
        <Card padding="lg">
          <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Code Puzzle</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-1 text-sm">
            Drag code lines into the correct order to solve each question.
          </p>
          <p className="text-gray-400 dark:text-gray-500 mb-4 text-xs">
            {puzzleQuestions.length} puzzle-compatible questions (need 4+ code lines)
          </p>
          {puzzleQuestions.length === 0 ? (
            <p className="text-amber-500 text-sm">No questions with enough code lines for puzzles in this selection.</p>
          ) : (
            <Button variant="primary" size="lg" onClick={startSession} icon={<Play size={16} />}>Start Puzzles</Button>
          )}
        </Card>
      </div>
    );
  }

  const q = deck[index];
  if (!q) return null;

  const correctCount = placed.reduce((acc, idx, i) => acc + (idx === i ? 1 : 0), 0);
  const totalLines = original.length;

  return (
    <div className="max-w-lg mx-auto">
      {/* Progress */}
      <div className="flex items-center gap-3 mb-4 text-xs text-gray-500 dark:text-gray-400">
        <span>{index + 1}/{deck.length}</span>
        <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 transition-all" style={{ width: `${((index + 1) / deck.length) * 100}%` }} />
        </div>
        <span className="text-green-500 font-bold">{stats.correct}</span>
        <span className="text-red-500">{stats.wrong}</span>
      </div>

      <Card padding="lg">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant={q.difficulty === 'Easy' ? 'success' : q.difficulty === 'Medium' ? 'warning' : 'danger'}>{q.difficulty}</Badge>
          {q.topic && <Badge variant="info">{q.topic}</Badge>}
        </div>

        <p className="text-gray-900 dark:text-gray-100 font-medium mb-4 text-sm whitespace-pre-wrap">{q.question}</p>

        {/* Placed lines (answer area) */}
        <div className="min-h-[120px] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-3 mb-4 space-y-1.5">
          {placed.length === 0 && (
            <p className="text-gray-400 dark:text-gray-500 text-xs text-center py-4">Tap lines below to place them here</p>
          )}
          {placed.map((lineIdx, pos) => {
            const isCorrect = checked && lineIdx === pos;
            const isWrong = checked && lineIdx !== pos;
            return (
              <button
                key={`placed-${pos}`}
                onClick={() => removeLine(pos)}
                disabled={checked}
                className={`w-full text-left px-3 py-2 rounded-lg font-mono text-xs transition-colors ${
                  isCorrect ? 'bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-400'
                  : isWrong ? 'bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400'
                  : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-gray-800 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                }`}
              >
                <span className="flex items-center gap-2">
                  {checked && isCorrect && <CheckCircle size={14} className="text-green-500 shrink-0" />}
                  {checked && isWrong && <XCircle size={14} className="text-red-500 shrink-0" />}
                  {original[lineIdx]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Available lines (scrambled) */}
        {available.length > 0 && !checked && (
          <div className="space-y-1.5 mb-4">
            {available.map(lineIdx => (
              <button
                key={`avail-${lineIdx}`}
                onClick={() => placeLine(lineIdx)}
                className="w-full text-left px-3 py-2 rounded-lg font-mono text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
              >
                {original[lineIdx]}
              </button>
            ))}
          </div>
        )}

        {/* Check result */}
        {checked && (
          <div className={`text-center py-2 rounded-lg text-sm font-bold mb-4 ${
            correctCount >= totalLines * 0.8
              ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
              : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
          }`}>
            {correctCount}/{totalLines} lines correct ({Math.round((correctCount / totalLines) * 100)}%)
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {!checked && placed.length === totalLines && (
            <Button variant="primary" className="flex-1" onClick={checkAnswer}>Check Order</Button>
          )}
          {checked && (
            <Button variant="primary" className="flex-1" onClick={nextCard}>
              {index + 1 < deck.length ? 'Next Puzzle' : 'See Results'}
            </Button>
          )}
          {!checked && (
            <Button variant="ghost" onClick={skipCard} icon={<SkipForward size={14} />}>Skip</Button>
          )}
        </div>
      </Card>
    </div>
  );
}
