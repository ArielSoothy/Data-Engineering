import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Clock, Play, ChevronLeft, ChevronRight, Lightbulb, Eye, RotateCcw, Home, ArrowRight, Database, ChevronDown, Table2 } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { Button, Badge, Card, Spinner } from '../ui';
import { useCodeRuntime, type SQLResult, type TableSchema } from '../../hooks/useCodeRuntime';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CoderPadQuestion {
  id: string;
  phase: 'sql' | 'python';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  title: string;
  timeEstimate: number;
  question: string;
  schema: string;
  sampleData: string;
  expectedOutput: string;
  starterCode: string;
  solution: string;
  hints: string[];
  pgNotes: string | null;
}

type Phase = 'setup' | 'sql' | 'transition' | 'python' | 'results';
type LeftTab = 'question' | 'schema' | 'expected';

interface UserAnswer {
  questionId: string;
  code: string;
  output: string;
  timeSpent: number;
}

/* ------------------------------------------------------------------ */
/*  Session persistence                                                */
/* ------------------------------------------------------------------ */

const SESSION_KEY = 'coderpad_session';
const PHASE_DURATION = 25 * 60;
const TRANSITION_DURATION = 30;

interface SavedSession {
  phase: Phase;
  currentIndex: number;
  codeMap: Record<string, string>;
  answers: UserAnswer[];
  timeRemaining: number;
  sqlTimeUsed: number;
  savedAt: number;
}

function saveCoderPadSession(s: SavedSession) {
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(s)); } catch { /* full */ }
}

function loadCoderPadSession(): SavedSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as SavedSession;
    if (Date.now() - s.savedAt > 2 * 60 * 60 * 1000) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return s;
  } catch { return null; }
}

/* ------------------------------------------------------------------ */
/*  Timer helpers                                                      */
/* ------------------------------------------------------------------ */

function formatTimer(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function timerColorClass(remaining: number, total: number): string {
  const pct = remaining / total;
  if (pct > 0.5) return 'text-green-400';
  if (pct > 0.25) return 'text-yellow-400';
  return 'text-red-400';
}

function timerBgClass(remaining: number, total: number): string {
  const pct = remaining / total;
  if (pct > 0.5) return 'bg-green-500';
  if (pct > 0.25) return 'bg-yellow-500';
  return 'bg-red-500';
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function CoderPad() {
  const runtime = useCodeRuntime();

  // Data
  const [allQuestions, setAllQuestions] = useState<CoderPadQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  // Phase
  const [phase, setPhase] = useState<Phase>('setup');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Editor
  const [code, setCode] = useState('');
  const [codeMap, setCodeMap] = useState<Record<string, string>>({});
  const editorRef = useRef<any>(null);

  // Output
  const [sqlResult, setSqlResult] = useState<SQLResult | null>(null);
  const [pythonOutput, setPythonOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  // Timer
  const [timeRemaining, setTimeRemaining] = useState(PHASE_DURATION);
  const [sqlTimeUsed, setSqlTimeUsed] = useState(0);
  const questionStartRef = useRef(Date.now());

  // UI state
  const [leftTab, setLeftTab] = useState<LeftTab>('question');
  const [hintsShown, setHintsShown] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [detailedSchema, setDetailedSchema] = useState<TableSchema[]>([]);
  const [expandedTable, setExpandedTable] = useState<string | null>(null);

  // Results
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [reviewIndex, setReviewIndex] = useState<number | null>(null);

  // Derived
  const sqlQuestions = useMemo(() => allQuestions.filter(q => q.phase === 'sql'), [allQuestions]);
  const pyQuestions = useMemo(() => allQuestions.filter(q => q.phase === 'python'), [allQuestions]);
  const currentQuestions = phase === 'python' ? pyQuestions : sqlQuestions;
  const currentQuestion = currentQuestions[currentIndex] || null;

  /* ---- Load questions ---- */
  useEffect(() => {
    fetch('./data/coderpad-questions.json')
      .then(r => r.json())
      .then((data: CoderPadQuestion[]) => {
        setAllQuestions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  /* ---- Session restore ---- */
  useEffect(() => {
    if (allQuestions.length === 0) return;
    const saved = loadCoderPadSession();
    if (saved && saved.phase !== 'setup' && saved.phase !== 'results') {
      setPhase(saved.phase);
      setCurrentIndex(saved.currentIndex);
      setCodeMap(saved.codeMap);
      setAnswers(saved.answers);
      setTimeRemaining(saved.timeRemaining);
      setSqlTimeUsed(saved.sqlTimeUsed);
      const qs = saved.phase === 'python' ? allQuestions.filter(q => q.phase === 'python') : allQuestions.filter(q => q.phase === 'sql');
      const q = qs[saved.currentIndex];
      if (q) setCode(saved.codeMap[q.id] || q.starterCode);
    }
  }, [allQuestions]);

  /* ---- Session save ---- */
  useEffect(() => {
    if (phase === 'setup' || phase === 'results') return;
    saveCoderPadSession({
      phase, currentIndex, codeMap, answers, timeRemaining, sqlTimeUsed,
      savedAt: Date.now(),
    });
  }, [phase, currentIndex, codeMap, answers, timeRemaining, sqlTimeUsed]);

  /* ---- Timer ---- */
  useEffect(() => {
    if (phase !== 'sql' && phase !== 'python' && phase !== 'transition') return;
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  /* ---- Auto-advance on timer zero ---- */
  useEffect(() => {
    if (timeRemaining !== 0) return;
    if (phase === 'sql') startTransition();
    else if (phase === 'transition') startPythonPhase();
    else if (phase === 'python') finishAll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRemaining, phase]);

  /* ---- Runtime init ---- */
  useEffect(() => {
    if (phase === 'sql') runtime.initFor('sql');
    else if (phase === 'transition' || phase === 'python') runtime.initFor('python');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  /* ---- Load schema when SQL runtime ready ---- */
  useEffect(() => {
    if (runtime.ready && (phase === 'sql' || phase === 'setup')) {
      runtime.getDetailedSchema().then(setDetailedSchema);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runtime.ready, phase]);

  /* ---- Beforeunload warning ---- */
  useEffect(() => {
    if (phase !== 'sql' && phase !== 'python') return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [phase]);

  /* ---- Init SQL on setup mount ---- */
  useEffect(() => {
    if (phase === 'setup') runtime.initFor('sql');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- Run code ---- */
  const runCode = useCallback(async () => {
    if (!code.trim() || isRunning) return;
    setIsRunning(true);
    try {
      if (phase === 'sql' || (phase === 'results' && currentQuestion?.phase === 'sql')) {
        const result = await runtime.runSQL(code);
        setSqlResult(result);
        setPythonOutput('');
      } else {
        const result = await runtime.runPython(code);
        setPythonOutput(result);
        setSqlResult(null);
      }
    } catch (e: any) {
      setPythonOutput(`Error: ${e.message}`);
    } finally {
      setIsRunning(false);
    }
  }, [code, isRunning, phase, runtime, currentQuestion]);

  /* ---- Save code for current question ---- */
  const saveCurrentCode = useCallback(() => {
    if (!currentQuestion) return;
    setCodeMap(prev => ({ ...prev, [currentQuestion.id]: code }));
  }, [currentQuestion, code]);

  /* ---- Question navigation ---- */
  const goToQuestion = useCallback((index: number) => {
    saveCurrentCode();
    const timeSpent = Math.round((Date.now() - questionStartRef.current) / 1000);
    if (currentQuestion) {
      setAnswers(prev => {
        const existing = prev.findIndex(a => a.questionId === currentQuestion.id);
        const entry: UserAnswer = {
          questionId: currentQuestion.id,
          code,
          output: sqlResult ? 'SQL result' : pythonOutput,
          timeSpent: existing >= 0 ? prev[existing].timeSpent + timeSpent : timeSpent,
        };
        if (existing >= 0) {
          const next = [...prev];
          next[existing] = entry;
          return next;
        }
        return [...prev, entry];
      });
    }

    setCurrentIndex(index);
    const q = currentQuestions[index];
    if (q) {
      setCode(codeMap[q.id] || q.starterCode);
      setSqlResult(null);
      setPythonOutput('');
      setHintsShown(0);
      setShowSolution(false);
      setLeftTab('question');
      questionStartRef.current = Date.now();
    }
  }, [saveCurrentCode, currentQuestion, currentQuestions, code, codeMap, sqlResult, pythonOutput]);

  /* ---- Phase transitions ---- */
  const startSqlPhase = useCallback(() => {
    setPhase('sql');
    setCurrentIndex(0);
    setTimeRemaining(PHASE_DURATION);
    const q = sqlQuestions[0];
    if (q) setCode(q.starterCode);
    setSqlResult(null);
    setPythonOutput('');
    setHintsShown(0);
    setShowSolution(false);
    questionStartRef.current = Date.now();
    sessionStorage.removeItem(SESSION_KEY);
  }, [sqlQuestions]);

  const startTransition = useCallback(() => {
    saveCurrentCode();
    setSqlTimeUsed(PHASE_DURATION - timeRemaining);
    setPhase('transition');
    setTimeRemaining(TRANSITION_DURATION);
  }, [saveCurrentCode, timeRemaining]);

  const startPythonPhase = useCallback(() => {
    setPhase('python');
    setCurrentIndex(0);
    setTimeRemaining(PHASE_DURATION);
    const q = pyQuestions[0];
    if (q) setCode(codeMap[q.id] || q.starterCode);
    setSqlResult(null);
    setPythonOutput('');
    setHintsShown(0);
    setShowSolution(false);
    questionStartRef.current = Date.now();
  }, [pyQuestions, codeMap]);

  const finishAll = useCallback(() => {
    saveCurrentCode();
    setPhase('results');
    sessionStorage.removeItem(SESSION_KEY);
  }, [saveCurrentCode]);

  /* ---- Editor mount (Ctrl+Enter shortcut) ---- */
  const handleEditorMount = useCallback((editor: any, monaco: any) => {
    editorRef.current = editor;
    editor.addAction({
      id: 'run-code',
      label: 'Run Code',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
      run: () => {
        // Trigger run via a DOM event since closure won't update
        document.dispatchEvent(new CustomEvent('coderpad-run'));
      },
    });
  }, []);

  useEffect(() => {
    const handler = () => runCode();
    document.addEventListener('coderpad-run', handler);
    return () => document.removeEventListener('coderpad-run', handler);
  }, [runCode]);

  /* ================================================================ */
  /*  SETUP SCREEN                                                     */
  /* ================================================================ */
  if (loading) return <div className="flex items-center justify-center py-24"><Spinner size="lg" /></div>;

  if (phase === 'setup') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium mb-4">
            <Database size={16} /> CoderPad Simulator
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Meta DE Technical Screen
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Simulate the real interview environment
          </p>
        </div>

        <Card className="mb-6">
          <h3 className="font-semibold text-lg mb-3">Format</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Badge variant="info">SQL</Badge>
              <span>25 minutes — {sqlQuestions.length} questions (Easy → Hard)</span>
            </div>
            <div className="flex items-center gap-3 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Badge variant="warning">Python</Badge>
              <span>25 minutes — {pyQuestions.length} questions (Easy → Hard)</span>
            </div>
          </div>
        </Card>

        <Card className="mb-6">
          <h3 className="font-semibold text-lg mb-3">Engine Note</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            SQL runs on <strong>SQLite</strong> (sql.js in browser). JOINs, CTEs, window functions,
            GROUP BY, HAVING all work the same as PostgreSQL. Date functions differ slightly —
            each question includes a PostgreSQL syntax note.
          </p>
        </Card>

        <Card className="mb-6">
          <h3 className="font-semibold text-lg mb-3">Interview Tips</h3>
          <ul className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
            <li>• <strong>Think aloud</strong> — describe your approach before writing</li>
            <li>• <strong>Correct first</strong>, optimize later</li>
            <li>• <strong>Run early</strong> and often — use Ctrl+Enter</li>
            <li>• <strong>Ask for syntax help</strong> — it's explicitly allowed</li>
            <li>• <strong>Check NULLs</strong> and edge cases</li>
            <li>• <strong>Read the schema</strong> before writing the query</li>
          </ul>
        </Card>

        <div className="text-center">
          <Button
            variant="primary"
            size="lg"
            onClick={startSqlPhase}
            disabled={!runtime.ready && !runtime.loading}
          >
            {runtime.loading ? (
              <><Spinner size="sm" /> Loading SQL engine...</>
            ) : (
              <>Start Simulation <ArrowRight size={18} className="ml-2" /></>
            )}
          </Button>
        </div>
      </div>
    );
  }

  /* ================================================================ */
  /*  TRANSITION SCREEN                                                */
  /* ================================================================ */
  if (phase === 'transition') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">SQL Phase Complete</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Time used: {formatTimer(sqlTimeUsed)} / 25:00
        </p>

        <Card className="mb-6 text-left">
          <h3 className="font-semibold mb-2">Switching to Python...</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {runtime.loading ? 'Loading Python runtime (Pyodide)...' : 'Python runtime ready!'}
          </p>
          <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <li>• Pure Python — no pandas, no frameworks</li>
            <li>• Data is provided as Python variables</li>
            <li>• Implement the function, then run to check output</li>
          </ul>
        </Card>

        <div className={`text-4xl font-mono font-bold mb-6 ${timerColorClass(timeRemaining, TRANSITION_DURATION)}`}>
          {formatTimer(timeRemaining)}
        </div>

        <Button variant="primary" onClick={startPythonPhase}>
          Start Python Phase <ArrowRight size={18} className="ml-2" />
        </Button>
      </div>
    );
  }

  /* ================================================================ */
  /*  RESULTS SCREEN                                                   */
  /* ================================================================ */
  if (phase === 'results') {
    const allQsOrdered = [...sqlQuestions, ...pyQuestions];
    const reviewQuestion = reviewIndex !== null ? allQsOrdered[reviewIndex] : null;
    const reviewAnswer = reviewQuestion ? answers.find(a => a.questionId === reviewQuestion.id) : null;

    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
          Simulation Complete
        </h2>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card>
            <div className="text-center">
              <Badge variant="info" className="mb-2">SQL Phase</Badge>
              <p className="text-2xl font-bold">{formatTimer(sqlTimeUsed)}</p>
              <p className="text-sm text-gray-500">of 25:00 used</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <Badge variant="warning" className="mb-2">Python Phase</Badge>
              <p className="text-2xl font-bold">
                {formatTimer(PHASE_DURATION - timeRemaining)}
              </p>
              <p className="text-sm text-gray-500">of 25:00 used</p>
            </div>
          </Card>
        </div>

        <h3 className="font-semibold text-lg mb-3">Review Questions</h3>
        <div className="space-y-2 mb-6">
          {allQsOrdered.map((q, i) => {
            const ans = answers.find(a => a.questionId === q.id);
            return (
              <button
                key={q.id}
                onClick={() => setReviewIndex(reviewIndex === i ? null : i)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  reviewIndex === i
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Badge variant={q.phase === 'sql' ? 'info' : 'warning'}>{q.phase.toUpperCase()}</Badge>
                  <Badge variant="difficulty">{q.difficulty}</Badge>
                  <span className="font-medium text-sm">{q.title}</span>
                  <span className="ml-auto text-xs text-gray-400">
                    {ans ? `${Math.round(ans.timeSpent / 60)}m` : 'not attempted'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {reviewQuestion && (
          <Card className="mb-6">
            <h4 className="font-semibold mb-2">{reviewQuestion.title}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap mb-4">{reviewQuestion.question}</p>

            {reviewAnswer && (
              <div className="mb-4">
                <h5 className="text-sm font-medium mb-1">Your Code:</h5>
                <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
                  {reviewAnswer.code || '(not attempted)'}
                </pre>
              </div>
            )}

            <div className="mb-4">
              <h5 className="text-sm font-medium mb-1">Expected Output:</h5>
              <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap font-mono">
                {reviewQuestion.expectedOutput}
              </pre>
            </div>

            <div>
              <h5 className="text-sm font-medium mb-1">Reference Solution:</h5>
              <pre className="text-xs bg-gray-900 text-green-300 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
                {reviewQuestion.solution}
              </pre>
            </div>

            {reviewQuestion.pgNotes && (
              <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs text-yellow-700 dark:text-yellow-300">
                <strong>PostgreSQL note:</strong> {reviewQuestion.pgNotes}
              </div>
            )}
          </Card>
        )}

        <div className="flex gap-4 justify-center">
          <Button variant="secondary" onClick={() => { setPhase('setup'); setAnswers([]); setCodeMap({}); setReviewIndex(null); }}>
            <RotateCcw size={16} className="mr-2" /> Try Again
          </Button>
          <Button variant="ghost" onClick={() => window.location.href = '/'}>
            <Home size={16} className="mr-2" /> Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  /* ================================================================ */
  /*  ACTIVE PHASE (SQL or Python)                                     */
  /* ================================================================ */
  const phaseLabel = phase === 'sql' ? 'SQL' : 'Python';
  const totalForPhase = currentQuestions.length;
  const lang = phase === 'sql' ? 'sql' : 'python';

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-gray-100">
      {/* ---- Top bar ---- */}
      <div className="flex items-center gap-4 px-4 py-2 bg-gray-800 border-b border-gray-700 shrink-0">
        <div className="flex items-center gap-2">
          <Database size={16} className="text-blue-400" />
          <span className="font-bold text-sm">CoderPad</span>
        </div>

        <Badge variant={phase === 'sql' ? 'info' : 'warning'}>{phaseLabel} Phase</Badge>

        <span className="text-sm text-gray-400">
          Q{currentIndex + 1}/{totalForPhase}
        </span>

        {/* Question dots */}
        <div className="flex gap-1">
          {currentQuestions.map((_, i) => (
            <button
              key={i}
              onClick={() => goToQuestion(i)}
              className={`w-3 h-3 rounded-full transition-colors ${
                i === currentIndex
                  ? 'bg-blue-500'
                  : codeMap[currentQuestions[i]?.id] ? 'bg-green-500/60' : 'bg-gray-600'
              }`}
              title={`Question ${i + 1}`}
            />
          ))}
        </div>

        <div className="ml-auto flex items-center gap-4">
          {/* Timer */}
          <div className={`font-mono text-xl font-bold ${timerColorClass(timeRemaining, PHASE_DURATION)}`}>
            <Clock size={16} className="inline mr-1 mb-0.5" />
            {formatTimer(timeRemaining)}
          </div>

          {/* Progress bar */}
          <div className="w-24 h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${timerBgClass(timeRemaining, PHASE_DURATION)}`}
              style={{ width: `${(timeRemaining / PHASE_DURATION) * 100}%` }}
            />
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={phase === 'sql' ? startTransition : finishAll}
            className="text-gray-300 hover:text-white"
          >
            {phase === 'sql' ? 'End SQL →' : 'Finish →'}
          </Button>
        </div>
      </div>

      {/* ---- Split pane ---- */}
      <div className="flex flex-1 min-h-0">
        {/* ---- LEFT PANEL ---- */}
        <div className="w-[40%] border-r border-gray-700 flex flex-col min-h-0">
          {/* Left panel tabs */}
          <div className="flex border-b border-gray-700 shrink-0">
            {(['question', 'schema', 'expected'] as LeftTab[]).map(tab => (
              <button
                key={tab}
                onClick={() => setLeftTab(tab)}
                className={`flex-1 px-3 py-2 text-xs font-medium capitalize transition-colors ${
                  leftTab === tab
                    ? 'border-b-2 border-blue-500 text-blue-400 bg-gray-800'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Left panel content */}
          <div className="flex-1 overflow-y-auto p-4">
            {leftTab === 'question' && currentQuestion && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="difficulty">{currentQuestion.difficulty}</Badge>
                  <span className="text-xs text-gray-400">~{currentQuestion.timeEstimate} min</span>
                </div>
                <h3 className="font-semibold text-lg mb-3">{currentQuestion.title}</h3>
                <div className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed mb-4">
                  {currentQuestion.question}
                </div>

                {currentQuestion.pgNotes && (
                  <div className="p-2 bg-yellow-900/30 border border-yellow-700/40 rounded text-xs text-yellow-300 mb-4">
                    <strong>PostgreSQL:</strong> {currentQuestion.pgNotes}
                  </div>
                )}

                {/* Sample data */}
                <div className="mt-4">
                  <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Sample Data</h4>
                  <pre className="text-xs text-gray-300 bg-gray-800 p-3 rounded-lg overflow-x-auto whitespace-pre font-mono">
                    {currentQuestion.sampleData}
                  </pre>
                </div>
              </div>
            )}

            {leftTab === 'schema' && (
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-3">Database Schema</h4>
                {detailedSchema.length === 0 ? (
                  <p className="text-sm text-gray-500">Loading schema...</p>
                ) : (
                  <div className="space-y-2">
                    {detailedSchema.map(table => (
                      <div key={table.name} className="border border-gray-700 rounded-lg overflow-hidden">
                        <button
                          onClick={() => setExpandedTable(expandedTable === table.name ? null : table.name)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-200 hover:bg-gray-800 transition-colors"
                        >
                          <Table2 size={14} className="text-blue-400" />
                          {table.name}
                          <ChevronDown
                            size={14}
                            className={`ml-auto transition-transform ${expandedTable === table.name ? 'rotate-180' : ''}`}
                          />
                        </button>
                        {expandedTable === table.name && (
                          <div className="border-t border-gray-700 px-3 py-2 bg-gray-800/50">
                            <table className="w-full text-xs">
                              <tbody>
                                {table.columns.map(col => (
                                  <tr key={col.name} className="border-b border-gray-700/50 last:border-0">
                                    <td className="py-1 text-blue-300 font-mono">{col.name}</td>
                                    <td className="py-1 text-gray-400 text-right">{col.type || 'TEXT'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            <button
                              onClick={() => {
                                setCode(`SELECT * FROM ${table.name} LIMIT 5;`);
                                editorRef.current?.focus();
                              }}
                              className="mt-2 text-xs text-blue-400 hover:text-blue-300"
                            >
                              → SELECT * FROM {table.name} LIMIT 5
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {currentQuestion && (
                  <div className="mt-4 p-3 bg-gray-800 rounded-lg">
                    <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                      Question Schema
                    </h4>
                    <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono">
                      {currentQuestion.schema}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {leftTab === 'expected' && currentQuestion && (
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-3">Expected Output</h4>
                <pre className="text-xs text-green-300 bg-gray-800 p-3 rounded-lg overflow-x-auto whitespace-pre font-mono">
                  {currentQuestion.expectedOutput}
                </pre>

                {/* Hints */}
                <div className="mt-6">
                  <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                    Hints ({hintsShown}/{currentQuestion.hints.length})
                  </h4>
                  {currentQuestion.hints.slice(0, hintsShown).map((hint, i) => (
                    <div key={i} className="p-2 mb-2 bg-yellow-900/20 border border-yellow-700/30 rounded text-xs text-yellow-200">
                      {hint}
                    </div>
                  ))}
                  {hintsShown < currentQuestion.hints.length && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setHintsShown(h => h + 1)}
                      className="text-yellow-400"
                    >
                      <Lightbulb size={14} className="mr-1" /> Show Hint
                    </Button>
                  )}
                </div>

                {/* Solution (only after phase or explicit reveal) */}
                <div className="mt-6">
                  {showSolution ? (
                    <div>
                      <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Reference Solution</h4>
                      <pre className="text-xs text-green-300 bg-gray-800 p-3 rounded-lg overflow-x-auto whitespace-pre font-mono">
                        {currentQuestion.solution}
                      </pre>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSolution(true)}
                      className="text-gray-400"
                    >
                      <Eye size={14} className="mr-1" /> Show Solution
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ---- RIGHT PANEL ---- */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Editor */}
          <div className="flex-1 min-h-[200px]">
            <Editor
              height="100%"
              language={lang}
              theme="vs-dark"
              value={code}
              onChange={v => setCode(v || '')}
              onMount={handleEditorMount}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                padding: { top: 12 },
                renderLineHighlight: 'line',
                suggestOnTriggerCharacters: false,
                quickSuggestions: false,
              }}
            />
          </div>

          {/* Action bar */}
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 border-t border-b border-gray-700 shrink-0">
            <Button
              variant="primary"
              size="sm"
              onClick={runCode}
              disabled={isRunning || !runtime.ready}
            >
              {isRunning ? <Spinner size="sm" /> : <Play size={14} className="mr-1" />}
              {isRunning ? 'Running...' : 'Run'}
            </Button>

            <span className="text-xs text-gray-500 ml-1">Ctrl+Enter</span>

            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => goToQuestion(currentIndex - 1)}
                disabled={currentIndex === 0}
                className="text-gray-400"
              >
                <ChevronLeft size={14} /> Prev
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => goToQuestion(currentIndex + 1)}
                disabled={currentIndex >= totalForPhase - 1}
                className="text-gray-400"
              >
                Next <ChevronRight size={14} />
              </Button>
            </div>
          </div>

          {/* Output panel */}
          <div className="h-[35%] min-h-[120px] overflow-auto bg-gray-950 p-3">
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Output</h4>

            {sqlResult?.error && (
              <pre className="text-xs text-red-400 whitespace-pre-wrap font-mono">{sqlResult.error}</pre>
            )}

            {sqlResult && !sqlResult.error && sqlResult.columns.length > 0 && (
              <div className="overflow-x-auto">
                <table className="text-xs font-mono border-collapse">
                  <thead>
                    <tr>
                      {sqlResult.columns.map((col, i) => (
                        <th
                          key={i}
                          className="px-3 py-1.5 text-left font-semibold text-blue-300 border-b border-gray-700 bg-gray-900 sticky top-0"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sqlResult.rows.slice(0, 50).map((row, ri) => (
                      <tr key={ri} className={ri % 2 === 0 ? 'bg-gray-900/50' : ''}>
                        {row.map((val, ci) => (
                          <td key={ci} className="px-3 py-1 text-gray-300 border-b border-gray-800">
                            {val === null ? <span className="text-gray-600 italic">NULL</span> : String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-xs text-gray-500 mt-2">
                  {sqlResult.rowCount} row{sqlResult.rowCount !== 1 ? 's' : ''} returned
                  {sqlResult.rowCount > 50 ? ' (showing first 50)' : ''}
                </p>
              </div>
            )}

            {sqlResult && !sqlResult.error && sqlResult.columns.length === 0 && (
              <p className="text-xs text-gray-500 italic">Query executed — no rows returned.</p>
            )}

            {pythonOutput && (
              <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono">{pythonOutput}</pre>
            )}

            {!sqlResult && !pythonOutput && !isRunning && (
              <p className="text-xs text-gray-600 italic">Press Run or Ctrl+Enter to execute your code.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
