import { useState, useEffect, useCallback, useRef } from 'react';
import { Clock, ChevronDown, ChevronUp, SkipForward, ArrowRight, RotateCcw, Home, Play, Zap } from 'lucide-react';
import { Card, Badge, Button, ProgressBar } from '../ui';
import type { Question } from '../../hooks/useQuestions';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Mixed';
type Phase = 'setup' | 'sql' | 'python' | 'results';
type QuestionMode = 'standard' | 'quick';

interface AssessmentAnswer {
  questionId: number;
  userAnswer: string;
  timeSpent: number; // seconds on this question
  skipped: boolean;
}

interface PhaseResult {
  answers: AssessmentAnswer[];
  totalTime: number; // seconds actually used
  questions: Question[];
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const PHASE_DURATION = 25 * 60; // 25 minutes in seconds

const formatTimer = (totalSeconds: number): string => {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const timerColor = (remaining: number, total: number): 'green' | 'yellow' | 'red' => {
  const pct = remaining / total;
  if (pct > 0.5) return 'green';
  if (pct > 0.25) return 'yellow';
  return 'red';
};

const timerBarBg: Record<'green' | 'yellow' | 'red', string> = {
  green: 'bg-green-500 dark:bg-green-400',
  yellow: 'bg-yellow-500 dark:bg-yellow-400',
  red: 'bg-red-500 dark:bg-red-400',
};

/** Weighted random selection from a pool based on difficulty setting. */
const selectQuestions = (pool: Question[], count: number, difficulty: Difficulty): Question[] => {
  let filtered: Question[];
  if (difficulty === 'Mixed') {
    filtered = [...pool];
  } else {
    // Weight toward the selected difficulty but allow some others
    const primary = pool.filter((q) => q.difficulty === difficulty);
    const others = pool.filter((q) => q.difficulty !== difficulty);
    // Fill primarily from the matching difficulty, pad from others if needed
    filtered = [...primary, ...others];
  }
  // Shuffle
  const shuffled = filtered.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const TimedAssessment = () => {
  /* ---------- data loading ---------- */
  const [sqlQuestions, setSqlQuestions] = useState<Question[]>([]);
  const [pythonQuestions, setPythonQuestions] = useState<Question[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [sqlRes, pyRes] = await Promise.all([
          fetch('./data/sql-advanced.json'),
          fetch('./data/python-advanced.json'),
        ]);
        if (!sqlRes.ok || !pyRes.ok) throw new Error('Failed to load question data');
        const sqlJson = await sqlRes.json();
        const pyJson = await pyRes.json();
        setSqlQuestions(sqlJson.questions ?? []);
        setPythonQuestions(pyJson.questions ?? []);
        setDataError(null);
      } catch (err) {
        console.error(err);
        setDataError('Failed to load question data. Please refresh.');
      } finally {
        setDataLoading(false);
      }
    };
    load();
  }, []);

  /* ---------- assessment state ---------- */
  const [phase, setPhase] = useState<Phase>('setup');
  const [difficulty, setDifficulty] = useState<Difficulty>('Mixed');
  const [mode, setMode] = useState<QuestionMode>('standard');
  const questionCount = mode === 'standard' ? 5 : 3;

  // Selected question sets for the current run
  const [selectedSql, setSelectedSql] = useState<Question[]>([]);
  const [selectedPython, setSelectedPython] = useState<Question[]>([]);

  // Per-phase tracking
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [answers, setAnswers] = useState<AssessmentAnswer[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(PHASE_DURATION);
  const questionStartRef = useRef(Date.now());

  // Results
  const [sqlResult, setSqlResult] = useState<PhaseResult | null>(null);
  const [pythonResult, setPythonResult] = useState<PhaseResult | null>(null);

  // Expand/collapse per-question in results
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());

  /* ---------- timer ---------- */
  useEffect(() => {
    if (phase !== 'sql' && phase !== 'python') return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase]);

  // When timer hits 0, auto-advance
  useEffect(() => {
    if (timeRemaining === 0 && (phase === 'sql' || phase === 'python')) {
      finishPhase();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRemaining, phase]);

  /* ---------- beforeunload warning ---------- */
  useEffect(() => {
    if (phase === 'sql' || phase === 'python') {
      const handler = (e: BeforeUnloadEvent) => {
        e.preventDefault();
      };
      window.addEventListener('beforeunload', handler);
      return () => window.removeEventListener('beforeunload', handler);
    }
  }, [phase]);

  /* ---------- actions ---------- */

  const startAssessment = () => {
    const sql = selectQuestions(sqlQuestions, questionCount, difficulty);
    const py = selectQuestions(pythonQuestions, questionCount, difficulty);
    setSelectedSql(sql);
    setSelectedPython(py);
    setCurrentIndex(0);
    setCurrentAnswer('');
    setAnswers([]);
    setTimeRemaining(PHASE_DURATION);
    questionStartRef.current = Date.now();
    setSqlResult(null);
    setPythonResult(null);
    setExpandedResults(new Set());
    setPhase('sql');
  };

  const currentQuestions = phase === 'sql' ? selectedSql : selectedPython;

  const recordAnswer = useCallback(
    (skipped: boolean) => {
      const q = currentQuestions[currentIndex];
      if (!q) return;
      const timeSpent = Math.round((Date.now() - questionStartRef.current) / 1000);
      const entry: AssessmentAnswer = {
        questionId: q.id,
        userAnswer: skipped ? '' : currentAnswer,
        timeSpent,
        skipped,
      };
      setAnswers((prev) => [...prev, entry]);
      return entry;
    },
    [currentAnswer, currentIndex, currentQuestions],
  );

  const advanceQuestion = useCallback(
    (skipped: boolean) => {
      recordAnswer(skipped);
      if (currentIndex + 1 < currentQuestions.length) {
        setCurrentIndex((i) => i + 1);
        setCurrentAnswer('');
        questionStartRef.current = Date.now();
      } else {
        // Phase complete
        finishPhase();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentIndex, currentQuestions.length, recordAnswer],
  );

  const finishPhase = useCallback(() => {
    // Collect any remaining answer for the current question
    const q = currentQuestions[currentIndex];
    const alreadyRecorded = answers.length > currentIndex;

    let allAnswers = [...answers];
    if (!alreadyRecorded && q) {
      const timeSpent = Math.round((Date.now() - questionStartRef.current) / 1000);
      allAnswers.push({
        questionId: q.id,
        userAnswer: currentAnswer,
        timeSpent,
        skipped: currentAnswer.trim() === '',
      });
    }

    // Fill skipped for any remaining questions
    for (let i = allAnswers.length; i < currentQuestions.length; i++) {
      allAnswers.push({
        questionId: currentQuestions[i].id,
        userAnswer: '',
        timeSpent: 0,
        skipped: true,
      });
    }

    const totalUsed = PHASE_DURATION - timeRemaining;
    const result: PhaseResult = {
      answers: allAnswers,
      totalTime: totalUsed,
      questions: currentQuestions,
    };

    if (phase === 'sql') {
      setSqlResult(result);
      // Transition to python
      setCurrentIndex(0);
      setCurrentAnswer('');
      setAnswers([]);
      setTimeRemaining(PHASE_DURATION);
      questionStartRef.current = Date.now();
      setPhase('python');
    } else {
      setPythonResult(result);
      setPhase('results');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, currentAnswer, currentIndex, currentQuestions, phase, timeRemaining]);

  const toggleResultExpand = (key: string) => {
    setExpandedResults((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const resetToSetup = () => setPhase('setup');

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */

  /* ---------- loading / error ---------- */
  if (dataLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 dark:border-gray-600 border-t-blue-600 dark:border-t-blue-400" />
        <p className="mt-2 text-gray-600 dark:text-gray-400">Loading questions...</p>
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <p className="text-center text-red-600 dark:text-red-400">{dataError}</p>
        </Card>
      </div>
    );
  }

  /* ========================== SETUP ========================== */
  if (phase === 'setup') {
    return (
      <div className="container mx-auto px-4 py-8 pb-36 md:pb-8 max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">Timed Assessment</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Simulate Meta's 50-minute technical screen
          </p>
        </div>

        <Card className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock size={24} className="text-blue-500" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Format</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">25 min SQL + 25 min Python</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            You will be presented with SQL questions first, followed by Python questions. Each phase
            has its own 25-minute timer. When the timer expires or you finish all questions, you
            automatically move to the next phase.
          </p>
        </Card>

        {/* Difficulty */}
        <Card className="mb-6" title="Difficulty">
          <div className="flex flex-wrap gap-2">
            {(['Easy', 'Medium', 'Hard', 'Mixed'] as Difficulty[]).map((d) => (
              <Button
                key={d}
                variant={difficulty === d ? 'primary' : 'secondary'}
                size="md"
                onClick={() => setDifficulty(d)}
              >
                {d}
              </Button>
            ))}
          </div>
        </Card>

        {/* Question mode */}
        <Card className="mb-8" title="Question Count">
          <div className="flex flex-wrap gap-3">
            <Button
              variant={mode === 'standard' ? 'primary' : 'secondary'}
              size="md"
              icon={<Play size={16} />}
              onClick={() => setMode('standard')}
            >
              Standard (5 + 5)
            </Button>
            <Button
              variant={mode === 'quick' ? 'primary' : 'secondary'}
              size="md"
              icon={<Zap size={16} />}
              onClick={() => setMode('quick')}
            >
              Quick (3 + 3)
            </Button>
          </div>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            {mode === 'standard'
              ? '5 SQL questions + 5 Python questions (recommended)'
              : '3 SQL questions + 3 Python questions (shorter session)'}
          </p>
        </Card>

        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={startAssessment}
          disabled={sqlQuestions.length === 0 || pythonQuestions.length === 0}
          icon={<Play size={20} />}
        >
          Start Assessment
        </Button>
      </div>
    );
  }

  /* =================== ACTIVE PHASE (SQL / Python) =================== */
  if (phase === 'sql' || phase === 'python') {
    const question = currentQuestions[currentIndex];
    const color = timerColor(timeRemaining, PHASE_DURATION);
    const pct = (timeRemaining / PHASE_DURATION) * 100;
    const phaseLabel = phase === 'sql' ? 'SQL' : 'Python';
    const isLast = currentIndex + 1 >= currentQuestions.length;

    return (
      <div className="container mx-auto px-4 py-4 pb-36 md:pb-8 max-w-3xl">
        {/* Timer bar (sticky top) */}
        <div className="sticky top-0 z-30 bg-white dark:bg-gray-900 pb-3 pt-1 -mx-4 px-4 border-b border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {phaseLabel} Phase &mdash; Question {currentIndex + 1} of {currentQuestions.length}
            </span>
            <span
              className={`text-2xl font-mono font-bold ${
                color === 'red'
                  ? 'text-red-600 dark:text-red-400'
                  : color === 'yellow'
                  ? 'text-yellow-600 dark:text-yellow-400'
                  : 'text-green-600 dark:text-green-400'
              }`}
            >
              {formatTimer(timeRemaining)}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-1000 ${timerBarBg[color]}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Question card */}
        {question && (
          <Card className="mb-6">
            <div className="flex items-start justify-between gap-3 mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex-1">
                {question.question}
              </h2>
              <Badge
                variant="difficulty"
                difficulty={question.difficulty}
                label={question.difficulty}
              />
            </div>

            {/* Answer area */}
            <textarea
              className="w-full h-56 p-4 font-mono text-sm bg-gray-900 text-green-400 dark:bg-gray-950 dark:text-green-300 rounded-lg border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
              placeholder={`Write your ${phaseLabel} answer here...`}
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              spellCheck={false}
            />

            {/* Action buttons */}
            <div className="flex justify-between mt-4">
              <Button
                variant="ghost"
                size="md"
                icon={<SkipForward size={16} />}
                onClick={() => advanceQuestion(true)}
              >
                Skip
              </Button>
              <Button
                variant="primary"
                size="md"
                icon={<ArrowRight size={16} />}
                iconPosition="right"
                onClick={() => advanceQuestion(false)}
              >
                {isLast ? `Finish ${phaseLabel}` : 'Next Question'}
              </Button>
            </div>
          </Card>
        )}

        {/* Progress dots */}
        <div className="flex justify-center gap-2">
          {currentQuestions.map((_, idx) => (
            <div
              key={idx}
              className={`w-3 h-3 rounded-full ${
                idx < answers.length
                  ? 'bg-blue-500 dark:bg-blue-400'
                  : idx === currentIndex
                  ? 'bg-blue-300 dark:bg-blue-600 ring-2 ring-blue-500'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  /* ========================== RESULTS ========================== */
  if (phase === 'results' && sqlResult && pythonResult) {
    const totalAnswered =
      sqlResult.answers.filter((a) => !a.skipped).length +
      pythonResult.answers.filter((a) => !a.skipped).length;
    const totalQuestions = sqlResult.questions.length + pythonResult.questions.length;
    const totalTime = sqlResult.totalTime + pythonResult.totalTime;

    const avgTime = (result: PhaseResult) => {
      const answered = result.answers.filter((a) => !a.skipped);
      if (answered.length === 0) return 0;
      return Math.round(answered.reduce((sum, a) => sum + a.timeSpent, 0) / answered.length);
    };

    const renderPhaseBreakdown = (label: string, result: PhaseResult, prefix: string) => {
      const answered = result.answers.filter((a) => !a.skipped).length;
      return (
        <Card className="mb-6" title={`${label} Phase`}>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {answered}/{result.questions.length}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Answered</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formatTimer(result.totalTime)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Time Used</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {avgTime(result)}s
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Avg / Question</div>
            </div>
          </div>

          <ProgressBar
            value={(answered / result.questions.length) * 100}
            color={answered === result.questions.length ? 'green' : 'yellow'}
            size="md"
            className="mb-4"
          />

          {/* Per-question review */}
          <div className="space-y-3">
            {result.questions.map((q, idx) => {
              const ans = result.answers[idx];
              const key = `${prefix}-${q.id}`;
              const isOpen = expandedResults.has(key);

              return (
                <div
                  key={key}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                >
                  <button
                    className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => toggleResultExpand(key)}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          ans?.skipped
                            ? 'bg-gray-400'
                            : 'bg-green-500'
                        }`}
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        Q{idx + 1}: {q.question.slice(0, 80)}
                        {q.question.length > 80 ? '...' : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <Badge
                        variant="difficulty"
                        difficulty={q.difficulty}
                        label={q.difficulty}
                        size="sm"
                      />
                      {ans?.skipped && (
                        <Badge label="Skipped" color="gray" size="sm" />
                      )}
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {ans ? `${ans.timeSpent}s` : '--'}
                      </span>
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-4 bg-gray-50 dark:bg-gray-850 dark:bg-opacity-50">
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                          Question
                        </h4>
                        <p className="text-sm text-gray-800 dark:text-gray-200">{q.question}</p>
                      </div>

                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                          Your Answer
                        </h4>
                        {ans?.userAnswer ? (
                          <pre className="text-sm bg-gray-900 text-green-400 dark:bg-gray-950 dark:text-green-300 p-3 rounded-lg overflow-x-auto font-mono whitespace-pre-wrap">
                            {ans.userAnswer}
                          </pre>
                        ) : (
                          <p className="text-sm text-gray-400 italic">No answer provided</p>
                        )}
                      </div>

                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                          Reference Answer
                        </h4>
                        <p className="text-sm text-gray-800 dark:text-gray-200">{q.answer}</p>
                      </div>

                      {q.pseudoCode && (
                        <div>
                          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                            Reference Code
                          </h4>
                          <pre className="text-sm bg-gray-900 text-green-400 dark:bg-gray-950 dark:text-green-300 p-3 rounded-lg overflow-x-auto font-mono whitespace-pre-wrap">
                            {q.pseudoCode}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      );
    };

    return (
      <div className="container mx-auto px-4 py-8 pb-36 md:pb-8 max-w-3xl">
        {/* Overall summary */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">
            Assessment Complete
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            You answered {totalAnswered} of {totalQuestions} questions in {formatTimer(totalTime)}
          </p>
        </div>

        <Card className="mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {totalAnswered}/{totalQuestions}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Total Answered</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {formatTimer(totalTime)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Total Time</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {sqlResult.answers.filter((a) => !a.skipped).length}/{sqlResult.questions.length}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">SQL</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {pythonResult.answers.filter((a) => !a.skipped).length}/{pythonResult.questions.length}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Python</div>
            </div>
          </div>
        </Card>

        {renderPhaseBreakdown('SQL', sqlResult, 'sql')}
        {renderPhaseBreakdown('Python', pythonResult, 'py')}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="primary"
            size="lg"
            className="flex-1"
            icon={<RotateCcw size={18} />}
            onClick={startAssessment}
          >
            Retake
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="flex-1"
            icon={<Home size={18} />}
            onClick={resetToSetup}
          >
            Back to Setup
          </Button>
        </div>
      </div>
    );
  }

  return null;
};

export default TimedAssessment;
