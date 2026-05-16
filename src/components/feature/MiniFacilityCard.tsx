import { Link } from 'react-router-dom'
import type { Facility, DisabilityType } from '../../types'
import { useFacilityScore, type ScoreColor } from '../../hooks/useFacilityScore'
import { AccessibilityRadar } from '../facility/AccessibilityRadar'
import { getSportIcon, getSportLabel } from '../../lib/sport-icons'

const DOT_COLOR: Record<ScoreColor, string> = {
  green:  'bg-[#16a34a]',
  yellow: 'bg-[#eab308]',
  red:    'bg-[#dc2626]',
  gray:   'bg-[#6b7280]',
}

const DOT_LABEL: Record<ScoreColor, string> = {
  green:  'İyi erişilebilir',
  yellow: 'Kısmen erişilebilir',
  red:    'Erişim engeli var',
  gray:   'Bilgi yetersiz',
}

interface Props {
  facility:       Facility
  disabilityType: DisabilityType
}

export function MiniFacilityCard({ facility, disabilityType }: Props) {
  const { overall } = useFacilityScore(facility, disabilityType)
  const primarySport = facility.sports[0] ?? ''

  return (
    <article
      className="
        rounded-xl border border-white/10 bg-white/5 p-4
        flex flex-col gap-3 transition-colors
        hover:bg-white/10 focus-within:bg-white/10
      "
    >
      <header className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-base font-heading font-semibold text-white truncate">
            {facility.name}
          </h3>
          <p className="text-xs font-body text-white/60 truncate">
            {facility.district}
            {primarySport && ` · ${getSportLabel(primarySport)}`}
          </p>
        </div>
        <span
          className={`mt-1 w-3 h-3 rounded-full flex-shrink-0 hc:border hc:border-white ${DOT_COLOR[overall]}`}
          role="img"
          aria-label={DOT_LABEL[overall]}
        />
      </header>

      <div className="flex items-center justify-center text-white/80">
        <div className="w-full max-w-[140px]">
          <AccessibilityRadar
            facility={facility}
            disabilityType={disabilityType}
            height={120}
            compact
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1 text-base" aria-hidden="true">
          {facility.sports.slice(0, 3).map(id => (
            <span key={id} title={getSportLabel(id)}>{getSportIcon(id)}</span>
          ))}
        </div>
        <Link
          to={`/facility/${facility.id}`}
          aria-label={`${facility.name} detay sayfası`}
          className="
            text-sm font-medium text-uyum-purple hover:text-uyum-blue
            underline focus-visible:outline focus-visible:outline-2
            focus-visible:outline-offset-2 focus-visible:outline-uyum-purple rounded
          "
        >
          Detay →
        </Link>
      </div>
    </article>
  )
}
