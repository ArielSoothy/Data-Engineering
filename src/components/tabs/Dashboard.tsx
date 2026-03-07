import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, ChevronRight, ChevronLeft, Database, Code, Braces,
  CheckCircle, Zap, Flame,
  BookOpen, Timer, Circle, Smartphone, Star, Target
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useDailyPlan } from '../../hooks/useDailyPlan';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { Card, Badge, ProgressBar } from '../ui';
import { STUDY_PHASES } from '../../data/dailyPlan';
import type { CategoryProgress } from '../../context/AppContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { getCategoryProgress, getTotalProgress } = useAppContext();
  const { currentDay, daysRemaining, allPlans, phase, completedTasks, streak, toggleTask } = useDailyPlan();
  const isOnline = useOnlineStatus();
  const [viewDay, setViewDay] = useState<number | null>(null);

  const displayDay = viewDay ?? currentDay;
  const viewingToday = viewDay === null || viewDay === currentDay;
  const viewPlan = allPlans.find(p => p.day === displayDay) ?? null;
  const viewProgress = useMemo(() => {
    if (!viewPlan) return 0;
    const done = viewPlan.tasks.filter(t => completedTasks[t.id]).length;
    return viewPlan.tasks.length > 0 ? Math.round((done / viewPlan.tasks.length) * 100) : 0;
  }, [viewPlan, completedTasks]);

  const categories: { id: keyof CategoryProgress; name: string; icon: React.ReactNode; path: string; color: string }[] = [
    { id: 'sqlBasics', name: 'SQL Basics', icon: <Database size={16} />, path: '/sql-basics', color: 'blue' },
    { id: 'sqlAdvanced', name: 'SQL Advanced', icon: <Database size={16} />, path: '/sql-advanced', color: 'purple' },
    { id: 'pythonBasics', name: 'Python Basics', icon: <Code size={16} />, path: '/python-basics', color: 'green' },
    { id: 'pythonAdvanced', name: 'Python Advanced', icon: <Braces size={16} />, path: '/python-advanced', color: 'green' },
    { id: 'adaptive', name: 'Adaptive', icon: <Zap size={16} />, path: '/adaptive', color: 'yellow' },
  ];

  // Detect weak spots: categories under 40%
  const weakSpots = categories.filter(c => {
    const pct = getCategoryProgress(c.id);
    return pct > 0 && pct < 40;
  });

  // SQL and Python aggregate progress
  const sqlPct = Math.round((getCategoryProgress('sqlBasics') + getCategoryProgress('sqlAdvanced')) / 2);
  const pyPct = Math.round((getCategoryProgress('pythonBasics') + getCategoryProgress('pythonAdvanced')) / 2);

  return (
    <div className="container mx-auto px-4 py-6 pb-36 md:pb-8 max-w-5xl">
      {/* Offline banner */}
      {!isOnline && (
        <div className="mb-4 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-lg text-sm text-center">
          You're offline — Quick Drill and cached content still work.
        </div>
      )}

      {/* Countdown Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              {currentDay >= 1 && currentDay <= 24
                ? `Day ${currentDay} of 24`
                : currentDay < 1
                  ? 'Getting Ready'
                  : 'Interview Time!'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {daysRemaining > 0
                ? `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} to Meta`
                : 'Today is the day!'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {streak > 0 && (
              <div className="flex items-center gap-1.5 text-orange-500">
                <Flame size={20} />
                <span className="font-bold text-lg">{streak}</span>
              </div>
            )}
            {phase && (
              <Badge
                label={phase.name}
                color={phase.color === 'blue' ? 'blue' : phase.color === 'purple' ? 'purple' : phase.color === 'yellow' ? 'yellow' : phase.color === 'red' ? 'red' : 'green'}
              />
            )}
          </div>
        </div>

        {/* Phase progress bar */}
        <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
          {STUDY_PHASES.map((sp, i) => {
            const phaseStart = [1, 8, 15, 22][i];
            const phaseEnd = [7, 14, 21, 24][i];
            const width = ((phaseEnd - phaseStart + 1) / 24) * 100;
            const fill = currentDay >= phaseEnd ? 100 : currentDay >= phaseStart ? ((currentDay - phaseStart + 1) / (phaseEnd - phaseStart + 1)) * 100 : 0;
            const barColors: Record<string, string> = { blue: 'bg-blue-500', purple: 'bg-purple-500', yellow: 'bg-yellow-500', red: 'bg-red-500', green: 'bg-green-500' };
            return (
              <div key={sp.name} className="relative" style={{ width: `${width}%` }}>
                <div className={`absolute inset-0 ${barColors[sp.color]} rounded-sm transition-all`} style={{ width: `${fill}%` }} />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-400">
          {STUDY_PHASES.map(sp => <span key={sp.name}>{sp.name}</span>)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Today's Plan + Quick Launch */}
        <div className="lg:col-span-2 space-y-6">
          {/* Daily Plan with day navigation */}
          <Card>
            {/* Day navigator */}
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => setViewDay(Math.max(1, displayDay - 1))}
                disabled={displayDay <= 1}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="text-center">
                <div className="flex items-center gap-2 justify-center">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Day {displayDay}
                  </h3>
                  {viewingToday && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded">
                      Today
                    </span>
                  )}
                </div>
                {viewPlan && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">{viewPlan.phase} — {viewPlan.title}</p>
                )}
              </div>
              <button
                onClick={() => setViewDay(Math.min(24, displayDay + 1))}
                disabled={displayDay >= 24}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Jump to today */}
            {!viewingToday && currentDay >= 1 && currentDay <= 24 && (
              <button
                onClick={() => setViewDay(null)}
                className="w-full text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 mb-3"
              >
                Jump to today (Day {currentDay})
              </button>
            )}

            {viewPlan ? (
              <>
                <ProgressBar value={viewProgress} color="blue" size="sm" className="mb-4" />
                <div className="space-y-2">
                  {viewPlan.tasks.map(task => (
                    <div
                      key={task.id}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-colors
                        ${completedTasks[task.id]
                          ? 'bg-green-50 dark:bg-green-900/20'
                          : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    >
                      <button className="shrink-0 p-1" onClick={() => toggleTask(task.id)} aria-label={completedTasks[task.id] ? 'Mark incomplete' : 'Mark complete'}>
                        {completedTasks[task.id]
                          ? <CheckCircle size={20} className="text-green-500" />
                          : <Circle size={20} className="text-gray-300 dark:text-gray-600" />}
                      </button>
                      {task.route ? (
                        <button
                          className="flex-1 min-w-0 text-left cursor-pointer"
                          onClick={() => navigate(task.route!)}
                        >
                          <span className={`text-sm ${completedTasks[task.id] ? 'line-through text-gray-400' : 'text-blue-600 dark:text-blue-400 hover:underline'}`}>
                            {task.label}
                          </span>
                          {task.speedTarget && (
                            <span className="block text-xs text-blue-500 dark:text-blue-400 mt-0.5">
                              <Timer size={10} className="inline mr-1" />{task.speedTarget}
                            </span>
                          )}
                        </button>
                      ) : (
                        <div className="flex-1 min-w-0">
                          <span className={`text-sm ${completedTasks[task.id] ? 'line-through text-gray-400' : ''}`}>
                            {task.label}
                          </span>
                          {task.speedTarget && (
                            <span className="block text-xs text-blue-500 dark:text-blue-400 mt-0.5">
                              <Timer size={10} className="inline mr-1" />{task.speedTarget}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {task.mobile && <Smartphone size={14} className="text-gray-400" />}
                        {task.extra && <Star size={14} className="text-yellow-400" />}
                        {task.route && <ChevronRight size={16} className="text-gray-400" />}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-400 flex-wrap">
                  <span className="flex items-center gap-1"><Smartphone size={12} /> Mobile-friendly</span>
                  <span className="flex items-center gap-1"><Star size={12} /> Bonus</span>
                  <span className="flex items-center gap-1"><Timer size={12} /> Speed target</span>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <Calendar size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p className="text-gray-500 dark:text-gray-400">No plan for this day</p>
              </div>
            )}
          </Card>

          {/* Quick Launch */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Quick Launch</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Quick Drill', icon: <BookOpen size={20} />, path: '/quick-drill', color: 'bg-indigo-500' },
                { label: 'Adaptive', icon: <Zap size={20} />, path: '/adaptive', color: 'bg-orange-500' },
                { label: 'Timed Mock', icon: <Timer size={20} />, path: '/timed-assessment', color: 'bg-red-500' },
                { label: 'Trivia', icon: <Target size={20} />, path: '/trivia', color: 'bg-emerald-500' },
              ].map(item => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`${item.color} text-white rounded-xl p-4 flex flex-col items-center gap-2 hover:opacity-90 transition-opacity`}
                >
                  {item.icon}
                  <span className="text-sm font-semibold">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Weekly Heatmap */}
          <Card title="This Week">
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 7 }, (_, i) => {
                const dayNum = currentDay - (new Date().getDay()) + i;
                const dayData = dayNum >= 1 && dayNum <= 24;
                const dayCompleted = dayData && completedTasks[`streak_${dayNum}`];
                const isToday = dayNum === currentDay;
                return (
                  <div
                    key={i}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-medium
                      ${isToday ? 'ring-2 ring-blue-500' : ''}
                      ${dayCompleted ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : dayData ? 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                        : 'bg-gray-50 dark:bg-gray-900 text-gray-300 dark:text-gray-700'}`}
                  >
                    <span>{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]}</span>
                    {dayData && <span className="text-lg font-bold">{dayNum}</span>}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right column: Stats + Weak Spots */}
        <div className="space-y-6">
          {/* Overall Stats */}
          <Card title="Progress">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500 dark:text-gray-400">Overall</span>
                  <span className="font-semibold">{getTotalProgress()}%</span>
                </div>
                <ProgressBar value={getTotalProgress()} color="blue" size="md" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                  <Database size={16} className="mx-auto mb-1 text-blue-500" />
                  <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{sqlPct}%</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">SQL</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                  <Code size={16} className="mx-auto mb-1 text-green-500" />
                  <div className="text-xl font-bold text-green-600 dark:text-green-400">{pyPct}%</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Python</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Weak Spots */}
          {weakSpots.length > 0 && (
            <Card title="Focus Areas">
              <div className="space-y-2">
                {weakSpots.map(ws => {
                  const pct = getCategoryProgress(ws.id);
                  return (
                    <button key={ws.id} onClick={() => navigate(ws.path)} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <div className="text-red-500">{ws.icon}</div>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium">{ws.name}</div>
                        <ProgressBar value={pct} color="red" size="sm" />
                      </div>
                      <span className="text-sm font-semibold text-red-500">{pct}%</span>
                    </button>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Category Progress */}
          <Card title="All Categories">
            <div className="space-y-3">
              {categories.map(cat => {
                const pct = getCategoryProgress(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => navigate(cat.path)}
                    className="w-full flex items-center gap-3 group"
                  >
                    <div className="shrink-0">{cat.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium truncate">{cat.name}</span>
                        <span className="text-gray-500 dark:text-gray-400">{pct}%</span>
                      </div>
                      <ProgressBar
                        value={pct}
                        color={cat.color === 'blue' ? 'blue' : cat.color === 'purple' ? 'purple' : cat.color === 'green' ? 'green' : 'yellow'}
                        size="sm"
                      />
                    </div>
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 dark:group-hover:text-gray-300 transition-colors shrink-0" />
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center">
              <Clock size={16} className="mx-auto mb-1 text-gray-400" />
              <div className="text-lg font-bold">{daysRemaining}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Days Left</div>
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center">
              <Flame size={16} className="mx-auto mb-1 text-orange-400" />
              <div className="text-lg font-bold">{streak}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Day Streak</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
