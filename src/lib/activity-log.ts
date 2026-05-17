export type ActivityKind =
  | 'profile_created'
  | 'facility_bookmarked'
  | 'facility_unbookmarked'
  | 'event_bookmarked'
  | 'event_unbookmarked'
  | 'exercise_bookmarked'
  | 'exercise_unbookmarked'

export interface ActivityEntry {
  id: string
  kind: ActivityKind
  label: string       // human-readable: e.g. "Eryaman Spor Merkezi favorilere eklendi"
  isoDate: string     // ISO 8601
}

const KEY = 'uyum:activity-log'
const MAX = 50        // keep last 50 entries

export function logActivity(kind: ActivityKind, label: string): void {
  const entry: ActivityEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    kind,
    label,
    isoDate: new Date().toISOString(),
  }
  try {
    const raw = localStorage.getItem(KEY)
    const existing: ActivityEntry[] = raw ? JSON.parse(raw) : []
    const updated = [entry, ...existing].slice(0, MAX)
    localStorage.setItem(KEY, JSON.stringify(updated))
  } catch {
    // localStorage unavailable — silent fail
  }
}

export function loadActivityLog(): ActivityEntry[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as ActivityEntry[]) : []
  } catch {
    return []
  }
}

export function clearActivityLog(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // silent fail
  }
}
