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
  true:  '✅',
  false: '❌',
  null:  '❓',
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
    <div className="rounded-3xl bg-card p-5 ring-1 ring-border/40 hc:bg-white hc:ring-black">
      <header className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-base font-extrabold text-primary-deep hc:text-black">
          Canlı Durum
        </h3>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success">
          <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-success" /> Anlık
        </span>
      </header>

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
            <li key={key} role="listitem" className="flex flex-wrap items-center gap-3">
              <span
                aria-hidden
                className={`size-3 shrink-0 rounded-full ${STATUS_DOT[statusKey]}`}
              />
              <span className="w-32 text-sm font-semibold text-foreground hc:text-black">
                {getLiveStatusLabel(key)}
              </span>
              <span className="text-base" aria-hidden>
                {STATUS_ICON[statusKey]}
              </span>
              <span className="sr-only">{statusLabel}</span>
              {entry.status === false && (
                <span className="inline-flex items-center rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-bold uppercase text-destructive">
                  Arızalı
                </span>
              )}
              <span className="ml-auto text-xs text-muted-foreground hc:text-black">
                {relTime}
                {freshnessText && (
                  <span className="ml-1 text-muted-foreground/70">· {freshnessText}</span>
                )}
                {entry.verifiedBy && (
                  <span className="ml-1 text-muted-foreground/70">· {entry.verifiedBy}</span>
                )}
              </span>
              <SpeakButton text={speakText} label={getLiveStatusLabel(key)} />
            </li>
          )
        })}
      </ul>

      <div className="mt-4 border-t border-border/40 pt-3">
        <DemoBadge label="Canlı durum demo verisidir" />
      </div>
    </div>
  )
}
