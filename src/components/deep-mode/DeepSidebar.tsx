import { useMemo } from 'react';
import { CheckCircle, Circle } from 'lucide-react';
import { Badge } from '../ui';
import { useAppContext } from '../../context/AppContext';
import type { UnifiedQuestion } from '../../types/studyHub';

interface Props {
  questions: UnifiedQuestion[];
  currentUid: string | null;
  onSelect: (uid: string) => void;
}

const SOURCE_SHORT: Record<string, string> = {
  sqlBasics: 'Basics',
  sqlAdvanced: 'Adv',
  pythonBasics: 'Basics',
  pythonAdvanced: 'Adv',
  metaOfficial: 'Meta',
};

export default function DeepSidebar({ questions, currentUid, onSelect }: Props) {
  const { progress } = useAppContext();

  // Group questions by topic, sort numerically, detect duplicate sourceIds
  const grouped = useMemo(() => {
    const map = new Map<string, UnifiedQuestion[]>();
    for (const q of questions) {
      const t = q.topic || 'Other';
      if (!map.has(t)) map.set(t, []);
      map.get(t)!.push(q);
    }
    // Sort each group by sourceId ascending
    for (const [, qs] of map) {
      qs.sort((a, b) => a.sourceId - b.sourceId);
    }
    // Sort topic groups alphabetically
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [questions]);

  // Build set of sourceIds that appear more than once within their topic group
  const needsSourceLabel = useMemo(() => {
    const dupes = new Set<string>();
    for (const [, qs] of grouped) {
      const seen = new Map<number, number>();
      for (const q of qs) seen.set(q.sourceId, (seen.get(q.sourceId) || 0) + 1);
      for (const q of qs) {
        if ((seen.get(q.sourceId) || 0) > 1) dupes.add(q.uid);
      }
    }
    return dupes;
  }, [grouped]);

  const isCompleted = (q: UnifiedQuestion): boolean => {
    const cat = progress[q.progressKey] ?? [];
    return cat.some(p => p.id === q.progressId && p.completed);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-3">
        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
          Questions ({questions.length})
        </p>
        {grouped.map(([topic, qs]) => (
          <div key={topic} className="mb-4">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 px-2">{topic}</p>
            {qs.map(q => {
              const done = isCompleted(q);
              const active = q.uid === currentUid;
              return (
                <button
                  key={q.uid}
                  onClick={() => onSelect(q.uid)}
                  className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center gap-2 transition-colors mb-0.5 ${
                    active
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {done
                    ? <CheckCircle size={14} className="text-green-500 shrink-0" />
                    : <Circle size={14} className="text-gray-300 dark:text-gray-600 shrink-0" />
                  }
                  <span className="truncate flex-1">
                    Q{q.sourceId}
                    {needsSourceLabel.has(q.uid) && (
                      <span className="text-gray-400 dark:text-gray-500 ml-1">
                        · {SOURCE_SHORT[q.source] || q.source}
                      </span>
                    )}
                  </span>
                  <Badge variant={q.difficulty === 'Easy' ? 'success' : q.difficulty === 'Medium' ? 'warning' : 'danger'} className="text-[10px] px-1.5 py-0">
                    {q.difficulty[0]}
                  </Badge>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
