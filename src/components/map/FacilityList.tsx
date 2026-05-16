import { Link } from 'react-router-dom'
import { useFacilityScore, type ScoreColor } from '../../hooks/useFacilityScore'
import { getSportIcon, getSportLabel } from '../../lib/sport-icons'
import type { Facility, DisabilityType } from '../../types'

interface FacilityListProps {
  facilities:     Facility[]
  disabilityType: DisabilityType
  sportFilter:    string | null
}

const DOT_COLOR: Record<ScoreColor, string> = {
  green:  'bg-[#16a34a]',
  yellow: 'bg-[#eab308]',
  red:    'bg-[#dc2626]',
  gray:   'bg-[#6b7280]',
}

const DOT_LABELS: Record<ScoreColor, string> = {
  green:  'İyi erişilebilir',
  yellow: 'Kısmen erişilebilir',
  red:    'Erişim engeli var',
  gray:   'Bilgi yetersiz',
}

function FacilityItem({
  facility,
  disabilityType,
  isDimmed,
}: {
  facility: Facility
  disabilityType: DisabilityType
  isDimmed: boolean
}) {
  const { overall } = useFacilityScore(facility, disabilityType)
  const primarySport = facility.sports[0] ?? ''

  return (
    <li
      role="listitem"
      className={`transition-opacity ${isDimmed ? 'opacity-40' : 'opacity-100'}`}
    >
      <Link
        to={`/facility/${facility.id}`}
        aria-label={`${facility.name}, ${facility.district} — ${DOT_LABELS[overall]}, ana spor: ${getSportLabel(primarySport)}`}
        className="
          flex items-center gap-3 px-3 py-2.5 rounded-lg
          hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-uyum-purple
          transition-colors group
        "
      >
        <span
          className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${DOT_COLOR[overall]} hc:border hc:border-white`}
          aria-hidden="true"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-heading font-semibold text-white truncate group-hover:text-uyum-frost-blue hc:text-white">
            {facility.name}
          </p>
          <p className="text-xs font-body text-white/50 hc:text-white/80">{facility.district}</p>
        </div>
        <div className="flex gap-0.5 flex-shrink-0" aria-hidden="true">
          {facility.sports.slice(0, 3).map(id => (
            <span key={id} className="text-sm leading-none" title={getSportLabel(id)}>
              {getSportIcon(id)}
            </span>
          ))}
          {facility.sports.length > 3 && (
            <span className="text-xs text-white/40 ml-0.5">+{facility.sports.length - 3}</span>
          )}
        </div>
      </Link>
    </li>
  )
}

export function FacilityList({ facilities, disabilityType, sportFilter }: FacilityListProps) {
  const sorted = sportFilter
    ? [
        ...facilities.filter(f => f.sports.includes(sportFilter)),
        ...facilities.filter(f => !f.sports.includes(sportFilter)),
      ]
    : facilities

  const listContent = (
    <ul role="list" className="space-y-0.5 py-1">
      {sorted.map(facility => (
        <FacilityItem
          key={facility.id}
          facility={facility}
          disabilityType={disabilityType}
          isDimmed={sportFilter ? !facility.sports.includes(sportFilter) : false}
        />
      ))}
    </ul>
  )

  return (
    <>
      {/* Mobile: details accordion */}
      <details className="md:hidden bg-uyum-dark border-t border-white/10">
        <summary className="px-4 py-3 text-sm font-heading font-semibold text-white cursor-pointer select-none hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-uyum-purple focus-visible:ring-inset">
          Tesis Listesi ({facilities.length})
        </summary>
        <div className="max-h-64 overflow-y-auto px-2 pb-2">
          {listContent}
        </div>
      </details>

      {/* Desktop: sticky sidebar */}
      <aside
        aria-label="Tesis listesi"
        className="hidden md:block w-80 flex-shrink-0 overflow-y-auto border-r border-white/10"
      >
        <div className="px-3 py-3 border-b border-white/10">
          <p className="text-xs font-heading font-semibold text-white/60 uppercase tracking-wider">
            Tesisler ({facilities.length})
          </p>
        </div>
        <div className="px-2 pb-4">
          {listContent}
        </div>
      </aside>
    </>
  )
}
