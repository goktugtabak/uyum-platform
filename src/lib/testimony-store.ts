import type { Testimony } from '../types'
import seedData from '../data/testimonies.seed.json'

const STORAGE_KEY = 'uyum:testimonies'

export function generateTestimonyId(): string {
  return 't-' + crypto.randomUUID()
}

function loadFromStorage(): Testimony[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Testimony[]
  } catch {
    console.warn('[testimony-store] localStorage parse failed, resetting')
    return []
  }
}

function saveAllToStorage(testimonies: Testimony[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(testimonies))
  } catch {
    console.warn('[testimony-store] localStorage write failed')
  }
}

export function loadTestimonies(facilityId?: string): Testimony[] {
  const seed = seedData as Testimony[]
  const stored = loadFromStorage()

  const storedIds = new Set(stored.map(t => t.id))
  const merged = [
    ...stored,
    ...seed.filter(t => !storedIds.has(t.id)),
  ]

  const sorted = merged.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )

  if (facilityId) return sorted.filter(t => t.facilityId === facilityId)
  return sorted
}

export function saveTestimony(t: Testimony): void {
  const stored = loadFromStorage()
  stored.push(t)
  saveAllToStorage(stored)
}
