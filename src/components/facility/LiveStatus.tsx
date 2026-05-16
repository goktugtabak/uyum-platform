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

const FRESHNESS_DOT: Record<Freshness, string> = {
  fresh:  'bg-a11y-verified',
  recent: 'bg-a11y-partial',
  stale:  'bg-a11y-unknown',
}

interface Props {
  facility: Facility
}

export function LiveStatus({ facility }: Props) {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      {LIVE_STATUS_KEYS.map(key => {
        const entry = facility.liveStatus[key]
        const statusStr = entry.status === null ? 'null' : String(entry.status)
        const freshness = getFreshness(entry.verifiedAt)
        const relTime = formatRelative(entry.verifiedAt)
        const dotClass = entry.status === false
          ? 'bg-a11y-none'
          : freshness
            ? FRESHNESS_DOT[freshness]
            : 'bg-a11y-unknown'

        const statusLabel =
          entry.status === true ? 'Aktif' :
          entry.status === false ? 'Arızalı' : 'Bilinmiyor'

        const speakText = `${getLiveStatusLabel(key)}: ${statusLabel}, son güncelleme ${relTime}`
        return (
          <div
            key={key}
            className="flex items-center gap-3"
            aria-label={speakText}
          >
            <span
              className={`w-3 h-3 rounded-full flex-shrink-0 ${dotClass}`}
              aria-hidden="true"
            />
            <span className="w-32 text-sm font-medium text-gray-700 hc:text-white">
              {getLiveStatusLabel(key)}
            </span>
            <span className="text-lg" aria-hidden="true">
              {STATUS_ICON[statusStr]}
            </span>
            {entry.status === false && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300 hc:bg-black hc:text-white hc:border-white">
                ARIZALI
              </span>
            )}
            <span className="text-xs text-gray-500 hc:text-gray-300 ml-auto">
              {relTime}
              {entry.verifiedBy && (
                <span className="ml-1 text-gray-400">· {entry.verifiedBy}</span>
              )}
            </span>
            <SpeakButton text={speakText} label={getLiveStatusLabel(key)} />
          </div>
        )
      })}
      <div className="pt-2 border-t border-gray-100">
        <DemoBadge label="Canlı durum demo verisidir — webhook Faz 9'da" />
      </div>
    </div>
  )
}
