import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock, ChevronRight, ChevronDown, Database, Code,
  Zap, AlertTriangle,
} from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { Card, ProgressBar } from '../ui';
import { INTERVIEW_DATE } from '../../config';

/* ── Types ─────────────────────────────────────────────────────── */

interface DrillCard {
  id: number;
  cat: string;
  topic: string;
  difficulty: number;
}

interface CardProgress {
  seen: number;
  correct: number;
  wrong: number;
}

type ProgressMap = Record<number, CardProgress>;

/* ── Subject Groups ────────────────────────────────────────────── */

interface SubjectGroup {
  id: string;
  name: string;
  category: 'SQL' | 'Python';
  difficulty: number; // 1=easy, 2=medium, 3=hard
  topics: string[];
}

const SUBJECT_GROUPS: SubjectGroup[] = [
  // SQL — easy to hard
  { id: 'sql-fundamentals', name: 'SQL Fundamentals', category: 'SQL', difficulty: 1, topics: ['SELECT/WHERE', 'Syntax'] },
  { id: 'sql-aggregation', name: 'SQL Aggregation', category: 'SQL', difficulty: 1, topics: ['Aggregation/GROUP BY'] },
  { id: 'sql-joins', name: 'SQL Joins', category: 'SQL', difficulty: 2, topics: ['JOINs', 'NULL Handling'] },
  { id: 'sql-advanced', name: 'SQL Advanced', category: 'SQL', difficulty: 2, topics: ['CTEs/Subqueries', 'Window Functions', 'UNION/Set Ops'] },
  { id: 'sql-postgres', name: 'SQL PostgreSQL', category: 'SQL', difficulty: 2, topics: ['PostgreSQL'] },
  { id: 'sql-engineering', name: 'SQL Data Engineering', category: 'SQL', difficulty: 2, topics: ['Data Engineering Patterns', 'Indexes'] },
  { id: 'sql-patterns', name: 'SQL Interview Patterns', category: 'SQL', difficulty: 1, topics: ['Triggers', 'Traps', 'Concepts'] },
  // Python — easy to hard
  { id: 'py-basics', name: 'Python Basics', category: 'Python', difficulty: 1, topics: ['Syntax', 'Loops/Control Flow', 'Functions'] },
  { id: 'py-collections', name: 'Python Collections', category: 'Python', difficulty: 1, topics: ['Data Structures', 'Lists/Comprehensions', 'Dicts/Counters', 'Sets'] },
  { id: 'py-strings', name: 'Python Strings & Sorting', category: 'Python', difficulty: 2, topics: ['Strings', 'Sorting'] },
  { id: 'py-pandas', name: 'Python Pandas', category: 'Python', difficulty: 2, topics: ['Pandas'] },
  { id: 'py-patterns', name: 'Python Interview Patterns', category: 'Python', difficulty: 1, topics: ['Triggers', 'Traps'] },
];

const DIFF_LABELS: Record<number, string> = { 1: 'Easy', 2: 'Medium', 3: 'Hard' };
const DIFF_COLORS: Record<number, string> = {
  1: 'text-green-500 dark:text-green-400',
  2: 'text-yellow-500 dark:text-yellow-400',
  3: 'text-red-500 dark:text-red-400',
};

/* ── Helpers ───────────────────────────────────────────────────── */

function loadDrillProgress(): ProgressMap {
  try {
    const raw = localStorage.getItem('quick_drill_progress');
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

/* ── Component ─────────────────────────────────────────────────── */

const Dashboard = () => {
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const [cards, setCards] = useState<DrillCard[]>([]);
  const [drillProgress, setDrillProgress] = useState<ProgressMap>(loadDrillProgress);
  const [sortAsc, setSortAsc] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Fetch quick drill cards
  useEffect(() => {
    fetch('/data/quick-drill-cards.json')
      .then(r => r.json())
      .then((data: DrillCard[]) => setCards(data))
      .catch(() => {});
  }, []);

  // Listen for progress changes from Quick Drill
  useEffect(() => {
    const handler = () => setDrillProgress(loadDrillProgress());
    window.addEventListener('storage', handler);
    const interval = setInterval(handler, 5000);
    return () => { window.removeEventListener('storage', handler); clearInterval(interval); };
  }, []);

  const daysRemaining = useMemo(() => {
    const diff = Math.ceil((INTERVIEW_DATE.getTime() - Date.now()) / 86400000);
    return Math.max(0, diff);
  }, []);

  // Compute stats per group
  const groupStats = useMemo(() => {
    const result: Record<string, { total: number; mastered: number; topics: Record<string, { total: number; mastered: number }> }> = {};

    for (const group of SUBJECT_GROUPS) {
      const topicStats: Record<string, { total: number; mastered: number }> = {};
      let groupTotal = 0;
      let groupMastered = 0;

      for (const topicName of group.topics) {
        const topicCards = cards.filter(c => c.cat === group.category && c.topic === topicName);
        const mastered = topicCards.filter(c => {
          const p = drillProgress[c.id];
          return p && p.correct >= 3;
        }).length;
        topicStats[topicName] = { total: topicCards.length, mastered };
        groupTotal += topicCards.length;
        groupMastered += mastered;
      }

      result[group.id] = { total: groupTotal, mastered: groupMastered, topics: topicStats };
    }
    return result;
  }, [cards, drillProgress]);

  // Overall stats
  const overall = useMemo(() => {
    const totalCards = cards.length;
    const totalMastered = Object.values(drillProgress).filter(p => p.correct >= 3).length;
    const sqlCards = cards.filter(c => c.cat === 'SQL');
    const pyCards = cards.filter(c => c.cat === 'Python');
    const sqlMastered = sqlCards.filter(c => { const p = drillProgress[c.id]; return p && p.correct >= 3; }).length;
    const pyMastered = pyCards.filter(c => { const p = drillProgress[c.id]; return p && p.correct >= 3; }).length;
    return {
      total: totalCards,
      mastered: totalMastered,
      pct: totalCards > 0 ? Math.round((totalMastered / totalCards) * 100) : 0,
      sqlTotal: sqlCards.length,
      sqlMastered,
      sqlPct: sqlCards.length > 0 ? Math.round((sqlMastered / sqlCards.length) * 100) : 0,
      pyTotal: pyCards.length,
      pyMastered,
      pyPct: pyCards.length > 0 ? Math.round((pyMastered / pyCards.length) * 100) : 0,
    };
  }, [cards, drillProgress]);

  // Weak areas — groups under 40% mastered (with at least 1 card)
  const weakAreas = useMemo(() => {
    return SUBJECT_GROUPS
      .filter(g => {
        const s = groupStats[g.id];
        return s && s.total > 0 && (s.total > 0 ? (s.mastered / s.total) * 100 : 0) < 40;
      })
      .map(g => {
        const s = groupStats[g.id];
        return { ...g, mastered: s.mastered, total: s.total, pct: Math.round((s.mastered / s.total) * 100) };
      })
      .sort((a, b) => a.pct - b.pct)
      .slice(0, 5);
  }, [groupStats]);

  // Sorted groups
  const sortedGroups = useMemo(() => {
    const sorted = [...SUBJECT_GROUPS];
    if (!sortAsc) sorted.reverse();
    return sorted;
  }, [sortAsc]);

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const navigateToTopic = (category: string, topicName: string) => {
    const subjectParam = category === 'SQL' ? 'sql' : 'python';
    navigate(`/quick?subject=${subjectParam}&topic=${encodeURIComponent(topicName)}`);
  };

  return (
    <div className="container mx-auto px-4 py-6 pb-36 md:pb-8 max-w-5xl">
      {/* Offline banner */}
      {!isOnline && (
        <div className="mb-4 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-lg text-sm text-center">
          You're offline — Quick Drill and cached content still work.
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            DE Prep
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {daysRemaining > 0
              ? `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} to Meta interview`
              : 'Interview day!'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Card padding="none" className="px-4 py-2 text-center rounded-xl">
            <Clock size={14} className="mx-auto mb-0.5 text-gray-400" />
            <div className="text-lg font-bold">{daysRemaining}</div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wider">Days</div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Study Subjects */}
        <div className="lg:col-span-2 space-y-4">
          {/* Section header with sort */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold tracking-[0.15em] text-gray-500 dark:text-gray-400 uppercase">
              Meta Interview Subjects
            </h2>
            <button
              onClick={() => setSortAsc(prev => !prev)}
              className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 font-medium"
            >
              {sortAsc ? 'Easy → Hard' : 'Hard → Easy'}
            </button>
          </div>

          {/* Subject groups */}
          {sortedGroups.map(group => {
            const stats = groupStats[group.id];
            if (!stats || stats.total === 0) return null;
            const pct = Math.round((stats.mastered / stats.total) * 100);
            const isExpanded = expanded.has(group.id);
            const catColor = group.category === 'SQL' ? 'text-blue-500' : 'text-green-500';
            const barColor = group.category === 'SQL' ? 'blue' : 'green';

            return (
              <Card key={group.id} className="!p-0 overflow-hidden">
                {/* Group header — always visible */}
                <button
                  onClick={() => toggleExpand(group.id)}
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className={`shrink-0 ${catColor}`}>
                    {group.category === 'SQL' ? <Database size={18} /> : <Code size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {group.name}
                      </span>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className={`text-[10px] font-bold ${DIFF_COLORS[group.difficulty]}`}>
                          {DIFF_LABELS[group.difficulty]}
                        </span>
                        <span className="text-xs text-gray-400">{stats.mastered}/{stats.total}</span>
                      </div>
                    </div>
                    <ProgressBar value={pct} color={barColor as 'blue' | 'green'} size="sm" />
                  </div>
                  <ChevronDown
                    size={16}
                    className={`shrink-0 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Sub-topics — expanded */}
                {isExpanded && (
                  <div className="border-t border-gray-100 dark:border-gray-700/50">
                    {group.topics.map(topicName => {
                      const ts = stats.topics[topicName];
                      if (!ts || ts.total === 0) return null;
                      const tPct = Math.round((ts.mastered / ts.total) * 100);
                      return (
                        <button
                          key={topicName}
                          onClick={() => navigateToTopic(group.category, topicName)}
                          className="w-full flex items-center gap-3 px-4 py-3 pl-12 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-t border-gray-50 dark:border-gray-800 first:border-t-0"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-sm text-gray-700 dark:text-gray-300">{topicName}</span>
                              <span className="text-xs text-gray-400 ml-2">{ts.mastered}/{ts.total}</span>
                            </div>
                            <ProgressBar
                              value={tPct}
                              color={tPct >= 80 ? 'green' : tPct >= 40 ? 'yellow' : 'red'}
                              size="sm"
                            />
                          </div>
                          <ChevronRight size={14} className="shrink-0 text-gray-300 dark:text-gray-600" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Right: Progress */}
        <div className="space-y-6">
          {/* Overall Quick Mode Progress */}
          <Card title="Quick Mode Progress">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500 dark:text-gray-400">Mastered</span>
                  <span className="font-semibold">{overall.mastered}/{overall.total} ({overall.pct}%)</span>
                </div>
                <ProgressBar value={overall.pct} color="blue" size="md" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                  <Database size={16} className="mx-auto mb-1 text-blue-500" />
                  <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{overall.sqlPct}%</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{overall.sqlMastered}/{overall.sqlTotal} SQL</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                  <Code size={16} className="mx-auto mb-1 text-green-500" />
                  <div className="text-xl font-bold text-green-600 dark:text-green-400">{overall.pyPct}%</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{overall.pyMastered}/{overall.pyTotal} Python</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Weak Areas */}
          {weakAreas.length > 0 && (
            <Card title="Weak Areas">
              <div className="space-y-2">
                {weakAreas.map(area => (
                  <button
                    key={area.id}
                    onClick={() => toggleExpand(area.id)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <AlertTriangle size={14} className="text-amber-500 shrink-0" />
                    <div className="flex-1 text-left min-w-0">
                      <div className="text-sm font-medium truncate">{area.name}</div>
                      <ProgressBar value={area.pct} color="red" size="sm" />
                    </div>
                    <span className="text-xs font-semibold text-amber-500 shrink-0">{area.mastered}/{area.total}</span>
                  </button>
                ))}
              </div>
            </Card>
          )}

          {/* Quick Launch */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/quick')}
              className="bg-amber-500 text-white rounded-xl p-4 flex flex-col items-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Zap size={20} />
              <span className="text-sm font-semibold">Quick Mode</span>
            </button>
            <button
              onClick={() => navigate('/cheat-sheet')}
              className="bg-purple-500 text-white rounded-xl p-4 flex flex-col items-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Code size={20} />
              <span className="text-sm font-semibold">Cheat Sheet</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
