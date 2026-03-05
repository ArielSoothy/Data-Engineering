import { useState, useEffect, useCallback } from 'react';
import { Zap, CheckCircle, XCircle, Lightbulb, Brain, ChevronRight, SkipForward } from 'lucide-react';
import {
  generateAdaptiveQuestion,
  generateFeedback,
  getActiveProvider,
  type AdaptiveQuestion,
} from '../../services/aiService';
import { generateTriviaAnswers, type TriviaAnswer } from '../../services/triviaService';
import type { Question } from '../../hooks/useQuestions';
import { Button, Badge, Card, Spinner } from '../ui';

// ---------------------------------------------------------------------------
// Constants & types
// ---------------------------------------------------------------------------

const QUESTIONS_PER_LEVEL = 5;
const CORRECT_TO_ADVANCE = 4;
const STORAGE_KEY = 'adaptive_practice_state';
const STATS_KEY = 'adaptive_lifetime_stats';
const ANSWERED_KEY = 'adaptive_answered_questions';
const ANSWERED_BUFFER = 30; // rolling window per subject to avoid repeats

interface SubjectState {
  level: 1 | 2 | 3;
  levelCorrect: number;
  levelTotal: number;
}

interface AdaptiveState {
  sql: SubjectState;
  python: SubjectState;
}

interface SubjectStats {
  total: number;
  correct: number;
  byLevel: Record<1 | 2 | 3, { total: number; correct: number }>;
}

interface LifetimeStats {
  sql: SubjectStats;
  python: SubjectStats;
}

interface AnsweredQuestions {
  sql: string[];
  python: string[];
}

const DEFAULT_SUBJECT_STATE: SubjectState = { level: 1, levelCorrect: 0, levelTotal: 0 };
const DEFAULT_STATE: AdaptiveState = {
  sql: { ...DEFAULT_SUBJECT_STATE },
  python: { ...DEFAULT_SUBJECT_STATE },
};

const DEFAULT_SUBJECT_STATS: SubjectStats = {
  total: 0,
  correct: 0,
  byLevel: { 1: { total: 0, correct: 0 }, 2: { total: 0, correct: 0 }, 3: { total: 0, correct: 0 } },
};

const DEFAULT_STATS: LifetimeStats = {
  sql: { ...DEFAULT_SUBJECT_STATS, byLevel: { 1: { total: 0, correct: 0 }, 2: { total: 0, correct: 0 }, 3: { total: 0, correct: 0 } } },
  python: { ...DEFAULT_SUBJECT_STATS, byLevel: { 1: { total: 0, correct: 0 }, 2: { total: 0, correct: 0 }, 3: { total: 0, correct: 0 } } },
};

const LEVEL_LABELS: Record<1 | 2 | 3, 'Easy' | 'Medium' | 'Hard'> = {
  1: 'Easy',
  2: 'Medium',
  3: 'Hard',
};

const PROVIDER_LABELS: Record<string, string> = {
  groq: 'Groq',
  claude: 'Claude API',
  'claude-cli': 'Claude (local)',
  gemini: 'Gemini',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function loadState(): AdaptiveState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AdaptiveState;
  } catch { /* ignore */ }
  return DEFAULT_STATE;
}

function saveState(state: AdaptiveState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadStats(): LifetimeStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as LifetimeStats;
      // Ensure byLevel exists (backwards compat)
      for (const subj of ['sql', 'python'] as const) {
        if (!parsed[subj].byLevel) {
          parsed[subj].byLevel = { 1: { total: 0, correct: 0 }, 2: { total: 0, correct: 0 }, 3: { total: 0, correct: 0 } };
        }
      }
      return parsed;
    }
  } catch { /* ignore */ }
  return DEFAULT_STATS;
}

function saveStats(stats: LifetimeStats): void {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

function loadAnswered(): AnsweredQuestions {
  try {
    const raw = localStorage.getItem(ANSWERED_KEY);
    if (raw) return JSON.parse(raw) as AnsweredQuestions;
  } catch { /* ignore */ }
  return { sql: [], python: [] };
}

function saveAnswered(answered: AnsweredQuestions): void {
  localStorage.setItem(ANSWERED_KEY, JSON.stringify(answered));
}

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
  const [lifetimeStats, setLifetimeStats] = useState<LifetimeStats>(loadStats);
  const [answeredQuestions, setAnsweredQuestions] = useState<AnsweredQuestions>(loadAnswered);

  // Derive the per-subject answered list for dedup hints
  const answeredIds = answeredQuestions[subject];

  const [triviaMode, setTriviaMode] = useState(false);
  const [triviaAnswers, setTriviaAnswers] = useState<TriviaAnswer[] | null>(null);
  const [selectedTriviaAnswer, setSelectedTriviaAnswer] = useState<string | null>(null);
  const [triviaResult, setTriviaResult] = useState<'correct' | 'incorrect' | null>(null);
  const [triviaLoading, setTriviaLoading] = useState(false);
  const [awaitingMark, setAwaitingMark] = useState(false);

  const [showLevelDetail, setShowLevelDetail] = useState(false);

  const currentSubjectState = adaptiveState[subject];
  const currentLevel = currentSubjectState.level;
  const provider = getActiveProvider();

  useEffect(() => { saveState(adaptiveState); }, [adaptiveState]);
  useEffect(() => { saveStats(lifetimeStats); }, [lifetimeStats]);
  useEffect(() => { saveAnswered(answeredQuestions); }, [answeredQuestions]);

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

  useEffect(() => {
    const state = adaptiveState[subject];
    loadQuestion(subject, state.level, answeredQuestions[subject]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject]);

  // ---------------------------------------------------------------------------
  // Submit answer
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
  // Mark result
  // ---------------------------------------------------------------------------

  const handleMarkResult = useCallback((correct: boolean, fromTrivia = false) => {
    if (!currentQuestion) return;

    const levelAtAnswer = adaptiveState[subject].level;
    const qText = currentQuestion.question;

    // Update persistent answered questions (rolling buffer)
    setAnsweredQuestions(prev => {
      const updated = [...prev[subject], qText].slice(-ANSWERED_BUFFER);
      return { ...prev, [subject]: updated };
    });

    // Update lifetime stats
    setLifetimeStats(prev => {
      const subj = prev[subject];
      const lvl = subj.byLevel[levelAtAnswer];
      return {
        ...prev,
        [subject]: {
          total: subj.total + 1,
          correct: subj.correct + (correct ? 1 : 0),
          byLevel: {
            ...subj.byLevel,
            [levelAtAnswer]: { total: lvl.total + 1, correct: lvl.correct + (correct ? 1 : 0) },
          },
        },
      };
    });

    // Update level progression
    setAdaptiveState(prev => {
      const subjectState = prev[subject];
      const newTotal = subjectState.levelTotal + 1;
      const newCorrect = subjectState.levelCorrect + (correct ? 1 : 0);

      let newLevel = subjectState.level;
      let resetCorrect = newCorrect;
      let resetTotal = newTotal;

      if (newTotal >= QUESTIONS_PER_LEVEL && newCorrect >= CORRECT_TO_ADVANCE) {
        if (subjectState.level < 3) {
          newLevel = (subjectState.level + 1) as 1 | 2 | 3;
          resetCorrect = 0;
          resetTotal = 0;
        }
      }

      return {
        ...prev,
        [subject]: { level: newLevel, levelCorrect: resetCorrect, levelTotal: resetTotal },
      };
    });

    if (!fromTrivia) {
      setAwaitingMark(false);
      setTimeout(() => {
        setAdaptiveState(prev => {
          const updatedLevel = prev[subject].level;
          const updatedAnswered = [...answeredQuestions[subject], qText].slice(-ANSWERED_BUFFER);
          loadQuestion(subject, updatedLevel, updatedAnswered);
          return prev;
        });
      }, 300);
    }
  }, [currentQuestion, answeredQuestions, subject, adaptiveState, loadQuestion]);

  // ---------------------------------------------------------------------------
  // Quiz Me
  // ---------------------------------------------------------------------------

  const handleQuizMe = async () => {
    if (!currentQuestion) return;
    setTriviaLoading(true);
    try {
      const answers = await generateTriviaAnswers(adaptiveToQuestion(currentQuestion), []);
      setTriviaAnswers(shuffleArray(answers));
      setTriviaMode(true);
    } catch {
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
  // Trivia select
  // ---------------------------------------------------------------------------

  const handleTriviaSelect = (answerId: string) => {
    if (selectedTriviaAnswer) return;
    setSelectedTriviaAnswer(answerId);
    const answer = triviaAnswers?.find(a => a.id === answerId);
    const correct = answer?.isCorrect ?? false;
    setTriviaResult(correct ? 'correct' : 'incorrect');
    handleMarkResult(correct, true);
  };

  // ---------------------------------------------------------------------------
  // Hints
  // ---------------------------------------------------------------------------

  const handleRevealHint = () => {
    if (!currentQuestion) return;
    if (hintsShown < currentQuestion.hints.length) {
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
    setCurrentQuestion(null);
    setFeedback(null);
    setAwaitingMark(false);
  };

  // ---------------------------------------------------------------------------
  // Next question (after trivia)
  // ---------------------------------------------------------------------------

  const handleNextQuestion = () => {
    const nextLevel = adaptiveState[subject].level;
    loadQuestion(subject, nextLevel, answeredQuestions[subject]);
    setTriviaMode(false);
    setTriviaAnswers(null);
    setSelectedTriviaAnswer(null);
    setTriviaResult(null);
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const levelLabel = LEVEL_LABELS[currentLevel];
  const levelProgress = currentSubjectState.levelTotal;
  const levelCorrect = currentSubjectState.levelCorrect;
  const providerLabel = PROVIDER_LABELS[provider] ?? provider;

  return (
    <div className="container mx-auto px-4 py-8 pb-36 md:pb-8 max-w-3xl">
      {/* Header row: title + subject toggle */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Zap size={20} className="text-blue-500 dark:text-blue-400" />
          <h1 className="text-xl font-bold">Adaptive Practice</h1>
        </div>

        {/* Subject toggle */}
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {(['sql', 'python'] as const).map(subj => (
            <button
              key={subj}
              onClick={() => handleSubjectChange(subj)}
              className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                subject === subj
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {subj === 'sql' ? 'SQL' : 'Python'}
            </button>
          ))}
        </div>
      </div>

      {/* Level pill — subtle, expandable */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowLevelDetail(v => !v)}
          className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors group"
        >
          <Badge
            label={levelLabel}
            variant="difficulty"
            difficulty={levelLabel}
            size="sm"
          />
          <span className="font-medium">Level {currentLevel}</span>
          <span className="text-gray-400">·</span>
          <span>{levelCorrect}/{CORRECT_TO_ADVANCE} to advance</span>
          <ChevronRight
            size={12}
            className={`transition-transform ${showLevelDetail ? 'rotate-90' : ''} group-hover:translate-x-0.5`}
          />
        </button>

        <span className="text-xs text-gray-400 dark:text-gray-500">
          Generated by {providerLabel}
        </span>
      </div>

      {/* Level detail (collapsible) */}
      {showLevelDetail && (
        <div className="mb-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-3 text-sm">
          <div className="flex gap-4">
            {([1, 2, 3] as const).map(lvl => {
              const unlocked = lvl === 1 || adaptiveState[subject].level >= lvl;
              const isActive = currentLevel === lvl;
              const isCompleted = adaptiveState[subject].level > lvl;
              return (
                <div
                  key={lvl}
                  className={`flex items-center gap-1.5 ${isActive ? 'text-blue-600 dark:text-blue-400 font-medium' : isCompleted ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}
                >
                  {isCompleted ? (
                    <CheckCircle size={13} />
                  ) : !unlocked ? (
                    <span className="w-3 h-3 rounded-full border border-current opacity-40" />
                  ) : (
                    <span className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-blue-500' : 'bg-current'}`} />
                  )}
                  <span>L{lvl} {LEVEL_LABELS[lvl]}{isActive ? ` (${levelProgress}/${QUESTIONS_PER_LEVEL})` : ''}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lifetime stats strip */}
      <div className="flex gap-3 mb-5">
        {(['sql', 'python'] as const).map(subj => {
          const s = lifetimeStats[subj];
          const pct = s.total > 0 ? Math.round((s.correct / s.total) * 100) : null;
          const isActive = subj === subject;
          return (
            <div
              key={subj}
              className={`flex-1 rounded-lg border px-3 py-2 transition-colors ${
                isActive
                  ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50'
              }`}
            >
              <div className="flex items-baseline justify-between mb-1">
                <span className={`text-xs font-semibold uppercase tracking-wide ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  {subj.toUpperCase()}
                </span>
                {pct !== null && (
                  <span className={`text-xs font-bold ${pct >= 70 ? 'text-green-600 dark:text-green-400' : pct >= 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-500 dark:text-red-400'}`}>
                    {pct}%
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                <span className="font-medium">{s.total}</span>
                <span className="text-gray-400">answered</span>
                <span className="text-green-600 dark:text-green-400 font-medium">{s.correct}✓</span>
                {s.total - s.correct > 0 && (
                  <span className="text-red-500 dark:text-red-400 font-medium">{s.total - s.correct}✗</span>
                )}
              </div>
              {s.total > 0 && (
                <div className="mt-1.5 flex gap-0.5 h-1">
                  <div
                    className="rounded-full bg-green-400 dark:bg-green-500 transition-all duration-500"
                    style={{ width: `${(s.correct / s.total) * 100}%` }}
                  />
                  <div
                    className="rounded-full bg-red-400 dark:bg-red-500 transition-all duration-500"
                    style={{ width: `${((s.total - s.correct) / s.total) * 100}%` }}
                  />
                </div>
              )}
              {s.total === 0 && (
                <div className="mt-1.5 h-1 rounded-full bg-gray-200 dark:bg-gray-700" />
              )}
            </div>
          );
        })}
      </div>

      {/* Main content */}
      {isLoading ? (
        <Card padding="lg">
          <div className="flex flex-col items-center py-12 gap-3">
            <Spinner size="lg" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">Generating your question…</p>
          </div>
        </Card>
      ) : !currentQuestion ? (
        <Card padding="lg">
          <div className="flex flex-col items-center py-10 gap-4">
            <Brain size={36} className="text-gray-400" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">Couldn't load a question. Try again.</p>
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
        /* Trivia MCQ */
        <Card padding="md">
          <p className="text-gray-900 dark:text-gray-100 font-semibold text-lg leading-snug mb-5">
            {currentQuestion.question}
          </p>

          <div className="space-y-2 mb-4">
            {triviaAnswers.map(answer => {
              let btnClass = 'w-full text-left p-3 rounded-lg border text-sm transition-all duration-150 ';
              if (!selectedTriviaAnswer) {
                btnClass += 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer text-gray-800 dark:text-gray-200';
              } else if (answer.isCorrect) {
                btnClass += 'border-green-400 dark:border-green-500 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300';
              } else if (answer.id === selectedTriviaAnswer) {
                btnClass += 'border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300';
              } else {
                btnClass += 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 opacity-50 text-gray-500 dark:text-gray-500';
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
                      <CheckCircle size={15} className="text-green-500 mt-0.5 shrink-0" />
                    )}
                    {selectedTriviaAnswer && answer.id === selectedTriviaAnswer && !answer.isCorrect && (
                      <XCircle size={15} className="text-red-500 mt-0.5 shrink-0" />
                    )}
                    <span>{answer.text}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {triviaResult && (
            <div className={`rounded-lg p-3 mb-4 text-sm font-medium ${
              triviaResult === 'correct'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
            }`}>
              {triviaResult === 'correct' ? 'Correct!' : 'Not quite — the correct answer is highlighted above.'}
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
          {/* Question — the hero element */}
          <p className="text-gray-900 dark:text-gray-100 font-semibold text-lg leading-snug mb-5">
            {currentQuestion.question}
          </p>

          {/* Code reveal (when answer shown) */}
          {showAnswer && currentQuestion.pseudoCode && (
            <pre className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-xs overflow-x-auto mb-4 text-gray-800 dark:text-gray-300">
              {currentQuestion.pseudoCode}
            </pre>
          )}

          {/* Answer area */}
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
                    ? 'Hint'
                    : hintsShown < currentQuestion.hints.length
                    ? `Hint ${hintsShown + 1}`
                    : 'Show Answer'}
                </Button>
              </div>
            </>
          )}

          {/* AI Feedback */}
          {feedback && (
            <div className="mt-4 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Brain size={15} className="text-blue-500" />
                <span className="font-semibold text-blue-700 dark:text-blue-300 text-sm">AI Feedback</span>
              </div>
              <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                {feedback}
              </p>
            </div>
          )}

          {/* Self-assessment */}
          {awaitingMark && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                How did you do? This determines your level progress.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={() => handleMarkResult(true)}
                  icon={<CheckCircle size={16} />}
                  className="border border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                >
                  Got it
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => handleMarkResult(false)}
                  icon={<XCircle size={16} />}
                  className="border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  Missed it
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Hints */}
      {!triviaMode && currentQuestion && hintsShown > 0 && (
        <div className="mt-3 space-y-2">
          {currentQuestion.hints.slice(0, hintsShown).map((hint, idx) => (
            <div
              key={idx}
              className="flex gap-3 rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 p-3"
            >
              <Lightbulb size={15} className="text-yellow-500 mt-0.5 shrink-0" />
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
        <div className="mt-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={15} className="text-green-500" />
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

      {/* Skip */}
      {!triviaMode && !isLoading && currentQuestion && !awaitingMark && (
        <div className="mt-4 text-center">
          <button
            onClick={() => loadQuestion(subject, currentLevel, answeredIds)}
            className="inline-flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <SkipForward size={12} />
            Skip this question
          </button>
        </div>
      )}
    </div>
  );
};

export default AdaptivePractice;
