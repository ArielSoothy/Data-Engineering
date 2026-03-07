import { useState } from 'react';
import QuestionCard from '../../QuestionCard';
import { Button } from '../../ui';
import type { UnifiedQuestion } from '../../../types/studyHub';
import { useStudyProgress } from '../../../hooks/useStudyProgress';

interface Props {
  questions: UnifiedQuestion[];
}

const PAGE_SIZE = 20;

export default function StudyModeView({ questions }: Props) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const { isCompleted, toggleCompletion } = useStudyProgress();

  if (questions.length === 0) {
    return (
      <p className="text-center text-gray-400 dark:text-gray-500 py-12 text-sm">
        No questions match your filters.
      </p>
    );
  }

  const visible = questions.slice(0, visibleCount);

  return (
    <div className="space-y-4">
      {visible.map(q => (
        <QuestionCard
          key={q.uid}
          id={q.sourceId}
          question={q.question}
          answer={q.answer}
          difficulty={q.difficulty}
          timeEstimate={q.timeEstimate}
          pseudoCode={q.pseudoCode}
          category={q.source === 'quickDrill' ? (q.subject === 'python' ? 'pythonBasics' : 'sqlBasics') : q.progressKey}
          completed={isCompleted(q)}
          onToggleCompletion={() => toggleCompletion(q)}
        />
      ))}

      {visibleCount < questions.length && (
        <div className="text-center pt-4">
          <Button
            variant="secondary"
            size="md"
            onClick={() => setVisibleCount(prev => prev + PAGE_SIZE)}
          >
            Show more ({questions.length - visibleCount} remaining)
          </Button>
        </div>
      )}
    </div>
  );
}
