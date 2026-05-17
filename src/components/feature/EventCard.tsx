import { Link } from 'react-router-dom'
import { MapPin, Clock, Accessibility, ArrowRight, Bookmark } from 'lucide-react'
import type { SportEvent, DisabilityType, EventLevel } from '../../types'
import { getSportIcon, getSportLabel } from '../../lib/sport-icons'

const DISABILITY_LABELS: Record<DisabilityType, string> = {
  wheelchair: 'Tekerlekli Sandalye',
  visual:     'Görme',
  hearing:    'İşitme',
  upper_limb: 'Üst Ekstremite',
}

const LEVEL_LABELS: Record<EventLevel, string> = {
  'başlangıç': 'Başlangıç',
  'orta':      'Orta',
  'ileri':     'İleri',
  'yarışma':   'Yarışma',
}

function relativeDays(iso: string, now: number): string {
  const diffMs = new Date(iso).getTime() - now
  const diffDays = Math.ceil(diffMs / 86_400_000)
  if (diffDays === 0) return 'Bugün'
  if (diffDays === 1) return 'Yarın'
  if (diffDays > 0) return `${diffDays} gün sonra`
  if (diffDays === -1) return 'Dün'
  return `${Math.abs(diffDays)} gün önce`
}

function categoryTone(sportId: string): string {
  if (sportId.includes('swim') || sportId.includes('aqua') || sportId.includes('waterpolo'))
    return 'bg-sky/60 text-sky-foreground'
  if (sportId.includes('basket') || sportId.includes('volley') || sportId.includes('football'))
    return 'bg-primary/10 text-primary'
  if (sportId.includes('yoga') || sportId.includes('pilates') || sportId.includes('strength'))
    return 'bg-mint/60 text-mint-foreground'
  return 'bg-accent/15 text-accent'
}

interface EventCardProps {
  event:          SportEvent
  facilityName:   string
  facilityExists: boolean
  now:            number
  dimmed?:        boolean
  profileMatch?:  boolean
}

export function EventCard({
  event,
  facilityName,
  facilityExists,
  now,
  dimmed = false,
  profileMatch = false,
}: EventCardProps) {
  const date = new Date(event.date)
  const day = date.toLocaleDateString('tr-TR', { day: '2-digit' })
  const month = date.toLocaleDateString('tr-TR', { month: 'long' })
  const weekday = date.toLocaleDateString('tr-TR', { weekday: 'long' })
  const time = date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })

  return (
    <article
      aria-labelledby={`event-${event.id}-title`}
      className={`grid items-stretch gap-5 transition-opacity sm:grid-cols-[12rem_auto_1fr] ${dimmed ? 'opacity-60' : ''}`}
    >
      {/* Photo / icon */}
      <div className="relative h-40 overflow-hidden rounded-3xl bg-primary sm:h-full">
        <div
          aria-hidden
          className="absolute inset-0 grid place-items-center text-6xl text-primary-foreground"
        >
          {getSportIcon(event.sport)}
        </div>
      </div>

      {/* Date column */}
      <div className="flex flex-col items-center justify-start pt-2 text-center">
        <span className="text-3xl font-extrabold leading-none text-primary-deep">
          {day}
        </span>
        <span className="mt-1 text-[12px] font-bold text-foreground/70">{month}</span>
        <span className="mt-0.5 text-[11px] text-muted-foreground">{weekday}</span>
      </div>

      {/* Content */}
      <div className="relative">
        {profileMatch && (
          <div className="absolute right-0 top-0 text-right">
            <span className="block text-[11px] font-bold text-success">Sana uygun</span>
            <span className="block text-[10px] text-muted-foreground">Profil eşleşmesi</span>
          </div>
        )}
        <h3
          id={`event-${event.id}-title`}
          className={`pr-24  text-[19px] font-extrabold leading-tight text-primary-deep ${dimmed ? '' : ''}`}
        >
          {event.title}
        </h3>
        <span className={`mt-2 inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold ${categoryTone(event.sport)}`}>
          {getSportLabel(event.sport)}
        </span>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <MapPin aria-hidden className="size-3.5 text-accent" />{' '}
            {facilityExists ? (
              <Link to={`/facility/${event.facilityId}`} className="hover:text-primary">
                {facilityName}
              </Link>
            ) : facilityName}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock aria-hidden className="size-3.5" /> {time} · {relativeDays(event.date, now)}
          </span>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
          <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 font-semibold text-accent">
            <Accessibility aria-hidden className="size-3" /> Erişilebilir
          </span>
          <span className="rounded-full bg-muted px-2 py-0.5 font-semibold text-foreground/70 hc:text-black">
            {LEVEL_LABELS[event.level]}
          </span>
          {event.disabilityTypes.map(d => (
            <span key={d} className="rounded-full bg-card px-2 py-0.5 text-muted-foreground ring-1 ring-border/40">
              {DISABILITY_LABELS[d]}
            </span>
          ))}
        </div>

        <p className="mt-2.5 max-w-md text-[13px] leading-relaxed text-foreground/75 line-clamp-3 hc:text-black">
          {event.description}
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-[11px] text-muted-foreground">
            Organizatör: <span className="font-semibold text-foreground hc:text-black">{event.organizer}</span>
          </div>
          <div className="flex items-center gap-2">
            {event.registrationUrl ? (
              <a
                href={event.registrationUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 rounded-full bg-card px-5 py-2 text-xs font-bold text-primary ring-1 ring-primary/30 hover:bg-primary hover:text-primary-foreground"
              >
                Katılacağım <ArrowRight aria-hidden className="size-3.5" />
              </a>
            ) : (
              <Link
                to={facilityExists ? `/facility/${event.facilityId}` : '/events'}
                className="inline-flex items-center gap-1.5 rounded-full bg-card px-5 py-2 text-xs font-bold text-primary ring-1 ring-primary/30 hover:bg-primary hover:text-primary-foreground"
              >
                Detayları Gör <ArrowRight aria-hidden className="size-3.5" />
              </Link>
            )}
            <button
              type="button"
              aria-label="Kaydet"
              className="grid size-9 place-items-center rounded-full text-foreground/70 hover:bg-card hc:bg-white"
            >
              <Bookmark aria-hidden className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
