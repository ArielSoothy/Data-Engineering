import { createClient } from '../lib/supabase/client';

const DEVICE_ID_KEY = 'de_prep_device_id';
const SYNC_KEYS = [
  'msInterviewProgress',
  'msInterviewPreferences',
  'quick_drill_progress',
  'daily_plan_completion',
  'daily_plan_streak',
];

export function getSyncCode(): string | null {
  return localStorage.getItem(DEVICE_ID_KEY);
}

export function setSyncCode(code: string) {
  localStorage.setItem(DEVICE_ID_KEY, code.trim().toLowerCase());
}

function getOrCreateDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
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

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export async function pushProgress(): Promise<void> {
  const supabase = createClient();
  const deviceId = getOrCreateDeviceId();
  const data = gatherLocalData();

  const { error } = await supabase
    .from('user_progress')
    .upsert({ device_id: deviceId, data, updated_at: new Date().toISOString() }, { onConflict: 'device_id' });

  if (error) console.warn('[sync] push failed:', error.message);
}

export function pushProgressDebounced(): void {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => pushProgress(), 2000);
}

export async function pullProgress(): Promise<boolean> {
  const supabase = createClient();
  const deviceId = getOrCreateDeviceId();

  const { data: row, error } = await supabase
    .from('user_progress')
    .select('data, updated_at')
    .eq('device_id', deviceId)
    .single();

  if (error || !row) return false;

  const cloud = row.data as Record<string, unknown>;
  applyCloudData(cloud);
  return true;
}
