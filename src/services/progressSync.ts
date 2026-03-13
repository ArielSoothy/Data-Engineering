import { createClient } from '../lib/supabase/client';
import { DEFAULT_SYNC_CODE } from '../config';

const DEVICE_ID_KEY = 'de_prep_device_id';
const SYNC_KEYS = [
  'msInterviewProgress',
  'msInterviewPreferences',
  'quick_drill_progress',
  'quick_drill_fsrs',
  'study_hub_fsrs',
  'daily_plan_completion',
  'daily_plan_streak',
];

function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = DEFAULT_SYNC_CODE;
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

function gatherLocalData(): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  for (const key of SYNC_KEYS) {
    const raw = localStorage.getItem(key);
    if (raw) {
      try { data[key] = JSON.parse(raw); } catch { data[key] = raw; }
    }
  }
  return data;
}

// --- Merge logic: never lose progress from either side ---

interface ProgressEntry {
  id: number;
  completed: boolean;
  lastStudied?: string;
}

/** Merge two question-progress arrays — keep the "most completed" version of each question */
function mergeProgressArrays(local: ProgressEntry[], cloud: ProgressEntry[]): ProgressEntry[] {
  const map = new Map<number, ProgressEntry>();
  for (const entry of cloud) {
    map.set(entry.id, entry);
  }
  for (const entry of local) {
    const existing = map.get(entry.id);
    if (!existing) {
      map.set(entry.id, entry);
    } else if (entry.completed && !existing.completed) {
      // Local says completed, cloud doesn't — keep completed
      map.set(entry.id, entry);
    } else if (!entry.completed && existing.completed) {
      // Cloud says completed — keep it
    } else {
      // Both same completed state — keep most recent
      const localTime = entry.lastStudied ? new Date(entry.lastStudied).getTime() : 0;
      const cloudTime = existing.lastStudied ? new Date(existing.lastStudied).getTime() : 0;
      if (localTime >= cloudTime) map.set(entry.id, entry);
    }
  }
  return Array.from(map.values());
}

/** Merge msInterviewProgress — per-category array merge */
function mergeInterviewProgress(local: Record<string, ProgressEntry[]>, cloud: Record<string, ProgressEntry[]>): Record<string, ProgressEntry[]> {
  const allKeys = new Set([...Object.keys(local), ...Object.keys(cloud)]);
  const merged: Record<string, ProgressEntry[]> = {};
  for (const key of allKeys) {
    merged[key] = mergeProgressArrays(local[key] ?? [], cloud[key] ?? []);
  }
  return merged;
}

/** Merge quick_drill_progress — keep highest correct/seen counts per card */
function mergeDrillProgress(local: Record<string, any>, cloud: Record<string, any>): Record<string, any> {
  const merged = { ...cloud };
  for (const [id, entry] of Object.entries(local)) {
    const existing = merged[id];
    if (!existing) {
      merged[id] = entry;
    } else {
      // Keep the one with more reviews
      const localSeen = (entry as any).seen ?? 0;
      const cloudSeen = (existing as any).seen ?? 0;
      if (localSeen >= cloudSeen) merged[id] = entry;
    }
  }
  return merged;
}

/** Merge daily_plan_completion — union of all completed task IDs */
function mergeDailyCompletion(local: Record<string, boolean>, cloud: Record<string, boolean>): Record<string, boolean> {
  return { ...cloud, ...local };
}

/** Merge cloud + local data, apply to localStorage */
function mergeAndApply(cloud: Record<string, unknown>) {
  for (const key of SYNC_KEYS) {
    if (!(key in cloud)) continue;
    const raw = localStorage.getItem(key);
    let local: any = null;
    if (raw) { try { local = JSON.parse(raw); } catch { /* skip */ } }

    let merged: any;
    if (key === 'msInterviewProgress' && local && typeof local === 'object') {
      merged = mergeInterviewProgress(local, cloud[key] as any);
    } else if (key === 'quick_drill_progress' && local && typeof local === 'object') {
      merged = mergeDrillProgress(local, cloud[key] as any);
    } else if (key === 'daily_plan_completion' && local && typeof local === 'object') {
      merged = mergeDailyCompletion(local, cloud[key] as any);
    } else if (key === 'daily_plan_streak') {
      // Keep the higher streak
      merged = Math.max(Number(local) || 0, Number(cloud[key]) || 0);
    } else if (local == null) {
      // No local data — just take cloud
      merged = cloud[key];
    } else {
      // For preferences and FSRS data — local wins (most recent device is authoritative)
      merged = local;
    }

    localStorage.setItem(key, JSON.stringify(merged));
  }
}

// --- Push (auto, debounced) ---

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export async function pushProgress(): Promise<void> {
  const supabase = createClient();
  const deviceId = getDeviceId();
  const data = gatherLocalData();
  const now = new Date().toISOString();

  const { error } = await supabase
    .from('user_progress')
    .upsert({ device_id: deviceId, data, updated_at: now }, { onConflict: 'device_id' });

  if (error) {
    console.warn('[sync] push failed:', error.message);
  }
}

export function pushProgressDebounced(): void {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => pushProgress(), 2000);
}

export function flushSync(): void {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
    const deviceId = getDeviceId();
    const data = gatherLocalData();
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseKey) {
      const url = `${supabaseUrl}/rest/v1/user_progress?on_conflict=device_id`;
      const body = JSON.stringify({ device_id: deviceId, data, updated_at: new Date().toISOString() });
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'resolution=merge-duplicates',
        },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  }
}

// --- Pull (auto on every load — merges cloud + local, never loses data) ---

export async function pullProgress(): Promise<boolean> {
  const supabase = createClient();
  const deviceId = getDeviceId();

  const { data: row, error } = await supabase
    .from('user_progress')
    .select('data, updated_at')
    .eq('device_id', deviceId)
    .single();

  if (error || !row) return false;

  const cloud = row.data as Record<string, unknown>;
  if (!cloud || Object.keys(cloud).length === 0) return false;

  mergeAndApply(cloud);
  return true;
}
