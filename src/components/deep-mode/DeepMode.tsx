import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Play, Send, Eye, EyeOff, Lightbulb, Code2, PanelLeftClose, PanelLeftOpen, Database } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { Button, Badge, Spinner } from '../ui';
import { useUnifiedQuestions } from '../../hooks/useUnifiedQuestions';
import { useCodeRuntime, type SQLResult } from '../../hooks/useCodeRuntime';
import { useAppContext } from '../../context/AppContext';
import { generateFeedback, getLastUsedModel } from '../../services/aiService';
import { getTopicsForSubject } from '../../data/topics';
import DeepSidebar from './DeepSidebar';
import type { Subject } from '../../types/studyHub';

type SubjectFilter = 'all' | Subject;

export default function DeepMode() {
  const { questions: allQuestions, loading: loadingQ, error: errorQ } = useUnifiedQuestions();
  const { preferences, updateProgress } = useAppContext();
  const runtime = useCodeRuntime();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters
  const initialSubject = (searchParams.get('subject') as SubjectFilter) || 'all';
  const initialTopic = searchParams.get('topic') || 'all';
  const [subject, setSubject] = useState<SubjectFilter>(initialSubject);
  const [topic, setTopic] = useState(initialTopic);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Editor state
  const [code, setCode] = useState('');
  const [sqlResult, setSqlResult] = useState<SQLResult | null>(null);
  const [pythonOutput, setPythonOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [showSchema, setShowSchema] = useState(false);
  const [schemaResult, setSchemaResult] = useState<SQLResult | null>(null);
  const [feedback, setFeedback] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackModel, setFeedbackModel] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [hintsShown, setHintsShown] = useState(0);

  // Filter: only coding questions (exclude conceptual "What is...", "Explain..." questions)
  const CONCEPTUAL_PATTERN = /^(What is|What are|What's the|Explain|Describe|How does|How do|Name |List |Define|Why )/i;
  const codingQuestions = useMemo(
    () => allQuestions.filter(q => q.source !== 'quickDrill' && !CONCEPTUAL_PATTERN.test(q.question)),
    [allQuestions],
  );

  const filtered = useMemo(() => {
    let result = codingQuestions;
    if (subject !== 'all') result = result.filter(q => q.subject === subject);
    if (topic !== 'all') result = result.filter(q => (q.topic || 'Other') === topic);
    return result;
  }, [codingQuestions, subject, topic]);

  // Available topics (from coding questions only)
  const availableTopics = useMemo(() => {
    let qs = codingQuestions;
    if (subject !== 'all') qs = qs.filter(q => q.subject === subject);
    const map = new Map<string, number>();
    for (const q of qs) map.set(q.topic || 'Other', (map.get(q.topic || 'Other') || 0) + 1);
    const canonical = subject === 'all'
      ? [...getTopicsForSubject('sql'), ...getTopicsForSubject('python')]
      : getTopicsForSubject(subject);
    const sorted: { name: string; count: number }[] = [];
    for (const ct of canonical) {
      if (map.has(ct)) { sorted.push({ name: ct, count: map.get(ct)! }); map.delete(ct); }
    }
    for (const [name, count] of map) sorted.push({ name, count });
    return sorted;
  }, [codingQuestions, subject]);

  // Current question
  const [currentUid, setCurrentUid] = useState<string | null>(null);
  const current = useMemo(() => filtered.find(q => q.uid === currentUid) ?? filtered[0] ?? null, [filtered, currentUid]);

  // Auto-select first question when filter changes
  useEffect(() => {
    if (filtered.length > 0 && (!currentUid || !filtered.find(q => q.uid === currentUid))) {
      setCurrentUid(filtered[0].uid);
    }
  }, [filtered, currentUid]);

  // Init runtime when question subject changes
  useEffect(() => {
    if (current) runtime.initFor(current.subject);
  }, [current?.subject]);

  // Reset editor when question changes
  useEffect(() => {
    if (!current) return;
    setCode(current.subject === 'python' ? '# Write your Python solution here\n' : '-- Write your SQL query here\n');
    setSqlResult(null);
    setPythonOutput('');
    setShowAnswer(false);
    setFeedback('');
    setFeedbackModel(null);
    setHintsShown(0);
  }, [current?.uid]);

  const handleSubject = (s: SubjectFilter) => {
    setSubject(s);
    setTopic('all');
    const p = new URLSearchParams();
    if (s !== 'all') p.set('subject', s);
    setSearchParams(p, { replace: true });
  };

  const handleTopic = (t: string) => {
    setTopic(t);
    const p = new URLSearchParams();
    if (subject !== 'all') p.set('subject', subject);
    if (t !== 'all') p.set('topic', t);
    setSearchParams(p, { replace: true });
  };

  const runCode = useCallback(async () => {
    if (!current) return;
    setIsRunning(true);
    setSqlResult(null);
    setPythonOutput('');
    if (current.subject === 'python') {
      const result = await runtime.runPython(code);
      setPythonOutput(result);
    } else {
      const result = await runtime.runSQL(code);
      setSqlResult(result);
    }
    setIsRunning(false);
  }, [current, code, runtime]);

  const loadSchema = useCallback(async () => {
    if (showSchema && schemaResult) { setShowSchema(false); return; }
    const result = await runtime.getSchema();
    setSchemaResult(result);
    setShowSchema(true);
  }, [runtime, showSchema, schemaResult]);

  const checkAnswer = useCallback(async () => {
    if (!current) return;
    setFeedbackLoading(true);
    setFeedback('');
    try {
      const result = await generateFeedback(current.question, code, current.answer, current.pseudoCode);
      setFeedback(result);
      setFeedbackModel(getLastUsedModel());
    } catch (e: any) {
      setFeedback(`Error: ${e.message}`);
    } finally {
      setFeedbackLoading(false);
    }
  }, [current, code]);

  const markComplete = useCallback(() => {
    if (!current) return;
    updateProgress(current.progressKey, current.progressId, true);
  }, [current, updateProgress]);

  if (loadingQ) return <div className="flex justify-center pt-16"><Spinner size="lg" /></div>;
  if (errorQ) return <div className="text-red-500 text-center pt-16">{errorQ}</div>;

  const lang = current?.subject === 'python' ? 'python' : 'sql';

  return (
    <div className="flex h-[calc(100vh-80px)] md:h-[calc(100vh-56px)]">
      {/* Sidebar */}
      {sidebarOpen && (
        <div className="w-64 shrink-0 border-r border-gray-200 dark:border-gray-700 hidden md:block">
          <DeepSidebar questions={filtered} currentUid={current?.uid ?? null} onSelect={setCurrentUid} />
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Filter bar */}
        <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center gap-2 overflow-x-auto shrink-0">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hidden md:block">
            {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
          </button>
          <Code2 size={18} className="text-purple-500 shrink-0" />
          <span className="font-bold text-sm text-gray-900 dark:text-white shrink-0">Deep Mode</span>

          {/* Subject pills */}
          {(['all', 'sql', 'python'] as SubjectFilter[]).map(s => (
            <button
              key={s}
              onClick={() => handleSubject(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 ${
                subject === s ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
              }`}
            >
              {s === 'all' ? 'All' : s.toUpperCase()}
            </button>
          ))}

          {/* Topic dropdown */}
          <select
            value={topic}
            onChange={e => handleTopic(e.target.value)}
            className="px-2 py-1 rounded-lg text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-0 outline-none"
          >
            <option value="all">All Topics ({filtered.length})</option>
            {availableTopics.map(t => (
              <option key={t.name} value={t.name}>{t.name} ({t.count})</option>
            ))}
          </select>
        </div>

        {!current ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">No questions match your filters.</div>
        ) : (
          <div className="flex-1 flex flex-col overflow-y-auto">
            {/* Question */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={current.difficulty === 'Easy' ? 'success' : current.difficulty === 'Medium' ? 'warning' : 'danger'}>
                  {current.difficulty}
                </Badge>
                {current.topic && <Badge variant="info">{current.topic}</Badge>}
                <span className="text-xs text-gray-400">Q{current.sourceId} | {current.timeEstimate}min</span>
              </div>
              <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{current.question}</p>
            </div>

            {/* Editor */}
            <div className="flex-1 min-h-[200px]">
              {runtime.loading ? (
                <div className="flex items-center justify-center h-full gap-2 text-gray-400">
                  <Spinner size="sm" />
                  <span className="text-sm">Loading {lang} runtime...</span>
                </div>
              ) : (
                <Editor
                  height="100%"
                  language={lang}
                  theme={preferences.darkMode ? 'vs-dark' : 'light'}
                  value={code}
                  onChange={v => setCode(v || '')}
                  options={{ minimap: { enabled: false }, fontSize: 13, lineNumbers: 'on', scrollBeyondLastLine: false, wordWrap: 'on' }}
                />
              )}
            </div>

            {/* Action bar */}
            <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 flex gap-2 shrink-0 flex-wrap">
              <Button variant="primary" size="sm" onClick={runCode} loading={isRunning} disabled={!runtime.ready} icon={<Play size={14} />}>
                Run
              </Button>
              <Button variant="secondary" size="sm" onClick={checkAnswer} loading={feedbackLoading} icon={<Send size={14} />}>
                Check Answer
              </Button>
              {lang === 'sql' && (
                <Button variant="ghost" size="sm" onClick={loadSchema} disabled={!runtime.ready} icon={<Database size={14} />}>
                  {showSchema ? 'Hide Schema' : 'Schema'}
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => setShowAnswer(!showAnswer)} icon={showAnswer ? <EyeOff size={14} /> : <Eye size={14} />}>
                {showAnswer ? 'Hide Solution' : 'Solution'}
              </Button>
              {current.hints && current.hints.length > 0 && hintsShown < current.hints.length && (
                <Button variant="ghost" size="sm" onClick={() => setHintsShown(h => h + 1)} icon={<Lightbulb size={14} />}>
                  Hint ({hintsShown}/{current.hints.length})
                </Button>
              )}
              <div className="flex-1" />
              <Button variant="ghost" size="sm" onClick={markComplete} className="text-green-600 dark:text-green-400">
                Mark Complete
              </Button>
            </div>

            {/* Output panels */}
            <div className="border-t border-gray-200 dark:border-gray-700 max-h-[40vh] overflow-y-auto shrink-0">
              {/* Hints */}
              {hintsShown > 0 && current.hints && (
                <div className="px-4 py-2 bg-amber-50 dark:bg-amber-900/10 border-b border-amber-200 dark:border-amber-800">
                  {current.hints.slice(0, hintsShown).map((hint, i) => (
                    <p key={i} className="text-xs text-amber-700 dark:text-amber-400 mb-1">
                      <Lightbulb size={12} className="inline mr-1" />Hint {i + 1}: {hint}
                    </p>
                  ))}
                </div>
              )}

              {/* Schema */}
              {showSchema && schemaResult && (
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-indigo-50 dark:bg-indigo-900/10">
                  <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-2">Available Tables ({schemaResult.rowCount})</p>
                  <div className="flex flex-wrap gap-1.5">
                    {schemaResult.rows.map((r, i) => (
                      <button
                        key={i}
                        onClick={() => setCode(prev => prev.trimEnd() + (prev.trim().endsWith('--') || prev.trim() === '-- Write your SQL query here' ? ` SELECT * FROM ${r[0]} LIMIT 10;\n` : `\n-- SELECT * FROM ${r[0]} LIMIT 10;\n`))}
                        className="px-2 py-1 text-xs font-mono bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-800 rounded text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                      >
                        {r[0]}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* SQL Table Output */}
              {sqlResult && (
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">
                    Output {sqlResult.error ? '' : `(${sqlResult.rowCount} row${sqlResult.rowCount !== 1 ? 's' : ''})`}
                  </p>
                  {sqlResult.error ? (
                    <pre className="text-xs font-mono text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 p-2 rounded-lg">{sqlResult.error}</pre>
                  ) : sqlResult.columns.length > 0 ? (
                    <div className="overflow-x-auto max-h-48 rounded-lg border border-gray-200 dark:border-gray-700">
                      <table className="w-full text-xs font-mono">
                        <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0">
                          <tr>
                            {sqlResult.columns.map((col, i) => (
                              <th key={i} className="px-3 py-1.5 text-left font-bold text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 whitespace-nowrap">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sqlResult.rows.map((row, ri) => (
                            <tr key={ri} className={ri % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800/50'}>
                              {row.map((cell, ci) => (
                                <td key={ci} className="px-3 py-1 text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-800 whitespace-nowrap">
                                  {cell === null ? <span className="text-gray-400 italic">NULL</span> : String(cell)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg">Query executed successfully (no rows returned)</p>
                  )}
                </div>
              )}

              {/* Python Output */}
              {pythonOutput && (
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Output</p>
                  <pre className="text-xs font-mono whitespace-pre-wrap text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg max-h-32 overflow-y-auto">
                    {pythonOutput}
                  </pre>
                </div>
              )}

              {/* AI Feedback */}
              {(feedback || feedbackLoading) && (
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400">AI Feedback</p>
                    {feedbackModel && (
                      <Badge variant="info" className="text-[10px]">{feedbackModel}</Badge>
                    )}
                  </div>
                  {feedbackLoading ? (
                    <div className="flex items-center gap-2 text-gray-400"><Spinner size="sm" /><span className="text-xs">Analyzing...</span></div>
                  ) : (
                    <pre className="text-xs whitespace-pre-wrap text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/10 p-2 rounded-lg max-h-48 overflow-y-auto">
                      {feedback}
                    </pre>
                  )}
                </div>
              )}

              {/* Solution */}
              {showAnswer && (
                <div className="px-4 py-2">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Solution</p>
                  <pre className="text-xs font-mono whitespace-pre-wrap text-gray-700 dark:text-gray-300 bg-green-50 dark:bg-green-900/10 p-2 rounded-lg max-h-48 overflow-y-auto">
                    {current.answer}
                  </pre>
                  {current.pseudoCode && (
                    <>
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 mt-2">Pseudo Code</p>
                      <pre className="text-xs font-mono whitespace-pre-wrap text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg max-h-32 overflow-y-auto">
                        {current.pseudoCode}
                      </pre>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
