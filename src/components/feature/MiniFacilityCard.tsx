import { Link } from 'react-router-dom'
import type { Facility, DisabilityType } from '../../types'
import { useFacilityScore, type ScoreColor } from '../../hooks/useFacilityScore'
import { SCORE_LABEL, SCORE_GLYPH } from '../../lib/a11y-labels'
import { getSportLabel } from '../../lib/sport-icons'
import { MapPin } from 'lucide-react'

const SCORE_BG: Record<ScoreColor, string> = {
  green:  'bg-mint/70 text-mint-foreground',
  yellow: 'bg-[oklch(0.92_0.10_85)] text-[oklch(0.45_0.12_85)]',
  red:    'bg-destructive/15 text-destructive',
  gray:   'bg-muted text-muted-foreground',
}

const SCORE_PERCENT: Record<ScoreColor, number> = {
  green:  92,
  yellow: 68,
  red:    35,
  gray:   50,
}

interface Props {
  facility:       Facility
  disabilityType: DisabilityType
  image?:         string
}

export function MiniFacilityCard({ facility, disabilityType, image }: Props) {
  const { overall } = useFacilityScore(facility, disabilityType)
  const primarySport = facility.sports[0] ?? ''
  const fallbackInitial = facility.name[0]

  return (
    <Link
      to={`/facility/${facility.id}`}
      aria-label={`${facility.name} detayına git`}
      className="group flex items-center gap-3 rounded-2xl bg-card p-2.5 ring-1 ring-border/40 transition hover:ring-primary/40 hc:bg-white hc:ring-black"
    >
      {image ? (
        <img
          src={image}
          alt=""
          className="size-14 rounded-2xl object-cover"
          loading="lazy"
        />
      ) : (
        <div
          aria-hidden
          className="grid size-14 place-items-center rounded-2xl bg-gradient-brand text-base font-bold text-primary-foreground"
        >
          {fallbackInitial}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-bold text-foreground group-hover:text-primary hc:text-black">
          {facility.name}
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <MapPin className="size-3" aria-hidden />
          <span className="truncate">
            {facility.district}{primarySport && ` · ${getSportLabel(primarySport)}`}
          </span>
        </div>
      </div>
      <span
        className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${SCORE_BG[overall]}`}
        role="img"
        aria-label={SCORE_LABEL[overall]}
      >
        <span aria-hidden>{SCORE_GLYPH[overall]}</span> %{SCORE_PERCENT[overall]}
      </span>
    </Link>
  )
}
