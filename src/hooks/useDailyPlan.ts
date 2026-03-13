import { useState, useMemo, useCallback } from 'react';
import { dailyPlan, STUDY_PHASES } from '../data/dailyPlan';
import type { DayPlan } from '../data/dailyPlan';
import { INTERVIEW_DATE } from '../config';
import { getFromLocalStorage, saveToLocalStorage } from '../utils/helpers';
import { pushProgressDebounced } from '../services/progressSync';

const COMPLETION_KEY = 'daily_plan_completion';
const STREAK_KEY = 'daily_plan_streak';
const STREAK_DAYS_KEY = 'streak_days';

export interface DailyPlanState {
  currentDay: number; // 1-24, or 0 if before start, or 25+ if past
  daysRemaining: number;
  todayPlan: DayPlan | null;
  phase: typeof STUDY_PHASES[number] | null;
  completedTasks: Record<string, boolean>;
  streakDays: Record<string, boolean>;
  streak: number;
  allPlans: DayPlan[];
  toggleTask: (taskId: string) => void;
  todayProgress: number; // 0-100
}

export function useDailyPlan(): DailyPlanState {
  const now = new Date();
  const startDate = new Date(INTERVIEW_DATE);
  startDate.setDate(startDate.getDate() - 23); // Day 1 = 24 days before interview

  const diffMs = now.getTime() - startDate.getTime();
  const currentDay = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;

  const daysToInterview = Math.ceil((INTERVIEW_DATE.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, daysToInterview);

  const todayPlan = dailyPlan.find(p => p.day === currentDay) ?? null;

  const phase = useMemo(() => {
    if (currentDay < 1) return STUDY_PHASES[0];
    if (currentDay <= 7) return STUDY_PHASES[0];
    if (currentDay <= 14) return STUDY_PHASES[1];
    if (currentDay <= 21) return STUDY_PHASES[2];
    return STUDY_PHASES[3];
  }, [currentDay]);

  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>(
    () => getFromLocalStorage<Record<string, boolean>>(COMPLETION_KEY, {})
  );
  const [streak, setStreak] = useState<number>(
    () => getFromLocalStorage<number>(STREAK_KEY, 0)
  );
  const [streakDays, setStreakDays] = useState<Record<string, boolean>>(
    () => getFromLocalStorage<Record<string, boolean>>(STREAK_DAYS_KEY, {})
  );

  const toggleTask = useCallback((taskId: string) => {
    setCompletedTasks(prev => {
      const updated = { ...prev, [taskId]: !prev[taskId] };
      saveToLocalStorage(COMPLETION_KEY, updated);

      // Update streak: check if all non-extra tasks for today are done
      if (todayPlan) {
        const requiredTasks = todayPlan.tasks.filter(t => !t.extra);
        const allDone = requiredTasks.every(t => updated[t.id]);
        if (allDone) {
          const todayKey = `streak_${currentDay}`;
          setStreakDays(prevDays => {
            if (!prevDays[todayKey]) {
              const updatedDays = { ...prevDays, [todayKey]: true };
              saveToLocalStorage(STREAK_DAYS_KEY, updatedDays);
              setStreak(prevStreak => {
                const newStreak = prevStreak + 1;
                saveToLocalStorage(STREAK_KEY, newStreak);
                return newStreak;
              });
              return updatedDays;
            }
            return prevDays;
          });
        }
      }

      pushProgressDebounced();
      return updated;
    });
  }, [todayPlan, currentDay]);

  const todayProgress = useMemo(() => {
    if (!todayPlan) return 0;
    const total = todayPlan.tasks.length;
    const done = todayPlan.tasks.filter(t => completedTasks[t.id]).length;
    return total > 0 ? Math.round((done / total) * 100) : 0;
  }, [todayPlan, completedTasks]);

  return {
    currentDay: Math.max(0, Math.min(currentDay, 25)),
    daysRemaining,
    todayPlan,
    phase,
    completedTasks,
    streakDays,
    streak,
    allPlans: dailyPlan,
    toggleTask,
    todayProgress,
  };
}
