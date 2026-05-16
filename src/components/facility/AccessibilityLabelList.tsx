import type { AccessibilityDimension } from '../../types'
import { DIMENSION_KEYS, getDimensionLabel, type DimensionKey } from '../../lib/a11y-dimensions'
import { getAccessibilityLabel } from '../../lib/a11y-labels'
import { SpeakButton } from '../ui/SpeakButton'

const DOT_CLASS: Record<AccessibilityDimension, string> = {
  verified: 'bg-a11y-verified hc:bg-white',
  partial:  'bg-a11y-partial  hc:bg-white',
  none:     'bg-a11y-none     hc:bg-white',
  unknown:  'bg-a11y-unknown  hc:bg-white',
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
            className="flex items-center gap-3 text-sm"
          >
            <span
              className={`inline-block w-3 h-3 rounded-full flex-shrink-0 ${DOT_CLASS[dim]}`}
              aria-hidden="true"
            />
            <span className="font-medium text-gray-700 hc:text-white w-36">
              {getDimensionLabel(key)}
            </span>
            <span className="text-gray-600 hc:text-gray-200 flex-1">
              {icon} {label}
            </span>
            <SpeakButton text={speakText} label={getDimensionLabel(key)} />
          </li>
        )
      })}
    </ul>
  )
}
