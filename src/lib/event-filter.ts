import type { SportEvent, UserProfile, DisabilityType } from '../types'

export type DateRange = 'week' | 'month' | 'all'

export interface EventFilters {
  dateRange:      DateRange
  sport:          string | 'all'
  disabilityType: DisabilityType | 'all'
}

export const EMPTY_EVENT_FILTERS: EventFilters = {
  dateRange:      'all',
  sport:          'all',
  disabilityType: 'all',
}

export interface EventGroups {
  upcoming: SportEvent[]
  past:     SportEvent[]
}

const DAY_MS = 86_400_000

function isInDateRange(eventTs: number, now: number, range: DateRange): boolean {
  if (range === 'all') return true
  const diff = eventTs - now
  if (diff < 0) return false
  if (range === 'week')  return diff <= 7  * DAY_MS
  if (range === 'month') return diff <= 30 * DAY_MS
  return true
}

function passesNonDateFilters(e: SportEvent, filters: EventFilters): boolean {
  if (filters.sport !== 'all' && e.sport !== filters.sport) return false
  if (filters.disabilityType !== 'all' && !e.disabilityTypes.includes(filters.disabilityType)) return false
  return true
}

export function filterEvents(
  filters: EventFilters,
  profile: UserProfile | null,
  all: SportEvent[],
  now: number,
): EventGroups {
  const upcoming: SportEvent[] = []
  const past:     SportEvent[] = []

  for (const e of all) {
    if (!passesNonDateFilters(e, filters)) continue

    const ts = new Date(e.date).getTime()
    if (ts >= now) {
      if (isInDateRange(ts, now, filters.dateRange)) upcoming.push(e)
    } else {
      if (filters.dateRange === 'all') past.push(e)
    }
  }

  const profileType = profile?.disabilityType
  upcoming.sort((a, b) => {
    if (profileType) {
      const aMatch = a.disabilityTypes.includes(profileType) ? 0 : 1
      const bMatch = b.disabilityTypes.includes(profileType) ? 0 : 1
      if (aMatch !== bMatch) return aMatch - bMatch
    }
    return new Date(a.date).getTime() - new Date(b.date).getTime()
  })

  past.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return { upcoming, past }
}
