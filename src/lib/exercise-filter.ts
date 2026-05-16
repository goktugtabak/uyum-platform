import type { Exercise, DisabilityType, MobilityLevel } from '../types'

export type DurationBucket = 'short' | 'medium' | 'long' | 'all'

export interface ExerciseFilters {
  disabilityType: DisabilityType | 'all'
  mobilityLevel:  MobilityLevel | 'all'
  duration:       DurationBucket
  language:       'tr' | 'en' | 'all'
}

export const EMPTY_FILTERS: ExerciseFilters = {
  disabilityType: 'all',
  mobilityLevel:  'all',
  duration:       'all',
  language:       'all',
}

function inDurationBucket(seconds: number, bucket: DurationBucket): boolean {
  if (bucket === 'all') return true
  if (bucket === 'short') return seconds <= 600
  if (bucket === 'medium') return seconds > 600 && seconds <= 1200
  return seconds > 1200
}

export function filterExercises(
  filters: ExerciseFilters,
  all: Exercise[],
): Exercise[] {
  const filtered = all.filter(e => {
    if (filters.disabilityType !== 'all' && !e.disabilityTypes.includes(filters.disabilityType)) return false
    if (filters.mobilityLevel  !== 'all' && !e.mobilityLevel.includes(filters.mobilityLevel))   return false
    if (!inDurationBucket(e.duration, filters.duration))                                         return false
    if (filters.language       !== 'all' && e.language !== filters.language)                    return false
    return true
  })

  // A5 — subtitles first, then Turkish, then duration asc
  return filtered.sort((a, b) => {
    if (a.hasSubtitles !== b.hasSubtitles) return a.hasSubtitles ? -1 : 1
    if (a.language !== b.language) {
      if (a.language === 'tr') return -1
      if (b.language === 'tr') return 1
    }
    return a.duration - b.duration
  })
}
