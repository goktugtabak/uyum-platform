import { Link } from 'react-router-dom'
import type { Coach, Facility, DisabilityType } from '../../types'
import { getSportIcon, getSportLabel } from '../../lib/sport-icons'

const DISABILITY_LABELS: Record<DisabilityType, string> = {
  wheelchair: 'Tekerlekli Sandalye',
  visual:     'Görme',
  hearing:    'İşitme',
  upper_limb: 'Üst Ekstremite',
}

interface CoachCardProps {
  coach:        Coach
  facilities:   Facility[]
  profileMatch?: boolean
}

export function CoachCard({ coach, facilities, profileMatch = false }: CoachCardProps) {
  const titleId = `coach-${coach.id}-title`
  const linkedFacilities = coach.facilityIds
    .map(id => facilities.find(f => f.id === id))
    .filter((f): f is Facility => Boolean(f))

  return (
    <article
      aria-labelledby={titleId}
      className={
        'flex flex-col gap-3 p-5 rounded-xl border transition-colors ' +
        (profileMatch
          ? 'border-uyum-purple/40 bg-uyum-purple/10 hover:border-uyum-purple/70'
          : 'border-white/10 bg-white/5 hover:border-uyum-purple/40')
      }
    >
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3
            id={titleId}
            className="text-base font-heading font-semibold text-white"
          >
            {coach.name}
          </h3>
          <p className="text-xs text-white/60 mt-0.5">
            {coach.city} · {coach.yearsExperience} yıl deneyim
          </p>
        </div>
        {profileMatch && (
          <span
            className="text-[10px] uppercase tracking-wider text-uyum-frost-blue font-heading flex-shrink-0"
            aria-label="Profiline uygun uzmanlık"
          >
            Uzmanlık eşleşti
          </span>
        )}
      </header>

      <p className="text-sm font-body text-white/80 leading-relaxed line-clamp-3">
        {coach.bio}
      </p>

      <div className="space-y-1.5">
        <p className="text-[10px] uppercase tracking-wider text-white/50 font-heading">
          Sporlar
        </p>
        <div className="flex flex-wrap gap-1.5">
          {coach.sports.map(sportId => (
            <span
              key={sportId}
              className="
                inline-flex items-center gap-1
                text-xs px-2 py-0.5 rounded-md
                bg-white/10 text-white/90 border border-white/10
              "
            >
              <span aria-hidden="true">{getSportIcon(sportId)}</span>
              {getSportLabel(sportId)}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-[10px] uppercase tracking-wider text-white/50 font-heading">
          Uzmanlık
        </p>
        <div className="flex flex-wrap gap-1.5">
          {coach.disabilityExpertise.map(d => (
            <span
              key={d}
              className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/10"
            >
              {DISABILITY_LABELS[d]}
            </span>
          ))}
        </div>
      </div>

      {linkedFacilities.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase tracking-wider text-white/50 font-heading">
            Çalıştığı tesisler
          </p>
          <ul role="list" className="flex flex-wrap gap-1.5">
            {linkedFacilities.map(f => (
              <li key={f.id}>
                <Link
                  to={`/facility/${f.id}`}
                  className="
                    text-xs px-2 py-0.5 rounded-md
                    text-uyum-frost-blue underline hover:text-white
                    focus-visible:outline focus-visible:outline-2
                    focus-visible:outline-uyum-purple rounded
                  "
                >
                  {f.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <footer className="flex flex-wrap items-center gap-3 pt-2 border-t border-white/10 mt-auto">
        {coach.contact.email && (
          <a
            href={`mailto:${coach.contact.email}`}
            aria-label={`E-posta gönder: ${coach.contact.email}`}
            className="
              text-xs text-uyum-purple underline hover:text-uyum-blue
              focus-visible:outline focus-visible:outline-2 focus-visible:outline-uyum-purple rounded
            "
          >
            ✉ {coach.contact.email}
          </a>
        )}
        {coach.contact.phone && (
          <a
            href={`tel:${coach.contact.phone.replace(/\s+/g, '')}`}
            aria-label={`Telefon: ${coach.contact.phone}`}
            className="
              text-xs text-uyum-purple underline hover:text-uyum-blue
              focus-visible:outline focus-visible:outline-2 focus-visible:outline-uyum-purple rounded
            "
          >
            ☎ {coach.contact.phone}
          </a>
        )}
      </footer>
    </article>
  )
}
