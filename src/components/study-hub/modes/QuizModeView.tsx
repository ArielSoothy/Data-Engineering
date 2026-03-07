import { useState, useCallback } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { Button, Card, Badge, ProgressBar, Spinner } from '../../ui';
import { generateTriviaAnswers, type TriviaAnswer } from '../../../services/triviaService';
import type { Question } from '../../../hooks/useQuestions';
import type { UnifiedQuestion } from '../../../types/studyHub';

interface QuizQuestion {
  q: UnifiedQuestion;
  answers: TriviaAnswer[];
}

interface Props {
  questions: UnifiedQuestion[];
}

function shuffleArray<T>(arr: T[]): T[] {
  const s = [...arr];
  for (let i = s.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [s[i], s[j]] = [s[j], s[i]];
  }
  return s;
}

// Convert UnifiedQuestion to the Question type that triviaService expects
function toTriviaQuestion(q: UnifiedQuestion): Question {
  return {
    id: q.sourceId,
    question: q.question,
    answer: q.answer,
    difficulty: q.difficulty,
    timeEstimate: q.timeEstimate,
    pseudoCode: q.pseudoCode,
  };
}

export default function QuizModeView({ questions }: Props) {
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [started, setStarted] = useState(false);

  const startQuiz = useCallback(async () => {
    if (questions.length === 0) return;
    setIsLoading(true);
    try {
      const selected = shuffleArray(questions).slice(0, 20);
      const allAsTrivia = questions.map(toTriviaQuestion);
      const withAnswers = await Promise.all(
        selected.map(async q => {
          const answers = await generateTriviaAnswers(toTriviaQuestion(q), allAsTrivia);
          return { q, answers: shuffleArray(answers) };
        }),
      );
      setQuizQuestions(withAnswers);
      setCurrentIndex(0);
      setScore(0);
      setStreak(0);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setStarted(true);
    } catch (err) {
      console.error('Failed to generate quiz:', err);
    } finally {
      setIsLoading(false);
    }
  }, [questions]);

  const handleAnswer = (answerId: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(answerId);
    const current = quizQuestions[currentIndex];
    const chosen = current.answers.find(a => a.id === answerId);
    if (chosen?.isCorrect) {
      setScore(s => s + 1);
      setStreak(s => s + 1);
    } else {
      setStreak(0);
    }
    setTimeout(() => setShowExplanation(true), 400);
  };

  const handleNext = () => {
    if (currentIndex < quizQuestions.length - 1) {
      setCurrentIndex(i => i + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  // --- Not started ---
  if (!started) {
    return (
      <div className="max-w-lg mx-auto text-center pt-8">
        <Card padding="lg">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Quiz Mode</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Multiple choice from {questions.length} questions. Up to 20 per round.
          </p>
          <Button variant="primary" size="lg" onClick={startQuiz} loading={isLoading}>
            {isLoading ? 'Generating...' : 'Start Quiz'}
          </Button>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  // --- Complete ---
  const isComplete = currentIndex === quizQuestions.length - 1 && showExplanation;
  if (isComplete) {
    const total = quizQuestions.length;
    const pct = Math.round((score / total) * 100);
    return (
      <div className="max-w-lg mx-auto text-center pt-8">
        <Card padding="lg">
          <p className="text-xs font-bold tracking-widest text-gray-500 dark:text-gray-400 uppercase mb-4">
            QUIZ COMPLETE
          </p>
          <p className={`text-6xl font-extrabold ${pct >= 80 ? 'text-green-500' : pct >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
            {pct}%
          </p>
          <p className="text-sm text-gray-500 mt-2">{score}/{total} correct</p>
          <div className="mt-6 flex gap-3 justify-center">
            <Button variant="primary" onClick={startQuiz}>Try Again</Button>
            <Button variant="secondary" onClick={() => setStarted(false)}>Back</Button>
          </div>
        </Card>
      </div>
    );
  }

  // --- Quiz in progress ---
  const current = quizQuestions[currentIndex];
  const pct = ((currentIndex + 1) / quizQuestions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between mb-2 text-xs text-gray-500 dark:text-gray-400">
        <span>Question {currentIndex + 1} / {quizQuestions.length}</span>
        <div className="flex items-center gap-3">
          {streak > 2 && <span className="text-orange-500 font-medium">🔥 {streak}</span>}
          <span>Score: {score} ({currentIndex > 0 ? Math.round((score / currentIndex) * 100) : 0}%)</span>
        </div>
      </div>
      <ProgressBar value={pct} color="blue" size="sm" className="mb-4" />

      {/* Question */}
      <Card padding="lg" className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Badge label={current.q.difficulty} variant="difficulty" difficulty={current.q.difficulty} size="sm" />
          <Badge label={current.q.subject.toUpperCase()} color={current.q.subject === 'python' ? 'blue' : 'green'} size="sm" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {current.q.question}
        </h3>
      </Card>

      {/* Answers */}
      <div className="space-y-2">
        {current.answers.map(answer => {
          const isSelected = selectedAnswer === answer.id;
          const showResult = selectedAnswer !== null;
          let cls = 'w-full p-4 text-left rounded-lg border-2 transition-colors text-sm ';
          if (showResult) {
            if (isSelected && answer.isCorrect) {
              cls += 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300';
            } else if (isSelected && !answer.isCorrect) {
              cls += 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300';
            } else if (answer.isCorrect) {
              cls += 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300';
            } else {
              cls += 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500';
            }
          } else {
            cls += 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 text-gray-900 dark:text-white cursor-pointer';
          }

          return (
            <button key={answer.id} onClick={() => handleAnswer(answer.id)} disabled={!!selectedAnswer} className={cls}>
              <div className="flex items-center justify-between">
                <span>{answer.text}</span>
                {showResult && answer.isCorrect && <CheckCircle size={18} className="text-green-500 shrink-0 ml-2" />}
                {showResult && isSelected && !answer.isCorrect && <XCircle size={18} className="text-red-500 shrink-0 ml-2" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Explanation + Next */}
      {showExplanation && (
        <div className="mt-4 space-y-3">
          <Card padding="md" className="!bg-blue-50 dark:!bg-blue-950/30 border border-blue-200 dark:border-blue-800">
            <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-1">Explanation</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{current.q.answer}</p>
          </Card>
          {currentIndex < quizQuestions.length - 1 && (
            <Button variant="primary" size="lg" className="w-full" onClick={handleNext}>
              Next Question
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
