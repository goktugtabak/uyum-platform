import type { AccessibilityDimension, DisabilityType, VerificationEntry } from '../../types'
import { DIMENSION_KEYS, getDimensionLabel, type DimensionKey } from '../../lib/a11y-dimensions'
import { getAccessibilityLabel } from '../../lib/a11y-labels'
import { SpeakButton } from '../ui/SpeakButton'
import { VerificationVoteRow } from './VerificationVoteRow'

const DOT_CLASS: Record<AccessibilityDimension, string> = {
  verified: 'bg-a11y-verified',
  partial:  'bg-a11y-partial',
  none:     'bg-a11y-none',
  unknown:  'bg-a11y-unknown',
}

interface Props {
  dimensions: Record<DimensionKey, AccessibilityDimension>
  facilityId?: string
  disabilityType?: DisabilityType
  verifications?: VerificationEntry[]
  aggregated?: Record<DimensionKey, { confirms: number; denies: number }>
  userVotes?: Record<DimensionKey, VerificationEntry['vote'] | null>
  onVote?: (dimension: DimensionKey, vote: VerificationEntry['vote']) => void
}

export function AccessibilityLabelList({
  dimensions,
  facilityId,
  disabilityType,
  aggregated,
  userVotes,
  onVote,
}: Props) {
  const showVoting = !!(facilityId && disabilityType && onVote)

  return (
    <ul role="list" className="mt-4 space-y-3">
      {DIMENSION_KEYS.map(key => {
        const dim = dimensions[key]
        const { label, icon } = getAccessibilityLabel(dim)
        const speakText = `${getDimensionLabel(key)}: ${label}`
        const agg = aggregated?.[key]
        const uv = userVotes?.[key] ?? null

        return (
          <li key={key} className="text-sm">
            <div className="flex flex-wrap items-center gap-3">
              <span
                aria-hidden
                className={`inline-block size-3 shrink-0 rounded-full ${DOT_CLASS[dim]}`}
              />
              <span className="w-36 font-semibold text-foreground hc:text-black">
                {getDimensionLabel(key)}
              </span>
              <span className="flex-1 text-muted-foreground hc:text-black">
                <span aria-hidden>{icon}</span> {label}
              </span>
              <SpeakButton text={speakText} label={getDimensionLabel(key)} />
            </div>
            {showVoting && (
              <VerificationVoteRow
                facilityId={facilityId!}
                dimension={key}
                disabilityType={disabilityType!}
                confirms={agg?.confirms ?? 0}
                denies={agg?.denies ?? 0}
                userVote={uv}
                onVote={vote => onVote!(key, vote)}
              />
            )}
          </li>
        )
      })}
    </ul>
  )
}
