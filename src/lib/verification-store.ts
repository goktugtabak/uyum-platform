import type { VerificationEntry } from '../types'
import seedData from '../data/verifications.seed.json'

const STORAGE_KEY = 'uyum:verifications'
const ANON_ID_KEY = 'uyum:anon-id'

export function getOrCreateAnonId(): string {
  if (typeof window === 'undefined') return 'anon-ssr'
  try {
    const existing = localStorage.getItem(ANON_ID_KEY)
    if (existing) return existing
    const id = 'anon-' + crypto.randomUUID()
    localStorage.setItem(ANON_ID_KEY, id)
    return id
  } catch {
    return 'anon-fallback'
  }
}

export function generateVerificationId(): string {
  return 'v-' + crypto.randomUUID()
}

function loadFromStorage(): VerificationEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as VerificationEntry[]
  } catch {
    console.warn('[verification-store] localStorage parse failed, resetting')
    return []
  }
}

function saveAllToStorage(entries: VerificationEntry[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch {
    console.warn('[verification-store] localStorage write failed')
  }
}

export function loadVerifications(facilityId?: string): VerificationEntry[] {
  const seed = seedData as VerificationEntry[]
  const stored = loadFromStorage()

  const storedIds = new Set(stored.map(v => v.id))
  const merged = [
    ...stored,
    ...seed.filter(v => !storedIds.has(v.id)),
  ]

  const sorted = merged.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )

  if (facilityId) return sorted.filter(v => v.facilityId === facilityId)
  return sorted
}

export function saveVerification(entry: VerificationEntry): void {
  const stored = loadFromStorage()
  // Dedupe: one vote per (userId, facilityId, dimension, disabilityType) tuple
  const filtered = stored.filter(
    v =>
      !(
        v.userId === entry.userId &&
        v.facilityId === entry.facilityId &&
        v.dimension === entry.dimension &&
        v.disabilityType === entry.disabilityType
      ),
  )
  filtered.push(entry)
  saveAllToStorage(filtered)
}

export function getUserVoteFor(
  facilityId: string,
  dimension: VerificationEntry['dimension'],
  disabilityType: VerificationEntry['disabilityType'],
  userId: string,
): VerificationEntry['vote'] | null {
  const all = loadFromStorage()
  const match = all.find(
    v =>
      v.facilityId === facilityId &&
      v.dimension === dimension &&
      v.disabilityType === disabilityType &&
      v.userId === userId,
  )
  return match?.vote ?? null
}
