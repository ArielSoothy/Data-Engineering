import { Suspense, lazy } from 'react';
import { Spinner } from '../ui';
import { useUnifiedQuestions } from '../../hooks/useUnifiedQuestions';
import { useStudyHub } from '../../hooks/useStudyHub';
import StudyHubFilters from './StudyHubFilters';
import StudyHubStats from './StudyHubStats';

const StudyModeView = lazy(() => import('./modes/StudyModeView'));
const FlashcardModeView = lazy(() => import('./modes/FlashcardModeView'));
const QuizModeView = lazy(() => import('./modes/QuizModeView'));
const CodeModeView = lazy(() => import('./modes/CodeModeView'));
const AdaptiveModeView = lazy(() => import('./modes/AdaptiveModeView'));

const ModeLoader = () => (
  <div className="flex items-center justify-center py-16">
    <Spinner size="md" />
  </div>
);

export default function StudyHub() {
  const { questions, loading, error } = useUnifiedQuestions();
  const { filters, setFilters, filteredQuestions } = useStudyHub(questions);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-sm text-blue-600 dark:text-blue-400 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  const renderMode = () => {
    switch (filters.mode) {
      case 'study':
        return <StudyModeView questions={filteredQuestions} />;
      case 'flashcard':
        return <FlashcardModeView questions={filteredQuestions} />;
      case 'quiz':
        return <QuizModeView questions={filteredQuestions} />;
      case 'code':
        return <CodeModeView questions={filteredQuestions} />;
      case 'adaptive':
        return <AdaptiveModeView filters={filters} />;
      default:
        return <StudyModeView questions={filteredQuestions} />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pt-6 pb-32">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50 mb-1">
          Study Hub
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {questions.length} questions &middot; SQL &amp; Python &middot; All modes in one place
        </p>
      </div>

      {/* Filters */}
      <div className="mb-4">
        <StudyHubFilters
          filters={filters}
          onChange={setFilters}
          questionCount={filteredQuestions.length}
        />
      </div>

      {/* Progress */}
      {filters.mode !== 'adaptive' && (
        <div className="mb-6">
          <StudyHubStats questions={filteredQuestions} />
        </div>
      )}

      {/* Mode view */}
      <Suspense fallback={<ModeLoader />}>
        {renderMode()}
      </Suspense>
    </div>
  );
}
