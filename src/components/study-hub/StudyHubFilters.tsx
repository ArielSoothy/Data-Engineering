import { Search, BookOpen, Layers, HelpCircle, Code, Zap } from 'lucide-react';
import type { StudyHubFilters as Filters, Subject, Difficulty, StudyMode } from '../../types/studyHub';

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
  questionCount: number;
}

const SUBJECTS: { value: Subject | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'sql', label: 'SQL' },
  { value: 'python', label: 'Python' },
];

const DIFFICULTIES: { value: Difficulty | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'Easy', label: 'Easy' },
  { value: 'Medium', label: 'Med' },
  { value: 'Hard', label: 'Hard' },
];

const MODES: { value: StudyMode; label: string; icon: React.ReactNode }[] = [
  { value: 'study', label: 'Study', icon: <BookOpen size={14} /> },
  { value: 'flashcard', label: 'Flashcard', icon: <Layers size={14} /> },
  { value: 'quiz', label: 'Quiz', icon: <HelpCircle size={14} /> },
  { value: 'code', label: 'Code', icon: <Code size={14} /> },
  { value: 'adaptive', label: 'Adaptive', icon: <Zap size={14} /> },
];

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap ${
        active
          ? 'bg-blue-600 text-white dark:bg-blue-500'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
      }`}
    >
      {children}
    </button>
  );
}

export default function StudyHubFilters({ filters, onChange, questionCount }: Props) {
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    onChange({ ...filters, [key]: value });

  return (
    <div className="space-y-3">
      {/* Row 1: Subject + Difficulty + Search */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Subject chips */}
        <div className="flex gap-1">
          {SUBJECTS.map(s => (
            <Chip key={s.value} active={filters.subject === s.value} onClick={() => set('subject', s.value)}>
              {s.label}
            </Chip>
          ))}
        </div>

        <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 hidden sm:block" />

        {/* Difficulty chips */}
        <div className="flex gap-1">
          {DIFFICULTIES.map(d => (
            <Chip key={d.value} active={filters.difficulty === d.value} onClick={() => set('difficulty', d.value)}>
              {d.label}
            </Chip>
          ))}
        </div>

        {/* Search */}
        <div className="relative ml-auto">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={filters.search}
            onChange={e => set('search', e.target.value)}
            placeholder="Search..."
            className="pl-8 pr-3 py-1.5 text-xs rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 w-36 sm:w-44 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Row 2: Mode selector */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Mode</span>
        <div className="flex gap-1">
          {MODES.map(m => (
            <Chip key={m.value} active={filters.mode === m.value} onClick={() => set('mode', m.value)}>
              <span className="flex items-center gap-1">
                {m.icon}
                {m.label}
              </span>
            </Chip>
          ))}
        </div>
        <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">
          {questionCount} questions
        </span>
      </div>
    </div>
  );
}
