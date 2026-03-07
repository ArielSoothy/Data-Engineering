import { ProgressBar } from '../ui';
import type { UnifiedQuestion } from '../../types/studyHub';
import { useStudyProgress } from '../../hooks/useStudyProgress';

interface Props {
  questions: UnifiedQuestion[];
}

export default function StudyHubStats({ questions }: Props) {
  const { getCompletionStats } = useStudyProgress();
  const { completed, total } = getCompletionStats(questions);
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="flex items-center gap-3">
      <ProgressBar value={pct} color="blue" size="sm" className="flex-1" />
      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
        {completed}/{total}
      </span>
    </div>
  );
}
