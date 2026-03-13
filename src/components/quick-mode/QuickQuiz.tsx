import { useState, useCallback } from 'react';
import { CheckCircle, XCircle, SkipForward, RotateCcw, Play } from 'lucide-react';
import { Button, Card, Badge, ProgressBar } from '../ui';
import { generateTriviaAnswers, type TriviaAnswer } from '../../services/triviaService';
import { pushProgressDebounced } from '../../services/progressSync';
import { useAppContext } from '../../context/AppContext';
import type { Question } from '../../hooks/useQuestions';
import type { UnifiedQuestion } from '../../types/studyHub';

// --- Quiz progress persistence ---
const QUIZ_PROGRESS_KEY = 'quick_drill_progress';

interface CardProgress { seen: number; correct: number; wrong: number; lastReviewed?: string }
type ProgressMap = Record<string, CardProgress>;

function loadProgress(): ProgressMap {
  try {
    const raw = localStorage.getItem(QUIZ_PROGRESS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveQuizProgress(uid: string, correct: boolean) {
  try {
    const progress = loadProgress();
    const prev = progress[uid] || { seen: 0, correct: 0, wrong: 0 };
    progress[uid] = {
      seen: prev.seen + 1,
      correct: prev.correct + (correct ? 1 : 0),
      wrong: prev.wrong + (correct ? 0 : 1),
      lastReviewed: new Date().toISOString(),
    };
    localStorage.setItem(QUIZ_PROGRESS_KEY, JSON.stringify(progress));
    pushProgressDebounced();
  } catch { /* ignore */ }
}

interface QuizItem { q: UnifiedQuestion; answers: TriviaAnswer[] }

function shuffleArray<T>(arr: T[]): T[] {
  const s = [...arr];
  for (let i = s.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [s[i], s[j]] = [s[j], s[i]];
  }
  return s;
}

function toTriviaQuestion(q: UnifiedQuestion): Question {
  return { id: q.sourceId, question: q.question, answer: q.answer, difficulty: q.difficulty, timeEstimate: q.timeEstimate, pseudoCode: q.pseudoCode };
}

interface Props { questions: UnifiedQuestion[]; allQuestions: UnifiedQuestion[] }

export default function QuickQuiz({ questions, allQuestions }: Props) {
  const { updateProgress } = useAppContext();
  const [quizItems, setQuizItems] = useState<QuizItem[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [started, setStarted] = useState(false);

  const startQuiz = useCallback(async () => {
    if (questions.length === 0) return;
    setIsLoading(true);
    try {
      const selected = shuffleArray(questions).slice(0, 20);
      const allAsTrivia = allQuestions.map(toTriviaQuestion);
      const items = await Promise.all(
        selected.map(async q => {
          const answers = await generateTriviaAnswers(toTriviaQuestion(q), allAsTrivia);
          return { q, answers: shuffleArray(answers) };
        }),
      );
      setQuizItems(items);
      setIndex(0);
      setScore(0);
      setStreak(0);
      setSelected(null);
      setShowResult(false);
      setStarted(true);
    } catch (e) {
      console.error('Quiz generation failed:', e);
    } finally {
      setIsLoading(false);
    }
  }, [questions, allQuestions]);

  const handleAnswer = (answerId: string) => {
    if (showResult) return;
    setSelected(answerId);
    setShowResult(true);
    const q = quizItems[index].q;
    const correct = quizItems[index].answers.find(a => a.id === answerId)?.isCorrect ?? false;
    if (correct) {
      setScore(s => s + 1);
      setStreak(s => s + 1);
    } else {
      setStreak(0);
    }
    // Persist progress
    saveQuizProgress(q.uid, correct);
    if (correct) {
      updateProgress(q.progressKey, q.progressId, true);
    }
  };

  const nextQuestion = () => {
    setSelected(null);
    setShowResult(false);
    setIndex(i => i + 1);
  };

  const skipQuestion = () => {
    setStreak(0);
    nextQuestion();
  };

  // Not started
  if (!started) {
    return (
      <div className="max-w-lg mx-auto text-center pt-4">
        <Card padding="lg">
          <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Quiz Mode</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
            {questions.length} questions available. We'll pick up to 20 random questions.
          </p>
          <Button variant="primary" size="lg" onClick={startQuiz} loading={isLoading} icon={<Play size={16} />}>
            Start Quiz
          </Button>
        </Card>
      </div>
    );
  }

  // Done
  if (index >= quizItems.length) {
    const pct = quizItems.length > 0 ? Math.round((score / quizItems.length) * 100) : 0;
    return (
      <div className="max-w-lg mx-auto text-center pt-4">
        <Card padding="lg">
          <p className="text-xs font-bold tracking-widest text-gray-500 dark:text-gray-400 uppercase mb-4">QUIZ COMPLETE</p>
          <p className={`text-6xl font-extrabold ${pct >= 80 ? 'text-green-500' : pct >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>{pct}%</p>
          <p className="text-gray-500 mt-2">{score} / {quizItems.length} correct</p>
          <div className="mt-6 flex gap-3 justify-center">
            <Button variant="primary" onClick={startQuiz} loading={isLoading} icon={<RotateCcw size={16} />}>Try Again</Button>
          </div>
        </Card>
      </div>
    );
  }

  const item = quizItems[index];
  const progress = ((index + 1) / quizItems.length) * 100;

  return (
    <div className="max-w-lg mx-auto">
      {/* Progress */}
      <div className="flex items-center gap-3 mb-4 text-xs text-gray-500 dark:text-gray-400">
        <span>{index + 1}/{quizItems.length}</span>
        <div className="flex-1"><ProgressBar value={progress} /></div>
        <span className="text-green-500 font-bold">{score} pts</span>
        {streak >= 2 && <span className="text-amber-500 font-bold">{streak}x</span>}
      </div>

      <Card padding="lg">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant={item.q.difficulty === 'Easy' ? 'success' : item.q.difficulty === 'Medium' ? 'warning' : 'danger'}>
            {item.q.difficulty}
          </Badge>
          {item.q.topic && <Badge variant="info">{item.q.topic}</Badge>}
        </div>

        <p className="text-gray-900 dark:text-gray-100 font-medium mb-4 whitespace-pre-wrap">{item.q.question}</p>

        <div className="space-y-2">
          {item.answers.map(a => {
            let cls = 'border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500';
            if (showResult) {
              if (a.isCorrect) cls = 'border-2 border-green-500 bg-green-50 dark:bg-green-900/20';
              else if (a.id === selected && !a.isCorrect) cls = 'border-2 border-red-500 bg-red-50 dark:bg-red-900/20';
              else cls = 'border border-gray-200 dark:border-gray-700 opacity-50';
            } else if (a.id === selected) {
              cls = 'border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20';
            }
            return (
              <button
                key={a.id}
                onClick={() => handleAnswer(a.id)}
                disabled={showResult}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all text-sm ${cls}`}
              >
                <div className="flex items-center gap-2">
                  {showResult && a.isCorrect && <CheckCircle size={16} className="text-green-500 shrink-0" />}
                  {showResult && a.id === selected && !a.isCorrect && <XCircle size={16} className="text-red-500 shrink-0" />}
                  <span className="text-gray-800 dark:text-gray-200">{a.text}</span>
                </div>
              </button>
            );
          })}
        </div>

        {showResult && (
          <div className="flex gap-3 mt-4">
            <Button variant="primary" size="md" className="flex-1" onClick={nextQuestion}>
              {index + 1 < quizItems.length ? 'Next Question' : 'See Results'}
            </Button>
          </div>
        )}

        {!showResult && (
          <div className="flex justify-end mt-4">
            <Button variant="ghost" size="sm" onClick={skipQuestion} icon={<SkipForward size={14} />}>Skip</Button>
          </div>
        )}
      </Card>
    </div>
  );
}
