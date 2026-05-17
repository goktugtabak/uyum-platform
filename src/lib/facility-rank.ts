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

const DIM_RANK: Record<AccessibilityDimension, number> = {
  none: 0, partial: 1, unknown: 2, verified: 3,
}

function worstStatus(statuses: AccessibilityDimension[]): AccessibilityDimension {
  return statuses.reduce<AccessibilityDimension>(
    (worst, s) => DIM_RANK[s] < DIM_RANK[worst] ? s : worst,
    'verified',
  )
}

function scoreFacility(facility: Facility, disabilityTypes: DisabilityType[]) {
  let verifiedCount = 0
  let hasNone = false
  let unknownCount = 0

  for (const key of DIMENSION_KEYS) {
    const statuses = disabilityTypes.map(d => facility.accessibility[key][d] as AccessibilityDimension)
    const worst = worstStatus(statuses)
    if (worst === 'verified') verifiedCount++
    else if (worst === 'none') hasNone = true
    else if (worst === 'unknown') unknownCount++
  }

  let overall: ScoreColor
  if (hasNone) overall = 'red'
  else if (verifiedCount >= 4) overall = 'green'
  else if (unknownCount >= 4) overall = 'gray'
  else overall = 'yellow'

  return { overall, verifiedCount }
}

export function pickTopFacilities(
  facilities: Facility[],
  profile:    UserProfile,
  limit:      number,
): RankedFacility[] {
  const types = profile.disabilityTypes.length > 0 ? profile.disabilityTypes : ['wheelchair' as DisabilityType]
  return facilities
    .map(facility => {
      const { overall, verifiedCount } = scoreFacility(facility, types)
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
