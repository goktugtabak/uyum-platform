import { Link } from 'react-router-dom'
import { Mail, Phone, Star, Sparkles, Bookmark, MapPin, BadgeCheck } from 'lucide-react'
import type { Coach, Facility, DisabilityType } from '../../types'
import { getSportLabel } from '../../lib/sport-icons'

const DISABILITY_LABELS: Record<DisabilityType, string> = {
  wheelchair: 'Tekerlekli Sandalye',
  visual:     'Görme',
  hearing:    'İşitme',
  upper_limb: 'Üst Ekstremite',
}

// Deterministic rating from id so it stays stable per coach (no backend yet).
function hashId(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0
  return Math.abs(h)
}
function ratingFor(coach: Coach): number {
  // 4.5 - 5.0 range
  return 4.5 + ((hashId(coach.id) % 5) / 10)
}
function ratingCountFor(coach: Coach): number {
  return 32 + (hashId(coach.id + 'rc') % 80) // 32..111
}

interface CoachCardProps {
  coach:         Coach
  facilities:    Facility[]
  profileMatch?: boolean
}

export function CoachCard({ coach, facilities, profileMatch = false }: CoachCardProps) {
  const titleId = `coach-${coach.id}-title`
  const initials = coach.name
    .split(' ')
    .map(part => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
  const linkedFacilities = coach.facilityIds
    .map(id => facilities.find(f => f.id === id))
    .filter((f): f is Facility => Boolean(f))
  const rating = ratingFor(coach)
  const ratingCount = ratingCountFor(coach)
  const primarySport = coach.sports[0]

  return (
    <article
      aria-labelledby={titleId}
      className="group relative flex flex-col overflow-hidden rounded-3xl bg-card ring-1 ring-border/40 transition hover:-translate-y-0.5 hover:shadow-card"
    >
      {/* Photo / gradient header */}
      <div className="relative aspect-[4/3] overflow-hidden bg-primary">
        <div
          aria-hidden
          className="absolute inset-0 grid place-items-center text-5xl font-extrabold tracking-tight text-primary-foreground"
        >
          {initials || coach.name[0]}
        </div>
        {/* Top badges */}
        <div className="absolute left-3 top-3 flex items-center gap-2">
          {profileMatch && (
            <span className="inline-flex items-center gap-1 rounded-full bg-mint/85 px-2 py-0.5 text-[10px] font-bold text-mint-foreground backdrop-blur">
              <Sparkles aria-hidden className="size-2.5" /> Sana uygun
            </span>
          )}
          <span
            aria-label={`${coach.yearsExperience} yıl deneyim`}
            className="inline-flex items-center gap-1 rounded-full bg-card/90 px-2 py-0.5 text-[10px] font-bold text-primary-deep backdrop-blur"
          >
            <BadgeCheck aria-hidden className="size-2.5 text-success" /> {coach.yearsExperience} yıl
          </span>
        </div>
        {/* Bookmark */}
        <button
          type="button"
          aria-label="Koçu kaydet"
          className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-card/95 text-foreground/70 shadow-card backdrop-blur hover:text-primary"
        >
          <Bookmark className="size-4" aria-hidden />
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <header>
          <h3 id={titleId} className="text-base font-extrabold leading-tight text-primary-deep">
            {coach.name}
          </h3>
          <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
            <MapPin aria-hidden className="size-3" /> {coach.city}
            {primarySport && (
              <>
                <span aria-hidden className="px-1">·</span>
                <span className="font-semibold text-foreground">{getSportLabel(primarySport)}</span>
              </>
            )}
          </p>
          <div className="mt-1.5 inline-flex items-center gap-1">
            <Star aria-hidden className="size-3 fill-current text-[oklch(0.78_0.16_85)]" />
            <span className="text-[12px] font-bold text-foreground">{rating.toFixed(1)}</span>
            <span className="text-[11px] text-muted-foreground">({ratingCount})</span>
          </div>
        </header>

        <p className="text-[12.5px] leading-relaxed text-foreground/75 line-clamp-3">
          {coach.bio}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {coach.disabilityExpertise.slice(0, 2).map(d => (
            <span
              key={d}
              className="rounded-full bg-mint/55 px-2 py-0.5 text-[10.5px] font-bold text-mint-foreground"
            >
              {DISABILITY_LABELS[d]}
            </span>
          ))}
          {coach.sports.slice(0, 2).map(s => (
            <span
              key={s}
              className="rounded-full bg-accent/15 px-2 py-0.5 text-[10.5px] font-bold text-accent"
            >
              {getSportLabel(s)}
            </span>
          ))}
        </div>

        {linkedFacilities.length > 0 && (
          <ul role="list" className="flex flex-wrap gap-1.5">
            {linkedFacilities.slice(0, 2).map(f => (
              <li key={f.id}>
                <Link
                  to={`/facility/${f.id}`}
                  className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10.5px] font-semibold text-primary hover:bg-primary/10"
                >
                  <MapPin aria-hidden className="size-2.5" /> {f.name}
                </Link>
              </li>
            ))}
          </ul>
        )}

        <footer className="mt-auto flex items-center gap-3 border-t border-border/40 pt-3">
          {coach.contact.email && (
            <a
              href={`mailto:${coach.contact.email}`}
              aria-label={`E-posta gönder: ${coach.contact.email}`}
              className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-primary hover:text-primary-deep"
            >
              <Mail aria-hidden className="size-3.5" /> E-posta
            </a>
          )}
          {coach.contact.phone && (
            <a
              href={`tel:${coach.contact.phone.replace(/\s+/g, '')}`}
              aria-label={`Telefon: ${coach.contact.phone}`}
              className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-primary hover:text-primary-deep"
            >
              <Phone aria-hidden className="size-3.5" /> Telefon
            </a>
          )}
        </footer>
      </div>
    </article>
  )
}
