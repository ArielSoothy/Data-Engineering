import { createClient } from '../lib/supabase/client';
import { DEFAULT_SYNC_CODE } from '../config';

const DEVICE_ID_KEY = 'de_prep_device_id';
const LOCAL_UPDATED_KEY = 'de_prep_local_updated';
const SYNC_KEYS = [
  'msInterviewProgress',
  'msInterviewPreferences',
  'quick_drill_progress',
  'quick_drill_fsrs',
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

function markLocalUpdated() {
  localStorage.setItem(LOCAL_UPDATED_KEY, new Date().toISOString());
}

function getLocalUpdatedAt(): string | null {
  return localStorage.getItem(LOCAL_UPDATED_KEY);
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export async function pushProgress(): Promise<void> {
  const supabase = createClient();
  const deviceId = getOrCreateDeviceId();
  const data = gatherLocalData();
  const now = new Date().toISOString();

  const { error } = await supabase
    .from('user_progress')
    .upsert({ device_id: deviceId, data, updated_at: now }, { onConflict: 'device_id' });

  if (error) {
    console.warn('[sync] push failed:', error.message);
  } else {
    localStorage.setItem(LOCAL_UPDATED_KEY, now);
  }
}

export function pushProgressDebounced(): void {
  markLocalUpdated();
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => pushProgress(), 2000);
}

export function flushSync(): void {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
    const deviceId = getOrCreateDeviceId();
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

export async function pullProgress(): Promise<boolean> {
  const supabase = createClient();
  const deviceId = getOrCreateDeviceId();

  const { data: row, error } = await supabase
    .from('user_progress')
    .select('data, updated_at')
    .eq('device_id', deviceId)
    .single();

  if (error || !row) return false;

  // Only apply cloud data if it's newer than local
  const localUpdated = getLocalUpdatedAt();
  const cloudUpdated = row.updated_at as string;

  if (localUpdated && new Date(localUpdated) > new Date(cloudUpdated)) {
    // Local is newer — push local to cloud instead
    await pushProgress();
    return false;
  }

  const cloud = row.data as Record<string, unknown>;
  applyCloudData(cloud);
  localStorage.setItem(LOCAL_UPDATED_KEY, cloudUpdated);
  return true;
}
