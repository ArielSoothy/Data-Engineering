import { useState } from 'react';
import { Search, Filter, SortAsc, SortDesc, RotateCcw, Info } from 'lucide-react';
import QuestionCard from '../QuestionCard';
import useQuestions from '../../hooks/useQuestions';
import { useTimer } from '../../hooks/useTimer';
import { formatTime, DIFFICULTY_ORDER } from '../../utils/helpers';
import { Button, ProgressBar, Spinner } from '../ui';

const CATEGORIES = ['behavioral', 'sql', 'python', 'system_design', 'product_sense'] as const;

const MetaOfficial = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<'id' | 'difficulty' | 'time'>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showCompleted, setShowCompleted] = useState(true);

  const {
    data: questions,
    loading,
    error,
    getQuestionProgress,
    toggleQuestionCompletion
  } = useQuestions('meta-official');

  const timer = useTimer({
    initialDuration: 60,
    onComplete: () => alert('Study session complete!'),
  });

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = filterDifficulty ? q.difficulty === filterDifficulty : true;
    const matchesCategory = filterCategory ? q.category === filterCategory : true;
    const qProgress = getQuestionProgress(q.id);
    const matchesCompletion = showCompleted ? true : !(qProgress && qProgress.completed);
    return matchesSearch && matchesDifficulty && matchesCategory && matchesCompletion;
  });

  const sortedQuestions = [...filteredQuestions].sort((a, b) => {
    if (sortBy === 'id') {
      return sortDirection === 'asc' ? a.id - b.id : b.id - a.id;
    } else if (sortBy === 'difficulty') {
      const aVal = DIFFICULTY_ORDER[a.difficulty] || 0;
      const bVal = DIFFICULTY_ORDER[b.difficulty] || 0;
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    } else {
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

  const totalQuestions = questions.length;
  const completedCount = questions.filter(q => {
    const qProgress = getQuestionProgress(q.id);
    return qProgress && qProgress.completed;
  }).length;
  const completionPercentage = totalQuestions > 0 ? Math.round((completedCount / totalQuestions) * 100) : 0;

  const categoryLabel = (cat: string) =>
    cat.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="container mx-auto px-4 py-8 pb-36 md:pb-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Meta Official Questions</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Questions sourced directly from Meta's official interview materials and rounds.
        </p>
      </div>

      {/* Info banner — where to paste questions */}
      <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <Info size={18} className="text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
        <div className="text-sm text-blue-800 dark:text-blue-300">
          <strong>Paste your questions here:</strong>{' '}
          <code className="bg-blue-100 dark:bg-blue-900/40 px-1.5 py-0.5 rounded text-xs font-mono">
            public/data/meta-official.json
          </code>
          . Each question needs:{' '}
          <code className="bg-blue-100 dark:bg-blue-900/40 px-1 py-0.5 rounded text-xs font-mono">
            id, question, category, difficulty, timeEstimate, answer
          </code>.
          {' '}Categories: {CATEGORIES.join(', ')}.
        </div>
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
            {formatTime(questions.reduce((total, q) => {
              const qProgress = getQuestionProgress(q.id);
              return total + (qProgress && qProgress.completed ? 0 : q.timeEstimate);
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
            {/* Category filter */}
            <div className="relative">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="pl-8 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{categoryLabel(cat)}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <Filter size={16} className="text-gray-400" />
              </div>
            </div>

            {/* Difficulty filter */}
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

            {/* Sort buttons */}
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
                Diff
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
                icon={sortBy === 'time' ? (sortDirection === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />) : undefined}
                iconPosition="right"
              >
                Time
              </Button>
            </div>

            {/* Hide completed toggle */}
            <Button
              variant={showCompleted ? 'secondary' : 'primary'}
              size="sm"
              onClick={() => setShowCompleted(!showCompleted)}
            >
              {showCompleted ? 'Hide Completed' : 'Show All'}
            </Button>
          </div>
        </div>

        <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          Showing {sortedQuestions.length} of {totalQuestions} questions
        </div>
      </div>

      {/* Questions list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="card bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-center py-8">
          {error}
        </div>
      ) : totalQuestions === 0 ? (
        <div className="card text-center py-12">
          <div className="text-gray-500 dark:text-gray-400 mb-2 text-lg font-medium">No questions yet</div>
          <p className="text-sm text-gray-400 dark:text-gray-500 max-w-md mx-auto">
            Open <code className="bg-gray-100 dark:bg-gray-700 px-1.5 rounded font-mono text-xs">public/data/meta-official.json</code> and
            replace the template entry with your real Meta interview questions.
          </p>
        </div>
      ) : sortedQuestions.length === 0 ? (
        <div className="card text-center py-8 text-gray-500 dark:text-gray-400">
          No questions match your filters.
        </div>
      ) : (
        <div className="space-y-4">
          {sortedQuestions.map(q => {
            const qProgress = getQuestionProgress(q.id);
            return (
              <QuestionCard
                key={q.id}
                id={q.id}
                question={q.question}
                answer={q.answer}
                difficulty={q.difficulty}
                timeEstimate={q.timeEstimate}
                pseudoCode={q.pseudoCode}
                category="metaOfficial"
                completed={qProgress?.completed}
                onToggleCompletion={toggleQuestionCompletion}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MetaOfficial;
