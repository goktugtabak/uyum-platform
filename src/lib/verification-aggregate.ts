import type { VerificationEntry, AccessibilityDimension, DisabilityType } from '../types'
import { DIMENSION_KEYS, type DimensionKey } from './a11y-dimensions'

// Thresholds: < 3 votes → unknown (insufficient signal)
// confirmRate >= 0.75 → verified, >= 0.4 → partial, < 0.4 → none
const MIN_VOTES = 3
const VERIFIED_THRESHOLD = 0.75
const PARTIAL_THRESHOLD = 0.4

export interface DimensionAggregation {
  value: AccessibilityDimension
  confirms: number
  denies: number
}

export function aggregateVerifications(
  verifications: VerificationEntry[],
  facilityId: string,
  disabilityType: DisabilityType,
): Record<DimensionKey, DimensionAggregation> {
  const relevant = verifications.filter(
    v => v.facilityId === facilityId && v.disabilityType === disabilityType,
  )

  const result = {} as Record<DimensionKey, DimensionAggregation>

  for (const key of DIMENSION_KEYS) {
    const forDim = relevant.filter(v => v.dimension === key)
    const confirms = forDim.filter(v => v.vote === 'confirm').length
    const denies = forDim.filter(v => v.vote === 'deny').length
    const total = confirms + denies

    let value: AccessibilityDimension
    if (total < MIN_VOTES) {
      value = 'unknown'
    } else {
      const rate = confirms / total
      if (rate >= VERIFIED_THRESHOLD) value = 'verified'
      else if (rate >= PARTIAL_THRESHOLD) value = 'partial'
      else value = 'none'
    }

    result[key] = { value, confirms, denies }
  }

  return result
}
