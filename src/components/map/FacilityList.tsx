import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { useFacilityScore } from '../../hooks/useFacilityScore'
import { SCORE_LABEL } from '../../lib/a11y-labels'
import { ScoreBadge } from '../ui/ScoreBadge'
import { getSportIcon, getSportLabel } from '../../lib/sport-icons'
import type { Facility, DisabilityType } from '../../types'

interface FacilityListProps {
  facilities:     Facility[]
  disabilityType: DisabilityType
  sportFilter:    string | null
}



function FacilityItem({
  facility, disabilityType, isDimmed,
}: {
  facility: Facility
  disabilityType: DisabilityType
  isDimmed: boolean
}) {
  const { overall } = useFacilityScore(facility, disabilityType)

  return (
    <li className={`transition-opacity ${isDimmed ? 'opacity-40' : 'opacity-100'}`}>
      <Link
        to={`/facility/${facility.id}`}
        aria-label={`${facility.name}, ${facility.district} — ${SCORE_LABEL[overall]}`}
        className="group flex gap-3 rounded-2xl p-2 hover:bg-card hc:hover:bg-white"
      >
        <div
          aria-hidden
          className="grid size-[72px] shrink-0 place-items-center rounded-2xl bg-primary text-3xl text-primary-foreground"
        >
          {getSportIcon(facility.sports[0] ?? '')}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="text-[13.5px] font-bold leading-tight text-foreground group-hover:text-primary hc:text-black">
              {facility.name}
            </div>
            <ScoreBadge color={overall} size="sm" />
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
            <MapPin aria-hidden className="size-3" /> {facility.district}
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-1 text-[11px] text-muted-foreground">
            {facility.sports.slice(0, 4).map(id => (
              <span
                key={id}
                title={getSportLabel(id)}
                className="rounded-full bg-muted px-1.5 py-0.5"
              >
                {getSportLabel(id)}
              </span>
            ))}
          </div>
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

  return (
    <aside
      aria-label="Tesis listesi"
      className="flex flex-col gap-3 lg:max-h-[calc(100dvh-12rem)] lg:overflow-y-auto"
    >
      <div>
        <h2 className="text-lg font-extrabold text-primary-deep">
          Size en uygun tesisler
        </h2>
        <p className="text-xs text-muted-foreground">
          {sorted.length} tesis {sportFilter && `· ${getSportLabel(sportFilter)} filtreli`}
        </p>
      </div>
      <ul role="list" className="space-y-2">
        {sorted.map(facility => (
          <FacilityItem
            key={facility.id}
            facility={facility}
            disabilityType={disabilityType}
            isDimmed={sportFilter ? !facility.sports.includes(sportFilter) : false}
          />
        ))}
      </ul>
    </aside>
  )
}
