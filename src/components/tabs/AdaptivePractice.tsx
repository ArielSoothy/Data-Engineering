import { useState, useEffect, useCallback } from 'react';
import { Zap, Lock, CheckCircle, XCircle, Lightbulb, Brain } from 'lucide-react';
import {
  generateAdaptiveQuestion,
  generateFeedback,
  type AdaptiveQuestion,
} from '../../services/aiService';
import { generateTriviaAnswers, type TriviaAnswer } from '../../services/triviaService';
import type { Question } from '../../hooks/useQuestions';
import { Button, Badge, Card, ProgressBar, Spinner } from '../ui';

// ---------------------------------------------------------------------------
// Constants & types
// ---------------------------------------------------------------------------

const QUESTIONS_PER_LEVEL = 5;
const CORRECT_TO_ADVANCE = 4;
const STORAGE_KEY = 'adaptive_practice_state';

interface SubjectState {
  level: 1 | 2 | 3;
  levelCorrect: number;
  levelTotal: number;
}

interface AdaptiveState {
  sql: SubjectState;
  python: SubjectState;
}

const DEFAULT_SUBJECT_STATE: SubjectState = { level: 1, levelCorrect: 0, levelTotal: 0 };

const DEFAULT_STATE: AdaptiveState = {
  sql: { ...DEFAULT_SUBJECT_STATE },
  python: { ...DEFAULT_SUBJECT_STATE },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function loadState(): AdaptiveState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AdaptiveState;
  } catch {
    // ignore
  }
  return DEFAULT_STATE;
}

function saveState(state: AdaptiveState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/** Convert an AdaptiveQuestion to the Question shape expected by triviaService */
function adaptiveToQuestion(aq: AdaptiveQuestion): Question {
  return {
    id: 0,
    question: aq.question,
    difficulty: 'Medium',
    timeEstimate: 5,
    answer: aq.answer,
    pseudoCode: aq.pseudoCode,
  };
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const LEVEL_LABELS: Record<1 | 2 | 3, string> = { 1: 'Easy', 2: 'Medium', 3: 'Hard' };
const LEVEL_COLORS: Record<1 | 2 | 3, string> = {
  1: 'green',
  2: 'yellow',
  3: 'red',
};

// ---------------------------------------------------------------------------
// Level card component
// ---------------------------------------------------------------------------

interface LevelCardProps {
  level: 1 | 2 | 3;
  subjectState: SubjectState;
  unlocked: boolean;
  isCurrent: boolean;
}

const LevelCard = ({ level, subjectState, unlocked, isCurrent }: LevelCardProps) => {
  const isCompleted = subjectState.level > level || (subjectState.level === level && subjectState.levelCorrect >= CORRECT_TO_ADVANCE && subjectState.levelTotal >= QUESTIONS_PER_LEVEL);
  const progress = isCurrent
    ? Math.round((subjectState.levelTotal / QUESTIONS_PER_LEVEL) * 100)
    : 0;

  let borderClass = 'border-gray-200 dark:border-gray-700';
  if (isCompleted) borderClass = 'border-green-400 dark:border-green-500';
  else if (isCurrent) borderClass = 'border-blue-400 dark:border-blue-500';

  return (
    <div
      className={`flex-1 rounded-lg border-2 p-3 ${borderClass} bg-white dark:bg-gray-800 transition-all duration-200`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Level {level}
        </span>
        {!unlocked ? (
          <Lock size={14} className="text-gray-400" />
        ) : isCompleted ? (
          <CheckCircle size={14} className="text-green-500" />
        ) : isCurrent ? (
          <Zap size={14} className="text-blue-500" />
        ) : null}
      </div>
      <div className="font-bold text-gray-900 dark:text-gray-100 mb-1">
        {LEVEL_LABELS[level]}
      </div>
      {isCurrent && (
        <div className="mt-2">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>{subjectState.levelTotal}/{QUESTIONS_PER_LEVEL}</span>
            <span className="text-green-500">{subjectState.levelCorrect} correct</span>
          </div>
          <ProgressBar value={progress} size="sm" color={LEVEL_COLORS[level] as 'green' | 'yellow' | 'red'} />
        </div>
      )}
      {isCompleted && (
        <div className="text-xs text-green-500 font-medium mt-1">Mastered</div>
      )}
      {!unlocked && (
        <div className="text-xs text-gray-400 mt-1">Complete Level {(level - 1) as 1 | 2} first</div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const AdaptivePractice = () => {
  const [subject, setSubject] = useState<'sql' | 'python'>('sql');
  const [adaptiveState, setAdaptiveState] = useState<AdaptiveState>(loadState);

  const [currentQuestion, setCurrentQuestion] = useState<AdaptiveQuestion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [hintsShown, setHintsShown] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [answeredIds, setAnsweredIds] = useState<string[]>([]);

  const [triviaMode, setTriviaMode] = useState(false);
  const [triviaAnswers, setTriviaAnswers] = useState<TriviaAnswer[] | null>(null);
  const [selectedTriviaAnswer, setSelectedTriviaAnswer] = useState<string | null>(null);
  const [triviaResult, setTriviaResult] = useState<'correct' | 'incorrect' | null>(null);
  const [triviaLoading, setTriviaLoading] = useState(false);

  // After feedback is shown, awaiting user self-assessment
  const [awaitingMark, setAwaitingMark] = useState(false);

  const currentSubjectState = adaptiveState[subject];
  const currentLevel = currentSubjectState.level;

  // Persist on every state change
  useEffect(() => {
    saveState(adaptiveState);
  }, [adaptiveState]);

  // ---------------------------------------------------------------------------
  // Level unlock logic
  // ---------------------------------------------------------------------------

  const isLevelUnlocked = useCallback((subj: 'sql' | 'python', checkLevel: 1 | 2 | 3): boolean => {
    if (checkLevel === 1) return true;
    const state = adaptiveState[subj];
    if (checkLevel === 2) return state.level >= 2;
    return state.level === 3;
  }, [adaptiveState]);

  // ---------------------------------------------------------------------------
  // Load question
  // ---------------------------------------------------------------------------

  const loadQuestion = useCallback(async (subj: 'sql' | 'python', level: 1 | 2 | 3, answered: string[]) => {
    setIsLoading(true);
    setFeedback(null);
    setHintsShown(0);
    setShowAnswer(false);
    setTriviaMode(false);
    setTriviaAnswers(null);
    setSelectedTriviaAnswer(null);
    setTriviaResult(null);
    setUserAnswer('');
    setAwaitingMark(false);

    try {
      const q = await generateAdaptiveQuestion(subj, level, answered);
      setCurrentQuestion(q);
    } catch {
      setCurrentQuestion(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load first question on mount / subject change
  useEffect(() => {
    const state = adaptiveState[subject];
    loadQuestion(subject, state.level, answeredIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject]);

  // ---------------------------------------------------------------------------
  // Handle answer submission
  // ---------------------------------------------------------------------------

  const handleSubmitAnswer = async () => {
    if (!currentQuestion || !userAnswer.trim()) return;
    setIsSubmitting(true);
    try {
      const result = await generateFeedback(
        currentQuestion.question,
        userAnswer,
        currentQuestion.answer,
        currentQuestion.pseudoCode
      );
      setFeedback(result);
      setAwaitingMark(true);
    } catch {
      setFeedback('Could not get AI feedback. Please self-assess your answer below.');
      setAwaitingMark(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Mark result (self-assessment or trivia)
  // ---------------------------------------------------------------------------

  const handleMarkResult = useCallback((correct: boolean, fromTrivia = false) => {
    if (!currentQuestion) return;

    const qText = currentQuestion.question;
    const newAnsweredIds = [...answeredIds, qText];
    setAnsweredIds(newAnsweredIds);

    setAdaptiveState(prev => {
      const subjectState = prev[subject];
      const newTotal = subjectState.levelTotal + 1;
      const newCorrect = subjectState.levelCorrect + (correct ? 1 : 0);

      let newLevel = subjectState.level;
      let resetCorrect = newCorrect;
      let resetTotal = newTotal;

      // Check for level advancement
      if (newTotal >= QUESTIONS_PER_LEVEL && newCorrect >= CORRECT_TO_ADVANCE) {
        if (subjectState.level < 3) {
          newLevel = (subjectState.level + 1) as 1 | 2 | 3;
          resetCorrect = 0;
          resetTotal = 0;
        }
        // If already level 3, stay and keep counting (mastered)
      }

      const newState = {
        ...prev,
        [subject]: {
          level: newLevel,
          levelCorrect: resetCorrect,
          levelTotal: resetTotal,
        },
      };
      return newState;
    });

    if (!fromTrivia) {
      setAwaitingMark(false);
      // Load next question after a short delay so user sees their state updated
      setTimeout(() => {
        setAdaptiveState(prev => {
          const updatedLevel = prev[subject].level;
          loadQuestion(subject, updatedLevel, newAnsweredIds);
          return prev;
        });
      }, 300);
    }
  }, [currentQuestion, answeredIds, subject, loadQuestion]);

  // ---------------------------------------------------------------------------
  // Quiz Me (trivia MCQ)
  // ---------------------------------------------------------------------------

  const handleQuizMe = async () => {
    if (!currentQuestion) return;
    setTriviaLoading(true);
    try {
      const questionAsQ = adaptiveToQuestion(currentQuestion);
      const answers = await generateTriviaAnswers(questionAsQ, []);
      // Shuffle the answers for display
      setTriviaAnswers(shuffleArray(answers));
      setTriviaMode(true);
    } catch {
      // Fallback: build a basic MCQ
      const correct: TriviaAnswer = { id: 'correct', text: currentQuestion.answer, isCorrect: true };
      const wrong1: TriviaAnswer = { id: 'wrong_1', text: 'This is not the correct approach.', isCorrect: false };
      const wrong2: TriviaAnswer = { id: 'wrong_2', text: 'This answer contains a common misconception.', isCorrect: false };
      setTriviaAnswers(shuffleArray([correct, wrong1, wrong2]));
      setTriviaMode(true);
    } finally {
      setTriviaLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Trivia answer selection
  // ---------------------------------------------------------------------------

  const handleTriviaSelect = (answerId: string) => {
    if (selectedTriviaAnswer) return; // already answered
    setSelectedTriviaAnswer(answerId);
    const answer = triviaAnswers?.find(a => a.id === answerId);
    const correct = answer?.isCorrect ?? false;
    setTriviaResult(correct ? 'correct' : 'incorrect');
    handleMarkResult(correct, true);
  };

  // ---------------------------------------------------------------------------
  // Hint reveal
  // ---------------------------------------------------------------------------

  const handleRevealHint = () => {
    if (!currentQuestion) return;
    const maxHints = currentQuestion.hints.length;
    if (hintsShown < maxHints) {
      setHintsShown(h => h + 1);
    } else {
      setShowAnswer(true);
    }
  };

  // ---------------------------------------------------------------------------
  // Subject switch
  // ---------------------------------------------------------------------------

  const handleSubjectChange = (newSubject: 'sql' | 'python') => {
    if (newSubject === subject) return;
    setSubject(newSubject);
    setAnsweredIds([]);
    setCurrentQuestion(null);
    setFeedback(null);
    setAwaitingMark(false);
  };

  // ---------------------------------------------------------------------------
  // Next question (after trivia)
  // ---------------------------------------------------------------------------

  const handleNextQuestion = () => {
    const nextLevel = adaptiveState[subject].level;
    loadQuestion(subject, nextLevel, answeredIds);
    setTriviaMode(false);
    setTriviaAnswers(null);
    setSelectedTriviaAnswer(null);
    setTriviaResult(null);
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const levelProgressValue = currentSubjectState.levelTotal > 0
    ? Math.round((currentSubjectState.levelTotal / QUESTIONS_PER_LEVEL) * 100)
    : 0;

  return (
    <div className="container mx-auto px-4 py-8 pb-36 md:pb-8 max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Zap size={24} className="text-blue-500 dark:text-blue-400" />
          <h1 className="text-2xl font-bold">Adaptive Practice</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          AI-generated questions that adapt to your level. Advance by answering{' '}
          <span className="font-medium">{CORRECT_TO_ADVANCE}/{QUESTIONS_PER_LEVEL}</span> correctly per level.
        </p>
      </div>

      {/* Subject selector */}
      <div className="flex gap-2 mb-6">
        {(['sql', 'python'] as const).map(subj => (
          <button
            key={subj}
            onClick={() => handleSubjectChange(subj)}
            className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 border ${
              subject === subj
                ? 'bg-blue-500 text-white border-blue-500 dark:bg-blue-600 dark:border-blue-600'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500'
            }`}
          >
            {subj === 'sql' ? 'SQL' : 'Python'}
          </button>
        ))}
      </div>

      {/* Level cards */}
      <div className="flex gap-3 mb-6">
        {([1, 2, 3] as const).map(lvl => (
          <LevelCard
            key={lvl}
            level={lvl}
            subjectState={currentSubjectState}
            unlocked={isLevelUnlocked(subject, lvl)}
            isCurrent={currentSubjectState.level === lvl}
          />
        ))}
      </div>

      {/* Level progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-1.5">
          <span>
            Level {currentLevel} — {LEVEL_LABELS[currentLevel]}
          </span>
          <span>
            {currentSubjectState.levelTotal}/{QUESTIONS_PER_LEVEL} answered &middot;{' '}
            {currentSubjectState.levelCorrect} correct
          </span>
        </div>
        <ProgressBar
          value={levelProgressValue}
          color={LEVEL_COLORS[currentLevel] as 'green' | 'yellow' | 'red'}
        />
      </div>

      {/* Question area */}
      {isLoading ? (
        <Card padding="lg">
          <div className="flex flex-col items-center py-8 gap-3">
            <Spinner size="lg" />
            <p className="text-gray-500 dark:text-gray-400">Generating your next question…</p>
          </div>
        </Card>
      ) : !currentQuestion ? (
        <Card padding="lg">
          <div className="flex flex-col items-center py-8 gap-4">
            <Brain size={40} className="text-gray-400" />
            <p className="text-gray-500 dark:text-gray-400">No question loaded. Try generating one.</p>
            <Button
              variant="primary"
              onClick={() => loadQuestion(subject, currentLevel, answeredIds)}
              icon={<Zap size={16} />}
            >
              Generate Question
            </Button>
          </div>
        </Card>
      ) : triviaMode && triviaAnswers ? (
        /* Trivia MCQ overlay */
        <Card padding="md">
          <div className="flex items-center gap-2 mb-4">
            <Brain size={18} className="text-purple-500" />
            <span className="font-semibold text-gray-900 dark:text-gray-100">Quiz Mode</span>
            <Badge label={LEVEL_LABELS[currentLevel]} variant="difficulty" difficulty={LEVEL_LABELS[currentLevel] as 'Easy' | 'Medium' | 'Hard'} />
          </div>

          <p className="text-gray-800 dark:text-gray-200 mb-5 leading-relaxed">
            {currentQuestion.question}
          </p>

          <div className="space-y-2 mb-4">
            {triviaAnswers.map(answer => {
              let btnClass = 'w-full text-left p-3 rounded-lg border text-sm transition-all duration-200 ';
              if (!selectedTriviaAnswer) {
                btnClass += 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer text-gray-800 dark:text-gray-200';
              } else if (answer.isCorrect) {
                btnClass += 'border-green-400 dark:border-green-500 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300';
              } else if (answer.id === selectedTriviaAnswer) {
                btnClass += 'border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300';
              } else {
                btnClass += 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 opacity-60 text-gray-600 dark:text-gray-400';
              }

              return (
                <button
                  key={answer.id}
                  className={btnClass}
                  onClick={() => handleTriviaSelect(answer.id)}
                  disabled={!!selectedTriviaAnswer}
                >
                  <div className="flex items-start gap-2">
                    {selectedTriviaAnswer && answer.isCorrect && (
                      <CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" />
                    )}
                    {selectedTriviaAnswer && answer.id === selectedTriviaAnswer && !answer.isCorrect && (
                      <XCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                    )}
                    <span>{answer.text}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {triviaResult && (
            <div
              className={`rounded-lg p-3 mb-4 text-sm font-medium ${
                triviaResult === 'correct'
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
              }`}
            >
              {triviaResult === 'correct' ? 'Correct! Great job.' : 'Not quite — review the correct answer above.'}
            </div>
          )}

          {triviaResult && (
            <Button variant="primary" onClick={handleNextQuestion} icon={<Zap size={16} />}>
              Next Question
            </Button>
          )}
        </Card>
      ) : (
        /* Main question card */
        <Card padding="md">
          {/* Question header */}
          <div className="flex items-center gap-2 mb-4">
            <Badge
              label={LEVEL_LABELS[currentLevel]}
              variant="difficulty"
              difficulty={LEVEL_LABELS[currentLevel] as 'Easy' | 'Medium' | 'Hard'}
            />
            <span className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide font-medium">
              {subject === 'sql' ? 'SQL' : 'Python'}
            </span>
          </div>

          {/* Question text */}
          <p className="text-gray-900 dark:text-gray-100 font-medium mb-4 leading-relaxed text-base">
            {currentQuestion.question}
          </p>

          {/* Code hint (pseudoCode preview hidden until answer shown) */}
          {showAnswer && currentQuestion.pseudoCode && (
            <pre className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-xs overflow-x-auto mb-4 text-gray-800 dark:text-gray-300">
              {currentQuestion.pseudoCode}
            </pre>
          )}

          {/* Answer textarea */}
          {!feedback && (
            <>
              <textarea
                value={userAnswer}
                onChange={e => setUserAnswer(e.target.value)}
                placeholder="Type your answer here… Explain your approach and include any relevant code."
                rows={5}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 resize-none mb-4"
              />

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="primary"
                  onClick={handleSubmitAnswer}
                  loading={isSubmitting}
                  disabled={!userAnswer.trim() || isSubmitting}
                  icon={<Brain size={16} />}
                >
                  Submit Answer
                </Button>

                <Button
                  variant="secondary"
                  onClick={handleQuizMe}
                  loading={triviaLoading}
                  disabled={triviaLoading}
                  icon={<Zap size={16} />}
                >
                  Quiz Me
                </Button>

                <Button
                  variant="ghost"
                  onClick={handleRevealHint}
                  disabled={showAnswer}
                  icon={<Lightbulb size={16} />}
                >
                  {hintsShown === 0
                    ? 'Need a Hint?'
                    : hintsShown < (currentQuestion.hints.length)
                    ? `Hint ${hintsShown + 1}`
                    : 'Show Answer'}
                </Button>
              </div>
            </>
          )}

          {/* Feedback */}
          {feedback && (
            <div className="mt-4 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Brain size={16} className="text-blue-500" />
                <span className="font-semibold text-blue-700 dark:text-blue-300 text-sm">AI Feedback</span>
              </div>
              <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                {feedback}
              </p>
            </div>
          )}

          {/* Self-assessment buttons */}
          {awaitingMark && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                How did you do? Your self-assessment determines your level progress.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={() => handleMarkResult(true)}
                  icon={<CheckCircle size={16} />}
                  className="border border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                >
                  Mark as Correct
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => handleMarkResult(false)}
                  icon={<XCircle size={16} />}
                  className="border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  Mark as Incorrect
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Hints section */}
      {!triviaMode && currentQuestion && hintsShown > 0 && (
        <div className="mt-4 space-y-2">
          {currentQuestion.hints.slice(0, hintsShown).map((hint, idx) => (
            <div
              key={idx}
              className="flex gap-3 rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 p-3"
            >
              <Lightbulb size={16} className="text-yellow-500 mt-0.5 shrink-0" />
              <div>
                <span className="text-xs font-semibold text-yellow-700 dark:text-yellow-400 uppercase tracking-wide">
                  Hint {idx + 1}
                </span>
                <p className="text-sm text-gray-800 dark:text-gray-200 mt-0.5">{hint}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full answer reveal */}
      {!triviaMode && showAnswer && currentQuestion && (
        <div className="mt-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={16} className="text-green-500" />
            <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Full Answer</span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
            {currentQuestion.answer}
          </p>
          {currentQuestion.pseudoCode && (
            <pre className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-xs overflow-x-auto text-gray-800 dark:text-gray-300">
              {currentQuestion.pseudoCode}
            </pre>
          )}
        </div>
      )}

      {/* Skip question link */}
      {!triviaMode && !isLoading && currentQuestion && !awaitingMark && (
        <div className="mt-4 text-center">
          <button
            onClick={() => loadQuestion(subject, currentLevel, answeredIds)}
            className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 underline transition-colors"
          >
            Skip — load a different question
          </button>
        </div>
      )}
    </div>
  );
};

export default AdaptivePractice;
