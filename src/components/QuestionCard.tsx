import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Clock, Check, Play, MessageSquare, BookOpen } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import type { CategoryProgress } from '../context/AppContext';
import { formatTime } from '../utils/helpers';
import Editor from '@monaco-editor/react';
import { loadPyodide } from 'pyodide';
import type { Database } from 'sql.js';
import initSqlJs from 'sql.js';
import { PracticeChat } from './PracticeChat';
import { Badge, Button, Spinner } from './ui';
import { generateQuestionBreakdown } from '../services/aiService';
import type { QuestionBreakdown } from '../services/aiService';

interface QuestionCardProps {
  id: number;
  question: string;
  answer: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeEstimate: number;
  pseudoCode?: string;
  category: keyof CategoryProgress;
  completed?: boolean;
  onToggleCompletion?: (id: number, completed: boolean) => void;
}

const QuestionCard = ({
  id,
  question,
  answer,
  difficulty,
  timeEstimate,
  pseudoCode,
  category,
  completed = false,
  onToggleCompletion
}: QuestionCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'answer' | 'explain' | 'tryit' | 'practice'>('answer');
  const [breakdown, setBreakdown] = useState<QuestionBreakdown | null>(null);
  const [breakdownLoading, setBreakdownLoading] = useState(false);
  const [breakdownError, setBreakdownError] = useState<string | null>(null);
  const [editorContent, setEditorContent] = useState(pseudoCode || '');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const pyodideRef = useRef<any>(null);
  const sqlRef = useRef<Database | null>(null);
  
  // We'll determine language directly where needed
  
  const { updateProgress } = useAppContext();
  
  // Initialize runtime engines
  useEffect(() => {
    const initRuntime = async () => {
      if (category.includes('python') && !pyodideRef.current) {
        pyodideRef.current = await loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.23.4/full/'
        });
      }
      
      if (category.includes('sql') && !sqlRef.current) {
        try {
          const SQL = await initSqlJs({
            locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.13.0/${file}`
          });
          sqlRef.current = new SQL.Database();
          
          // Load mock database schema and data
          const response = await fetch('./data/mock-db.sql');
          const sqlInit = await response.text();
          
          // Split and execute each statement separately
          const statements = sqlInit.split(';').filter(stmt => stmt.trim());
          for (const stmt of statements) {
            if (stmt.trim()) {
              sqlRef.current.run(stmt + ';');
            }
          }
        } catch (error) {
          console.error('Error initializing SQL database:', error);
          setOutput('Failed to initialize SQL database. Please try again.');
        }
      }
    };
    
    initRuntime();
  }, [category]);
  
  // Run code based on language
  const runCode = async () => {
    setIsRunning(true);
    setOutput('Running...');
    
    try {
      if (category.includes('python') && pyodideRef.current) {
        // Run Python code
        pyodideRef.current.setStdout({ batched: (output: string) => setOutput(prev => prev + output) });
        const result = await pyodideRef.current.runPythonAsync(editorContent);
        if (result !== undefined) {
          setOutput(prev => prev + '\n' + result);
        }
      } 
      else if (category.includes('sql') && sqlRef.current) {
        // Run SQL query
        try {
          const results = sqlRef.current.exec(editorContent);
          if (results.length > 0) {
            const columns = results[0].columns;
            const values = results[0].values;
            let output = columns.join('\t') + '\n';
            output += values.map((row: any[]) => row.join('\t')).join('\n');
            setOutput(output);
          } else {
            setOutput('Query executed successfully. No results to display.');
          }
        } catch (error: any) {
          setOutput('SQL Error: ' + error.message);
        }
      }
      else {
        setOutput('Code execution is not supported for this language yet.');
      }
    } catch (error: any) {
      setOutput('Error: ' + error.message);
    } finally {
      setIsRunning(false);
    }
  };
  
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  const handleTabClick = (tab: 'answer' | 'explain' | 'tryit' | 'practice') => {
    setActiveTab(tab);
  };

  const fetchBreakdown = async () => {
    setBreakdownLoading(true);
    setBreakdownError(null);
    try {
      const result = await generateQuestionBreakdown(question, answer, pseudoCode);
      setBreakdown(result);
    } catch (err: any) {
      setBreakdownError(err?.message ?? 'Failed to generate explanation. Please try again.');
    } finally {
      setBreakdownLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'explain' && !breakdown && !breakdownLoading) {
      fetchBreakdown();
    }
  }, [activeTab]);
  
  const handleToggleCompletion = () => {
    const newCompletedState = !completed;
    
    // Update in parent component if callback provided
    if (onToggleCompletion) {
      onToggleCompletion(id, newCompletedState);
    } else {
      // Otherwise use context directly
      updateProgress(category, id, newCompletedState);
    }
  };
  
  return (
    <div className={`card border border-gray-200 dark:border-gray-700 transition-all duration-200 ${
      expanded ? 'shadow-md' : ''
    } ${
      completed ? 'border-l-4 border-l-green-500 dark:border-l-green-400' : ''
    }`}>
      {/* Question header — click anywhere to expand/collapse */}
      <div
        className="flex justify-between items-start cursor-pointer"
        onClick={toggleExpanded}
      >
        <div className="flex-grow">
          <div className="flex items-center mb-2">
            <Badge
              label={difficulty}
              variant="difficulty"
              difficulty={difficulty}
              size="sm"
              className="mr-2"
            />
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <Clock size={14} className="mr-1" />
              <span>{formatTime(timeEstimate)}</span>
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-1">
            {id}. {question}
          </h3>
        </div>

        {/* Action buttons — stop propagation so clicks don't toggle expand */}
        <div className="flex ml-4 space-x-2" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleCompletion}
            icon={<Check size={18} />}
            aria-label={completed ? "Mark as incomplete" : "Mark as complete"}
            className={`rounded-full p-2 ${
              completed
                ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:bg-opacity-30 dark:text-green-400'
                : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
            }`}
          />

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleExpanded}
            icon={expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            aria-label={expanded ? "Collapse" : "Expand"}
            className="rounded-full p-2 bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
          />
        </div>
      </div>
      
      {/* Expanded content */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleTabClick('answer')}
              className={`rounded-none px-4 py-2 font-medium border-b-2 -mb-px ${
                activeTab === 'answer'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-transparent dark:hover:bg-transparent'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Solution
            </Button>

            {/* Explain tab */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleTabClick('explain')}
              className={`rounded-none px-4 py-2 font-medium border-b-2 -mb-px ${
                activeTab === 'explain'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-transparent dark:hover:bg-transparent'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              icon={<BookOpen size={16} />}
              iconPosition="left"
            >
              Explain
            </Button>

            {/* Try It tab for code execution */}
            {(category.includes('python') || category.includes('sql')) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTabClick('tryit')}
                className={`rounded-none px-4 py-2 font-medium border-b-2 -mb-px ${
                  activeTab === 'tryit'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-transparent dark:hover:bg-transparent'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                icon={<Play size={16} />}
                iconPosition="left"
              >
                Try It
              </Button>
            )}

            {/* Practice tab */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleTabClick('practice')}
              className={`rounded-none px-4 py-2 font-medium border-b-2 -mb-px ${
                activeTab === 'practice'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-transparent dark:hover:bg-transparent'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              icon={<MessageSquare size={16} />}
              iconPosition="left"
            >
              Practice
            </Button>
          </div>
          
          {/* Tab content */}
          <div className="prose dark:prose-invert max-w-none">
            {activeTab === 'answer' && (
              <div className="text-gray-700 dark:text-gray-300">
                {answer}
              </div>
            )}

            {activeTab === 'explain' && (
              <div>
                {breakdownLoading && (
                  <div className="flex flex-col items-center justify-center py-10 gap-3 text-gray-500 dark:text-gray-400">
                    <Spinner size="md" />
                    <span className="text-sm">Generating explanation…</span>
                  </div>
                )}

                {breakdownError && !breakdownLoading && (
                  <div className="flex flex-col items-center gap-3 py-8 text-center">
                    <p className="text-red-500 dark:text-red-400 text-sm">{breakdownError}</p>
                    <Button variant="secondary" size="sm" onClick={() => { setBreakdownError(null); fetchBreakdown(); }}>
                      Retry
                    </Button>
                  </div>
                )}

                {breakdown && !breakdownLoading && (
                  <div className="flex flex-col gap-6">
                    {/* Section 1: Question breakdown */}
                    <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 p-4">
                      <h4 className="text-base font-semibold text-blue-700 dark:text-blue-300 mb-3">
                        📖 What is this question asking?
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                        {breakdown.explanation}
                      </p>
                    </div>

                    {/* Section 2: Step-by-step solution */}
                    <div className="rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/30 p-4">
                      <h4 className="text-base font-semibold text-purple-700 dark:text-purple-300 mb-3">
                        🔢 Step-by-step solution
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap leading-relaxed font-mono">
                        {breakdown.steps}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'tryit' && (
              <div>
                <div className="mb-4">
                  <Editor
                    height="200px"
                    defaultLanguage={category.includes('sql') ? 'sql' : 'python'}
                    theme={localStorage.getItem('msInterviewPreferences')?.includes('"darkMode":true') ? 'vs-dark' : 'light'}
                    value={editorContent}
                    onChange={(value) => setEditorContent(value || '')}
                    options={{
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      lineNumbers: 'on',
                      wordWrap: 'on'
                    }}
                  />
                </div>
                
                <div className="flex">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={runCode}
                    disabled={isRunning || (!pyodideRef.current && !sqlRef.current)}
                    loading={isRunning}
                  >
                    {isRunning ? 'Running...' : 'Run Code'}
                  </Button>
                </div>
                
                {/* Output area */}
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700">
                  <h4 className="text-gray-800 dark:text-gray-200 font-medium mb-2">Output</h4>
                  <pre className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {output}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Practice tab - outside prose container for better mobile layout */}
          {activeTab === 'practice' && (
            <div className="mt-4 -mx-2 md:mx-0">
              <PracticeChat question={question} answer={answer} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionCard;
