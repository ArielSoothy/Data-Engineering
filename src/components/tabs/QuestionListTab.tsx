import { useState } from 'react';
import { Search, Filter, Clock, SortAsc, SortDesc, RotateCcw } from 'lucide-react';
import QuestionCard from '../QuestionCard';
import useQuestions from '../../hooks/useQuestions';
import { useTimer } from '../../hooks/useTimer';
import { formatTime, DIFFICULTY_ORDER } from '../../utils/helpers';
import { Button, ProgressBar, Spinner, Input, Select } from '../ui';
import type { CategoryProgress } from '../../context/AppContext';

export interface QuestionListConfig {
  category: string;
  categoryKey: keyof CategoryProgress;
  title: string;
  description: string;
}

const DIFFICULTY_OPTIONS = [
  { value: 'Easy', label: 'Easy' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Hard', label: 'Hard' },
];

const QuestionListTab = ({ category, categoryKey, title, description }: QuestionListConfig) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [sortBy, setSortBy] = useState<'id' | 'difficulty' | 'time'>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showCompleted, setShowCompleted] = useState(true);

  const {
    data: questions,
    loading,
    error,
    getQuestionProgress,
    toggleQuestionCompletion,
  } = useQuestions(category);

  const timer = useTimer({
    initialDuration: 60,
    onComplete: () => alert('Study session complete!'),
  });

  const filteredQuestions = questions.filter((q: any) => {
    const matchesSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = filterDifficulty ? q.difficulty === filterDifficulty : true;
    const progress = getQuestionProgress(q.id);
    const matchesCompletion = showCompleted ? true : !(progress && progress.completed);
    return matchesSearch && matchesDifficulty && matchesCompletion;
  });

  const sortedQuestions = [...filteredQuestions].sort((a: any, b: any) => {
    if (sortBy === 'id') {
      return sortDirection === 'asc' ? a.id - b.id : b.id - a.id;
    } else if (sortBy === 'difficulty') {
      const aVal = DIFFICULTY_ORDER[a.difficulty] || 0;
      const bVal = DIFFICULTY_ORDER[b.difficulty] || 0;
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    }
    return sortDirection === 'asc' ? a.timeEstimate - b.timeEstimate : b.timeEstimate - a.timeEstimate;
  });

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const totalQuestions = questions.length;
  const completedCount = questions.filter((q: any) => {
    const p = getQuestionProgress(q.id);
    return p && p.completed;
  }).length;
  const completionPercentage = totalQuestions > 0
    ? Math.round((completedCount / totalQuestions) * 100)
    : 0;

  return (
    <div className="container mx-auto px-4 py-8 pb-36 md:pb-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        <p className="text-gray-600 dark:text-gray-400">{description}</p>
      </div>

      {/* Stats and timer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card flex items-center">
          <div className="w-full">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm text-gray-500 dark:text-gray-400">Completion</div>
              <div className="text-sm font-medium">{completedCount}/{totalQuestions}</div>
            </div>
            <ProgressBar value={completionPercentage} />
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={timer.pause}
                  className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:bg-opacity-30 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900"
                >
                  Pause
                </Button>
              ) : timer.isPaused ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={timer.resume}
                  className="bg-green-100 text-green-800 dark:bg-green-900 dark:bg-opacity-30 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900"
                >
                  Resume
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={timer.start}
                  className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:bg-opacity-30 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900"
                >
                  Start
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={timer.reset}
                icon={<RotateCcw size={16} />}
                aria-label="Reset timer"
                className="p-1"
              />
            </div>
          </div>
          <ProgressBar value={timer.progress} size="sm" className="mt-2" />
        </div>

        <div className="card flex flex-col justify-center">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Estimated Time</div>
          <div className="text-xl font-bold">
            {formatTime(questions.reduce((total: number, q: any) => {
              const p = getQuestionProgress(q.id);
              return total + (p && p.completed ? 0 : q.timeEstimate);
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
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions..."
              icon={<Search size={18} className="text-gray-400" />}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              options={DIFFICULTY_OPTIONS}
              placeholder="All Difficulties"
              icon={<Filter size={16} className="text-gray-400" />}
            />

            <div className="flex">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => toggleSort('id')}
                className={`rounded-r-none border-r-0 ${
                  sortBy === 'id'
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900 dark:bg-opacity-30 dark:text-blue-300'
                    : ''
                }`}
                icon={sortBy === 'id' ? (sortDirection === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />) : undefined}
                iconPosition="right"
              >
                #
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => toggleSort('difficulty')}
                className={`rounded-none border-r-0 ${
                  sortBy === 'difficulty'
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900 dark:bg-opacity-30 dark:text-blue-300'
                    : ''
                }`}
                icon={sortBy === 'difficulty' ? (sortDirection === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />) : undefined}
                iconPosition="right"
              >
                Difficulty
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => toggleSort('time')}
                className={`rounded-l-none ${
                  sortBy === 'time'
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900 dark:bg-opacity-30 dark:text-blue-300'
                    : ''
                }`}
                icon={<Clock size={16} />}
                iconPosition="left"
              >
                {sortBy === 'time' && (sortDirection === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />)}
              </Button>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowCompleted(!showCompleted)}
              className={!showCompleted
                ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900 dark:bg-opacity-30 dark:text-blue-300'
                : ''
              }
            >
              {showCompleted ? 'Hide Completed' : 'Show Completed'}
            </Button>
          </div>
        </div>
      </div>

      {/* Questions list */}
      {loading ? (
        <div className="text-center py-12">
          <Spinner />
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading questions...</p>
        </div>
      ) : error ? (
        <div className="card p-6 text-center text-red-600 dark:text-red-400">
          <p>{error}</p>
        </div>
      ) : sortedQuestions.length > 0 ? (
        <div className="space-y-4">
          {sortedQuestions.map((question: any) => (
            <QuestionCard
              key={question.id}
              id={question.id}
              question={question.question}
              answer={question.answer}
              difficulty={question.difficulty}
              timeEstimate={question.timeEstimate}
              pseudoCode={question.pseudoCode}
              category={categoryKey}
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

export default QuestionListTab;
