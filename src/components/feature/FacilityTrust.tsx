import { AlertTriangle, CheckCircle2, CircleHelp, ShieldCheck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Facility } from '../../types'
import {
  getFacilityTrustItems,
  getFacilityTrustSummary,
  type FacilityTrustState,
} from '../../lib/facility-trust'

interface FacilityTrustLineProps {
  facility: Facility
  className?: string
}

interface FacilityTrustPanelProps {
  facility: Facility
}

const STATE_ICON: Record<FacilityTrustState, LucideIcon> = {
  verified: CheckCircle2,
  reported: AlertTriangle,
  missing: CircleHelp,
}

const STATE_TONE: Record<FacilityTrustState, string> = {
  verified: 'text-success bg-success/10 ring-success/20',
  reported: 'text-[oklch(0.55_0.16_55)] bg-[oklch(0.95_0.07_70)] ring-[oklch(0.82_0.12_70)]',
  missing: 'text-muted-foreground bg-muted ring-border/50',
}

function cx(...parts: Array<string | undefined | false>): string {
  return parts.filter(Boolean).join(' ')
}

export function FacilityTrustLine({ facility, className }: FacilityTrustLineProps) {
  const summary = getFacilityTrustSummary(facility)

  return (
    <div
      className={cx(
        'flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[10.5px] leading-relaxed text-muted-foreground',
        className,
      )}
      aria-label={`Veri güveni: son güncelleme ${summary.updatedLabel}, kaynak ${summary.sourceLabel}, durum ${summary.statusLabel}`}
    >
      <ShieldCheck className="size-3 text-primary" aria-hidden />
      <span>Son güncelleme: {summary.updatedLabel}</span>
      <span aria-hidden>·</span>
      <span>Kaynak: {summary.sourceLabel}</span>
      <span aria-hidden>·</span>
      <span>Durum: {summary.statusLabel}</span>
    </div>
  )
}

export function FacilityTrustPanel({ facility }: FacilityTrustPanelProps) {
  const summary = getFacilityTrustSummary(facility)
  const items = getFacilityTrustItems(facility)

  return (
    <div className="rounded-3xl bg-card p-5 ring-1 ring-border/40 hc:bg-white hc:ring-black">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-extrabold text-primary-deep hc:text-black">
            Veri Güveni
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Her bilginin tazelik ve kaynak durumunu ayrı gösteriyoruz.
          </p>
        </div>
        <span
          className={cx(
            'shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ring-1',
            STATE_TONE[summary.state],
          )}
        >
          {summary.statusLabel}
        </span>
      </header>

      <ul role="list" className="space-y-3">
        {items.map(item => {
          const Icon = STATE_ICON[item.state]
          return (
            <li key={item.key} className="flex items-start gap-3">
              <span
                aria-hidden
                className={cx(
                  'mt-0.5 grid size-7 shrink-0 place-items-center rounded-full ring-1',
                  STATE_TONE[item.state],
                )}
              >
                <Icon className="size-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground hc:text-black">
                  {item.label}: <span className="font-normal text-foreground/75">{item.text}</span>
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Kaynak: {item.sourceLabel}
                </p>
              </div>
            </li>
          )
        })}
      </ul>

      <p className="mt-4 rounded-2xl bg-primary/5 px-3 py-2.5 text-[12px] leading-relaxed text-foreground/75">
        Verinin kusursuz olduğunu iddia etmiyoruz; tazelik ve kaynak durumunu açık göstererek
        kullanıcıya dürüst bir güven katmanı sunuyoruz.
      </p>
    </div>
  )
}
