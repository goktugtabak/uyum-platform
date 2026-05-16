import type { Facility } from '../../types'
import {
  LIVE_STATUS_KEYS,
  getLiveStatusLabel,
  getFreshness,
  formatRelative,
  type Freshness,
} from '../../lib/live-status'
import { DemoBadge } from '../ui/DemoBadge'
import { SpeakButton } from '../ui/SpeakButton'

const STATUS_ICON: Record<string, string> = {
  true:    '✅',
  false:   '❌',
  null:    '❓',
}

// Color is bound to *status only* (working/broken/unknown). Freshness is shown
// separately via the relative-time text so the green dot never means two things.
const STATUS_DOT: Record<'true' | 'false' | 'null', string> = {
  true:  'bg-a11y-verified',
  false: 'bg-a11y-none',
  null:  'bg-a11y-unknown',
}

const FRESHNESS_LABEL: Record<Freshness, string> = {
  fresh:  'taze',
  recent: 'son ay',
  stale:  'eski',
}

interface Props {
  facility: Facility
}

export function LiveStatus({ facility }: Props) {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <ul role="list" className="space-y-3">
        {LIVE_STATUS_KEYS.map(key => {
          const entry = facility.liveStatus[key]
          const statusKey = (entry.status === null ? 'null' : String(entry.status)) as 'true' | 'false' | 'null'
          const freshness = getFreshness(entry.verifiedAt)
          const relTime   = formatRelative(entry.verifiedAt)

          const statusLabel =
            entry.status === true ? 'Aktif' :
            entry.status === false ? 'Arızalı' : 'Bilinmiyor'

          const freshnessText = freshness ? FRESHNESS_LABEL[freshness] : null
          const speakText =
            `${getLiveStatusLabel(key)}: ${statusLabel}, son güncelleme ${relTime}` +
            (freshnessText ? ` (${freshnessText})` : '')

          return (
            <li key={key} role="listitem" className="flex items-center gap-3">
              <span
                className={`w-3 h-3 rounded-full flex-shrink-0 ${STATUS_DOT[statusKey]}`}
                aria-hidden="true"
              />
              <span className="w-32 text-sm font-medium text-gray-700 hc:text-white">
                {getLiveStatusLabel(key)}
              </span>
              <span className="text-lg" aria-hidden="true">
                {STATUS_ICON[statusKey]}
              </span>
              <span className="sr-only">{statusLabel}</span>
              {entry.status === false && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300 hc:bg-black hc:text-white hc:border-white">
                  ARIZALI
                </span>
              )}
              <span className="text-xs text-gray-500 hc:text-gray-300 ml-auto">
                {relTime}
                {freshnessText && (
                  <span className="ml-1 text-gray-400">· {freshnessText}</span>
                )}
                {entry.verifiedBy && (
                  <span className="ml-1 text-gray-400">· {entry.verifiedBy}</span>
                )}
              </span>
              <SpeakButton text={speakText} label={getLiveStatusLabel(key)} />
            </li>
          )
        })}
      </ul>
      <div className="pt-2 border-t border-gray-100">
        <DemoBadge label="Canlı durum demo verisidir" />
      </div>
    </div>
  )
}
