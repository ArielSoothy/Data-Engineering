import { useState } from 'react';
import { Search, Filter, Clock, SortAsc, SortDesc, RotateCcw } from 'lucide-react';
import QuestionCard from '../QuestionCard';
import useQuestions from '../../hooks/useQuestions';
import { useTimer } from '../../hooks/useTimer';
import { formatTime } from '../../utils/helpers';

const PythonBasics = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('');
  const [sortBy, setSortBy] = useState<'id' | 'difficulty' | 'time'>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showCompleted, setShowCompleted] = useState(true);
  
  const { 
    data: questions, 
    loading, 
    error,
    getQuestionProgress,
    toggleQuestionCompletion
  } = useQuestions('pythonBasics');
  
  // Timer for study session
  const timer = useTimer({
    initialDuration: 60,
    onComplete: () => alert('Study session complete!'),
  });
  
  // Filter and sort questions
  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = filterDifficulty ? q.difficulty === filterDifficulty : true;
    const questionProgress = getQuestionProgress(q.id);
    const matchesCompletion = showCompleted ? true : !(questionProgress && questionProgress.completed);
    
    return matchesSearch && matchesDifficulty && matchesCompletion;
  });
  
  const sortedQuestions = [...filteredQuestions].sort((a, b) => {
    if (sortBy === 'id') {
      return sortDirection === 'asc' ? a.id - b.id : b.id - a.id;
    } else if (sortBy === 'difficulty') {
      const difficultyOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
      const aValue = difficultyOrder[a.difficulty as keyof typeof difficultyOrder] || 0;
      const bValue = difficultyOrder[b.difficulty as keyof typeof difficultyOrder] || 0;
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    } else { // time
      return sortDirection === 'asc' ? a.timeEstimate - b.timeEstimate : b.timeEstimate - a.timeEstimate;
    }
  });
  
  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };
  
  // Calculate completion stats
  const totalQuestions = questions.length;
  const completedCount = questions.filter(q => {
    const progress = getQuestionProgress(q.id);
    return progress && progress.completed;
  }).length;
  const completionPercentage = totalQuestions > 0 
    ? Math.round((completedCount / totalQuestions) * 100) 
    : 0;
  
  return (
    <div className="container mx-auto px-4 py-8 pb-36 md:pb-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Python Basics</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Master core Python concepts and fundamentals for data engineering interviews.
          Complete all questions to build a strong foundation.
        </p>
      </div>
      
      {/* Stats and timer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card flex items-center">
          <div className="w-full">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm text-gray-500 dark:text-gray-400">Completion</div>
              <div className="text-sm font-medium">{completedCount}/{totalQuestions}</div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div 
                className="bg-blue-600 h-2.5 rounded-full dark:bg-blue-500"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Study Timer</div>
          <div className="flex items-center justify-between">
            <div className="text-xl font-bold">
              {formatTime(Math.floor(timer.timeRemaining / 60))}
            </div>
            <div className="flex space-x-2">
              {timer.isRunning ? (
                <button
                  onClick={timer.pause}
                  className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-md dark:bg-yellow-900 dark:bg-opacity-30 dark:text-yellow-300"
                >
                  Pause
                </button>
              ) : timer.isPaused ? (
                <button
                  onClick={timer.resume}
                  className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-md dark:bg-green-900 dark:bg-opacity-30 dark:text-green-300"
                >
                  Resume
                </button>
              ) : (
                <button
                  onClick={timer.start}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-md dark:bg-blue-900 dark:bg-opacity-30 dark:text-blue-300"
                >
                  Start
                </button>
              )}
              <button
                onClick={timer.reset}
                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 mt-2">
            <div 
              className="bg-blue-600 h-1.5 rounded-full dark:bg-blue-500 transition-all duration-1000"
              style={{ width: `${timer.progress}%` }}
            ></div>
          </div>
        </div>
        
        <div className="card flex flex-col justify-center">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Estimated Time</div>
          <div className="text-xl font-bold">
            {formatTime(questions.reduce((total, q) => {
              const progress = getQuestionProgress(q.id);
              return total + (progress && progress.completed ? 0 : q.timeEstimate);
            }, 0))}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Remaining to complete
          </div>
        </div>
      </div>
      
      {/* Filters and search */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="pl-8 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
              >
                <option value="">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <Filter size={16} className="text-gray-400" />
              </div>
            </div>
            
            <div className="flex">
              <button
                onClick={() => toggleSort('id')}
                className={`px-3 py-2 border ${
                  sortBy === 'id' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900 dark:bg-opacity-30 dark:text-blue-300' 
                    : 'border-gray-300 dark:border-gray-600'
                } rounded-l-md flex items-center`}
              >
                <span className="mr-1">#</span>
                {sortBy === 'id' && (
                  sortDirection === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />
                )}
              </button>
              <button
                onClick={() => toggleSort('difficulty')}
                className={`px-3 py-2 border-t border-b ${
                  sortBy === 'difficulty' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900 dark:bg-opacity-30 dark:text-blue-300' 
                    : 'border-gray-300 dark:border-gray-600'
                } flex items-center`}
              >
                <span className="mr-1">Difficulty</span>
                {sortBy === 'difficulty' && (
                  sortDirection === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />
                )}
              </button>
              <button
                onClick={() => toggleSort('time')}
                className={`px-3 py-2 border ${
                  sortBy === 'time' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900 dark:bg-opacity-30 dark:text-blue-300' 
                    : 'border-gray-300 dark:border-gray-600'
                } rounded-r-md flex items-center`}
              >
                <Clock size={16} className="mr-1" />
                {sortBy === 'time' && (
                  sortDirection === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />
                )}
              </button>
            </div>
            
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className={`px-3 py-2 border rounded-md flex items-center ${
                !showCompleted 
                  ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900 dark:bg-opacity-30 dark:text-blue-300' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              {showCompleted ? 'Hide Completed' : 'Show Completed'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Questions list */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 dark:border-gray-600 border-t-blue-600 dark:border-t-blue-400"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading questions...</p>
        </div>
      ) : error ? (
        <div className="card p-6 text-center text-red-600 dark:text-red-400">
          <p>{error}</p>
        </div>
      ) : sortedQuestions.length > 0 ? (
        <div className="space-y-4">
          {sortedQuestions.map(question => (
            <QuestionCard
              key={question.id}
              id={question.id}
              question={question.question}
              answer={question.answer}
              difficulty={question.difficulty}
              timeEstimate={question.timeEstimate}
              pseudoCode={question.pseudoCode}
              category="pythonBasics"
              completed={getQuestionProgress(question.id)?.completed || false}
              onToggleCompletion={toggleQuestionCompletion}
            />
          ))}
        </div>
      ) : (
        <div className="card p-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            No questions match your filters. Try adjusting your search criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default PythonBasics;
