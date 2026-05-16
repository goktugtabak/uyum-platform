import { useMemo } from 'react'
import type { Facility, DisabilityType, AccessibilityDimension } from '../types'

export type ScoreColor = 'green' | 'yellow' | 'gray' | 'red'

export interface FacilityScore {
  overall: ScoreColor
  counts: { verified: number; partial: number; none: number; unknown: number }
}

const A11Y_DIM_KEYS = [
  'entry',
  'internal',
  'changing',
  'equipment',
  'staff',
  'communication',
] as const

export function useFacilityScore(
  facility: Facility,
  disabilityType: DisabilityType,
): FacilityScore {
  return useMemo(() => {
    const counts = { verified: 0, partial: 0, none: 0, unknown: 0 }

    for (const key of A11Y_DIM_KEYS) {
      const value: AccessibilityDimension =
        facility.accessibility[key][disabilityType]
      if (value === 'verified') counts.verified++
      else if (value === 'partial') counts.partial++
      else if (value === 'none') counts.none++
      else counts.unknown++
    }

    let overall: ScoreColor
    if (counts.none >= 1) {
      overall = 'red'
    } else if (counts.verified >= 4) {
      overall = 'green'
    } else if (counts.unknown >= 4) {
      overall = 'gray'
    } else if (counts.verified >= 2 || counts.partial >= counts.verified) {
      overall = 'yellow'
    } else {
      overall = 'yellow'
    }

    return { overall, counts }
  }, [facility, disabilityType])
}
