import type { AccessibilityDimension } from '../../types'
import { DIMENSION_KEYS, getDimensionLabel, type DimensionKey } from '../../lib/a11y-dimensions'
import { getAccessibilityLabel } from '../../lib/a11y-labels'
import { SpeakButton } from '../ui/SpeakButton'

const DOT_CLASS: Record<AccessibilityDimension, string> = {
  verified: 'bg-a11y-verified',
  partial:  'bg-a11y-partial',
  none:     'bg-a11y-none',
  unknown:  'bg-a11y-unknown',
}

interface Props {
  dimensions: Record<DimensionKey, AccessibilityDimension>
}

export function AccessibilityLabelList({ dimensions }: Props) {
  return (
    <ul role="list" className="mt-4 space-y-2">
      {DIMENSION_KEYS.map(key => {
        const dim = dimensions[key]
        const { label, icon } = getAccessibilityLabel(dim)
        const speakText = `${getDimensionLabel(key)}: ${label}`
        return (
          <li
            key={key}
            className="flex flex-wrap items-center gap-3 text-sm"
          >
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
          </li>
        )
      })}
    </ul>
  )
}
