import type { Facility, UserProfile, DisabilityType, AccessibilityDimension } from '../types'
import { DIMENSION_KEYS } from './a11y-dimensions'
import type { ScoreColor } from '../hooks/useFacilityScore'

export interface RankedFacility {
  facility:      Facility
  overall:       ScoreColor
  verifiedCount: number
}

const COLOR_RANK: Record<ScoreColor, number> = {
  green:  0,
  yellow: 1,
  gray:   2,
  red:    3,
}

function scoreFacility(facility: Facility, disabilityType: DisabilityType) {
  const counts = { verified: 0, partial: 0, none: 0, unknown: 0 }
  for (const key of DIMENSION_KEYS) {
    const value: AccessibilityDimension = facility.accessibility[key][disabilityType]
    if (value === 'verified') counts.verified++
    else if (value === 'partial') counts.partial++
    else if (value === 'none') counts.none++
    else counts.unknown++
  }

  let overall: ScoreColor
  if (counts.none >= 1) overall = 'red'
  else if (counts.verified >= 4) overall = 'green'
  else if (counts.unknown >= 4) overall = 'gray'
  else overall = 'yellow'

  return { overall, verifiedCount: counts.verified }
}

export function pickTopFacilities(
  facilities: Facility[],
  profile:    UserProfile,
  limit:      number,
): RankedFacility[] {
  return facilities
    .map(facility => {
      const { overall, verifiedCount } = scoreFacility(facility, profile.disabilityType)
      return { facility, overall, verifiedCount }
    })
    .sort((a, b) => {
      const c = COLOR_RANK[a.overall] - COLOR_RANK[b.overall]
      if (c !== 0) return c
      const v = b.verifiedCount - a.verifiedCount
      if (v !== 0) return v
      return a.facility.name.localeCompare(b.facility.name, 'tr')
    })
    .slice(0, limit)
}
