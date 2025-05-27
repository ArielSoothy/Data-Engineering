import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Clock, Check, Play, MessageSquare } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import type { CategoryProgress } from '../context/AppContext';
import { getDifficultyColor, getDifficultyBgColor, formatTime } from '../utils/helpers';
import Editor from '@monaco-editor/react';
import { loadPyodide } from 'pyodide';
import type { Database } from 'sql.js';
import initSqlJs from 'sql.js';
import { PracticeChat } from './PracticeChat';

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
  const [activeTab, setActiveTab] = useState<'answer' | 'tryit' | 'practice'>('answer');
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
            locateFile: (file: string) => `https://sql.js.org/dist/${file}`
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
  
  const handleTabClick = (tab: 'answer' | 'tryit' | 'practice') => {
    setActiveTab(tab);
  };
  
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
      {/* Question header */}
      <div className="flex justify-between items-start">
        <div className="flex-grow">
          <div className="flex items-center mb-2">
            <div className={`text-xs font-medium px-2 py-0.5 rounded-full mr-2 ${
              getDifficultyBgColor(difficulty) + ' ' + getDifficultyColor(difficulty)
            }`}>
              {difficulty}
            </div>
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <Clock size={14} className="mr-1" />
              <span>{formatTime(timeEstimate)}</span>
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-1">
            {id}. {question}
          </h3>
        </div>
        
        {/* Action buttons */}
        <div className="flex ml-4 space-x-2">
          <button
            onClick={handleToggleCompletion}
            className={`p-2 rounded-full ${
              completed
                ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:bg-opacity-30 dark:text-green-400'
                : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
            }`}
            aria-label={completed ? "Mark as incomplete" : "Mark as complete"}
          >
            <Check size={18} />
          </button>
          
          <button
            onClick={toggleExpanded}
            className="p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>
      
      {/* Expanded content */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
            <button
              onClick={() => handleTabClick('answer')}
              className={`px-4 py-2 text-sm font-medium border-b-2 ${
                activeTab === 'answer'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Solution
            </button>
            
            {/* Try It tab for code execution */}
            {(category.includes('python') || category.includes('sql')) && (
              <button
                onClick={() => handleTabClick('tryit')}
                className={`px-4 py-2 text-sm font-medium border-b-2 ${
                  activeTab === 'tryit'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <Play size={16} className="mr-1" />
                  <span>Try It</span>
                </div>
              </button>
            )}

            {/* Practice tab */}
            <button
              onClick={() => handleTabClick('practice')}
              className={`px-4 py-2 text-sm font-medium border-b-2 ${
                activeTab === 'practice'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center">
                <MessageSquare size={16} className="mr-1" />
                <span>Practice</span>
              </div>
            </button>
          </div>
          
          {/* Tab content */}
          <div className="prose dark:prose-invert max-w-none">
            {activeTab === 'answer' && (
              <div className="text-gray-700 dark:text-gray-300">
                {answer}
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
                  <button
                    onClick={runCode}
                    disabled={isRunning || (!pyodideRef.current && !sqlRef.current)}
                    className={`px-4 py-2 text-sm font-medium bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-600 transition-all duration-200 flex items-center ${
                      isRunning || (!pyodideRef.current && !sqlRef.current) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isRunning ? 'Running...' : 'Run Code'}
                    {isRunning && <div className="loader-border ml-2"></div>}
                  </button>
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
