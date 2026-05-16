import { Link } from 'react-router-dom'
import { Mail, Phone, Star, Sparkles } from 'lucide-react'
import type { Coach, Facility, DisabilityType } from '../../types'
import { getSportLabel } from '../../lib/sport-icons'

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
      className="flex flex-col gap-4 rounded-3xl bg-card p-5 ring-1 ring-border/40 transition hover:-translate-y-0.5 hover:shadow-card hc:bg-white hc:ring-black"
    >
      <header className="flex items-start gap-3">
        <div
          aria-hidden
          className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-brand text-xl font-bold text-primary-foreground"
        >
          {coach.name[0]}
        </div>
        <div className="min-w-0 flex-1">
          <h3 id={titleId} className="font-display text-base font-extrabold text-primary-deep hc:text-black">
            {coach.name}
          </h3>
          <p className="text-xs text-muted-foreground">
            {coach.city} · {coach.yearsExperience} yıl deneyim
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 text-[11px] font-bold text-[oklch(0.55_0.12_85)]">
              <Star aria-hidden className="size-3 fill-current" />
              4.8
            </span>
            {profileMatch && (
              <span className="inline-flex items-center gap-1 rounded-full bg-mint/60 px-2 py-0.5 text-[10px] font-bold text-mint-foreground">
                <Sparkles aria-hidden className="size-2.5" /> Sana uygun
              </span>
            )}
          </div>
        </div>
      </header>

      <p className="text-sm leading-relaxed text-foreground/85 line-clamp-3 hc:text-black">
        {coach.bio}
      </p>

      <div className="space-y-1.5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Sporlar</p>
        <div className="flex flex-wrap gap-1.5">
          {coach.sports.map(sportId => (
            <span
              key={sportId}
              className="rounded-full bg-accent/15 px-2 py-0.5 text-[10.5px] font-bold text-accent"
            >
              {getSportLabel(sportId)}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Uzmanlık</p>
        <div className="flex flex-wrap gap-1.5">
          {coach.disabilityExpertise.map(d => (
            <span
              key={d}
              className="rounded-full bg-mint/50 px-2 py-0.5 text-[10.5px] font-bold text-mint-foreground"
            >
              {DISABILITY_LABELS[d]}
            </span>
          ))}
        </div>
      </div>

      {linkedFacilities.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Çalıştığı tesisler</p>
          <ul role="list" className="flex flex-wrap gap-1.5">
            {linkedFacilities.map(f => (
              <li key={f.id}>
                <Link
                  to={`/facility/${f.id}`}
                  className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-primary hover:bg-primary/10 hc:bg-white hc:text-black"
                >
                  {f.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <footer className="mt-auto flex flex-wrap items-center gap-3 border-t border-border/40 pt-3">
        {coach.contact.email && (
          <a
            href={`mailto:${coach.contact.email}`}
            aria-label={`E-posta gönder: ${coach.contact.email}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-deep"
          >
            <Mail aria-hidden className="size-3.5" /> {coach.contact.email}
          </a>
        )}
        {coach.contact.phone && (
          <a
            href={`tel:${coach.contact.phone.replace(/\s+/g, '')}`}
            aria-label={`Telefon: ${coach.contact.phone}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-deep"
          >
            <Phone aria-hidden className="size-3.5" /> {coach.contact.phone}
          </a>
        )}
      </footer>
    </article>
  )
}
