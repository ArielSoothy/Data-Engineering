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

function applyCloudData(cloud: Record<string, unknown>) {
  for (const key of SYNC_KEYS) {
    if (key in cloud) {
      localStorage.setItem(key, JSON.stringify(cloud[key]));
    }
  }
}

/** Check if localStorage already has meaningful progress data */
function hasLocalProgress(): boolean {
  const saved = localStorage.getItem('msInterviewProgress');
  if (!saved) return false;
  try {
    const parsed = JSON.parse(saved);
    // Check if any category has at least one entry
    return Object.values(parsed).some(
      (arr) => Array.isArray(arr) && arr.length > 0
    );
  } catch {
    return false;
  }
}

// --- Push (silent backup) ---

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
  debounceTimer = setTimeout(() => pushProgress(), 3000);
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

// --- Pull (only when localStorage is empty — restores from cloud backup) ---

export async function pullProgress(): Promise<boolean> {
  // If we already have local progress, don't overwrite — localStorage is the source of truth
  if (hasLocalProgress()) return false;

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

  applyCloudData(cloud);
  return true;
}
