import { useMemo } from 'react';
import { getFromLocalStorage } from '../utils/helpers';

interface CardProgress {
  seen: number;
  correct: number;
  wrong: number;
  lastReviewed?: string;
}

export interface WeakSpot {
  topic: string;
  category: string;
  accuracy: number;
  totalCards: number;
  weakCards: number;
}

export function useWeakSpots(): WeakSpot[] {
  return useMemo(() => {
    const drillProgress = getFromLocalStorage<Record<string, CardProgress>>('quick_drill_progress', {});

    // Group by topic
    const topicStats: Record<string, { cat: string; correct: number; total: number; weak: number }> = {};

    for (const [, prog] of Object.entries(drillProgress)) {
      if (prog.seen === 0) continue;
      // We don't have topic info in progress alone, so we aggregate overall
      const key = 'drill';
      if (!topicStats[key]) topicStats[key] = { cat: 'Quick Drill', correct: 0, total: 0, weak: 0 };
      topicStats[key].total++;
      topicStats[key].correct += prog.correct;
      if (prog.wrong > prog.correct) topicStats[key].weak++;
    }

    return Object.entries(topicStats)
      .map(([topic, stats]) => ({
        topic,
        category: stats.cat,
        accuracy: stats.total > 0 ? Math.round((stats.correct / (stats.correct + stats.total)) * 100) : 0,
        totalCards: stats.total,
        weakCards: stats.weak,
      }))
      .filter(ws => ws.accuracy < 60)
      .sort((a, b) => a.accuracy - b.accuracy);
  }, []);
}
