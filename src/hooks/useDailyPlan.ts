import { useMemo } from 'react';
import { dailyPlan, STUDY_PHASES } from '../data/dailyPlan';
import type { DayPlan } from '../data/dailyPlan';
import { INTERVIEW_DATE } from '../config';
import { getFromLocalStorage, saveToLocalStorage } from '../utils/helpers';

const COMPLETION_KEY = 'daily_plan_completion';
const STREAK_KEY = 'daily_plan_streak';

export interface DailyPlanState {
  currentDay: number; // 1-26, or 0 if before start, or 27+ if past
  daysRemaining: number;
  todayPlan: DayPlan | null;
  phase: typeof STUDY_PHASES[number] | null;
  completedTasks: Record<string, boolean>;
  streak: number;
  allPlans: DayPlan[];
  toggleTask: (taskId: string) => void;
  todayProgress: number; // 0-100
}

export function useDailyPlan(): DailyPlanState {
  const now = new Date();
  const startDate = new Date(INTERVIEW_DATE);
  startDate.setDate(startDate.getDate() - 25); // Day 1 = 26 days before interview

  const diffMs = now.getTime() - startDate.getTime();
  const currentDay = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;

  const daysToInterview = Math.ceil((INTERVIEW_DATE.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, daysToInterview);

  const todayPlan = dailyPlan.find(p => p.day === currentDay) ?? null;

  const phase = useMemo(() => {
    if (currentDay < 1) return STUDY_PHASES[0];
    if (currentDay <= 5) return STUDY_PHASES[0];
    if (currentDay <= 12) return STUDY_PHASES[1];
    if (currentDay <= 18) return STUDY_PHASES[2];
    if (currentDay <= 24) return STUDY_PHASES[3];
    return STUDY_PHASES[4];
  }, [currentDay]);

  const completedTasks = getFromLocalStorage<Record<string, boolean>>(COMPLETION_KEY, {});
  const streak = getFromLocalStorage<number>(STREAK_KEY, 0);

  const toggleTask = (taskId: string) => {
    const updated = { ...completedTasks, [taskId]: !completedTasks[taskId] };
    saveToLocalStorage(COMPLETION_KEY, updated);

    // Update streak: check if all non-extra tasks for today are done
    if (todayPlan) {
      const requiredTasks = todayPlan.tasks.filter(t => !t.extra);
      const allDone = requiredTasks.every(t => updated[t.id]);
      if (allDone) {
        const todayKey = `streak_${currentDay}`;
        const streakDays = getFromLocalStorage<Record<string, boolean>>('streak_days', {});
        if (!streakDays[todayKey]) {
          streakDays[todayKey] = true;
          saveToLocalStorage('streak_days', streakDays);
          saveToLocalStorage(STREAK_KEY, streak + 1);
        }
      }
    }

    // Force re-render by dispatching storage event
    window.dispatchEvent(new Event('storage'));
  };

  const todayProgress = useMemo(() => {
    if (!todayPlan) return 0;
    const total = todayPlan.tasks.length;
    const done = todayPlan.tasks.filter(t => completedTasks[t.id]).length;
    return total > 0 ? Math.round((done / total) * 100) : 0;
  }, [todayPlan, completedTasks]);

  return {
    currentDay: Math.max(0, Math.min(currentDay, 27)),
    daysRemaining,
    todayPlan,
    phase,
    completedTasks,
    streak,
    allPlans: dailyPlan,
    toggleTask,
    todayProgress,
  };
}
