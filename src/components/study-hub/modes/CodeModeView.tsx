import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, ChevronLeft, ChevronRight, Send, Eye, EyeOff } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { loadPyodide } from 'pyodide';
import type { Database } from 'sql.js';
import initSqlJs from 'sql.js';
import { Button, Card, Badge, Spinner } from '../../ui';
import { generateFeedback, getLastUsedModel, getLastUsedProvider } from '../../../services/aiService';
import { useAppContext } from '../../../context/AppContext';
import type { UnifiedQuestion } from '../../../types/studyHub';

interface Props {
  questions: UnifiedQuestion[];
}

export default function CodeModeView({ questions }: Props) {
  const { preferences } = useAppContext();
  const [index, setIndex] = useState(0);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackModel, setFeedbackModel] = useState<string | null>(null);

  const pyodideRef = useRef<any>(null);
  const sqlRef = useRef<Database | null>(null);
  const [runtimeReady, setRuntimeReady] = useState(false);

  const q = questions[index] as UnifiedQuestion | undefined;
  const lang = q ? (q.subject === 'python' ? 'python' : 'sql') : 'sql';

  // Init runtimes lazily based on current question's subject
  useEffect(() => {
    if (!q) return;
    let cancelled = false;

    const init = async () => {
      if (q.subject === 'python' && !pyodideRef.current) {
        try {
          pyodideRef.current = await loadPyodide({
            indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.23.4/full/',
          });
          if (!cancelled) setRuntimeReady(true);
        } catch (e) {
          console.error('Pyodide init failed:', e);
        }
      } else if (q.subject === 'sql' && !sqlRef.current) {
        try {
          const SQL = await initSqlJs({
            locateFile: (file: string) =>
              file.endsWith('.wasm')
                ? 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.13.0/sql-wasm.wasm'
                : `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.13.0/${file}`,
          });
          sqlRef.current = new SQL.Database();
          const res = await fetch('./data/mock-db.sql');
          const sqlInit = await res.text();
          for (const stmt of sqlInit.split(';').filter(s => s.trim())) {
            sqlRef.current.run(stmt + ';');
          }
          if (!cancelled) setRuntimeReady(true);
        } catch (e) {
          console.error('sql.js init failed:', e);
        }
      } else {
        if (!cancelled) setRuntimeReady(true);
      }
    };

    init();
    return () => { cancelled = true; };
  }, [q?.subject]);

  // Reset state when changing question
  useEffect(() => {
    setCode(q?.pseudoCode || '');
    setOutput('');
    setShowAnswer(false);
    setFeedback('');
    setFeedbackModel(null);
  }, [index, q?.uid]);

  const runCode = useCallback(async () => {
    if (!q) return;
    setIsRunning(true);
    setOutput('Running...');
    try {
      if (q.subject === 'python' && pyodideRef.current) {
        let out = '';
        pyodideRef.current.setStdout({ batched: (s: string) => { out += s; } });
        const result = await pyodideRef.current.runPythonAsync(code);
        if (result !== undefined) out += '\n' + result;
        setOutput(out || 'No output');
      } else if (q.subject === 'sql' && sqlRef.current) {
        const results = sqlRef.current.exec(code);
        if (results.length > 0) {
          const cols = results[0].columns.join('\t');
          const rows = results[0].values.map((r: any[]) => r.join('\t')).join('\n');
          setOutput(cols + '\n' + rows);
        } else {
          setOutput('Query ran successfully. No results.');
        }
      }
    } catch (e: any) {
      setOutput('Error: ' + e.message);
    } finally {
      setIsRunning(false);
    }
  }, [q, code]);

  const checkAnswer = useCallback(async () => {
    if (!q || !code.trim()) return;
    setFeedbackLoading(true);
    try {
      const result = await generateFeedback(q.question, code, q.answer, q.pseudoCode);
      setFeedback(result);
      setFeedbackModel(getLastUsedModel() || getLastUsedProvider());
    } catch {
      setFeedback('Failed to get feedback.');
    } finally {
      setFeedbackLoading(false);
    }
  }, [q, code]);

  if (questions.length === 0) {
    return (
      <p className="text-center text-gray-400 dark:text-gray-500 py-12 text-sm">
        No questions match your filters.
      </p>
    );
  }

  if (!q) return null;

  return (
    <div className="space-y-4">
      {/* Question header + navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIndex(i => Math.max(0, i - 1))}
          disabled={index === 0}
          icon={<ChevronLeft size={16} />}
        >
          Prev
        </Button>
        <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
          {index + 1} / {questions.length}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIndex(i => Math.min(questions.length - 1, i + 1))}
          disabled={index === questions.length - 1}
          icon={<ChevronRight size={16} />}
          iconPosition="right"
        >
          Next
        </Button>
      </div>

      {/* Question */}
      <Card padding="md">
        <div className="flex items-center gap-2 mb-2">
          <Badge label={q.difficulty} variant="difficulty" difficulty={q.difficulty} size="sm" />
          <Badge label={q.subject.toUpperCase()} color={q.subject === 'python' ? 'blue' : 'green'} size="sm" />
        </div>
        <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">{q.question}</p>
      </Card>

      {/* Editor */}
      <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        {!runtimeReady ? (
          <div className="flex items-center justify-center h-[200px] bg-gray-50 dark:bg-gray-900 gap-2">
            <Spinner size="sm" />
            <span className="text-xs text-gray-400">Loading {lang} runtime...</span>
          </div>
        ) : (
          <Editor
            height="200px"
            defaultLanguage={lang}
            theme={preferences.darkMode ? 'vs-dark' : 'light'}
            value={code}
            onChange={v => setCode(v || '')}
            options={{ minimap: { enabled: false }, scrollBeyondLastLine: false, lineNumbers: 'on', wordWrap: 'on' }}
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="primary" size="md" onClick={runCode} disabled={isRunning || !runtimeReady} loading={isRunning} icon={<Play size={14} />}>
          Run
        </Button>
        <Button variant="secondary" size="md" onClick={checkAnswer} disabled={feedbackLoading || !code.trim()} loading={feedbackLoading} icon={<Send size={14} />}>
          Check
        </Button>
        <Button
          variant="ghost"
          size="md"
          onClick={() => setShowAnswer(a => !a)}
          icon={showAnswer ? <EyeOff size={14} /> : <Eye size={14} />}
        >
          {showAnswer ? 'Hide' : 'Answer'}
        </Button>
      </div>

      {/* Output */}
      {output && (
        <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">Output</p>
          <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">{output}</pre>
        </div>
      )}

      {/* AI Feedback */}
      {feedback && (
        <Card padding="md" className="!bg-blue-50 dark:!bg-blue-950/30 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">AI Feedback</span>
            {feedbackModel && <Badge label={`via ${feedbackModel}`} color="blue" size="sm" className="ml-auto" />}
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{feedback}</p>
        </Card>
      )}

      {/* Answer reveal */}
      {showAnswer && (
        <Card padding="md" className="!bg-green-50 dark:!bg-green-950/30 border border-green-200 dark:border-green-800">
          <p className="text-[10px] font-bold tracking-widest text-green-500 uppercase mb-1">Answer</p>
          <pre className="text-xs text-green-700 dark:text-green-300 whitespace-pre-wrap font-mono">{q.answer}</pre>
        </Card>
      )}
    </div>
  );
}
