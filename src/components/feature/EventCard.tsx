import { Link } from 'react-router-dom'
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

function formatDate(iso: string): string {
  const date = new Date(iso)
  const month = date.toLocaleDateString('tr-TR', { month: 'long', day: 'numeric' })
  const time  = date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
  return `${month} · ${time}`
}

function relativeDays(iso: string, now: number = Date.now()): string {
  const diffMs = new Date(iso).getTime() - now
  const diffDays = Math.ceil(diffMs / 86_400_000)
  if (diffDays === 0) return 'Bugün'
  if (diffDays === 1) return 'Yarın'
  if (diffDays > 0)   return `${diffDays} gün sonra`
  if (diffDays === -1) return 'Dün'
  return `${Math.abs(diffDays)} gün önce`
}

interface EventCardProps {
  event:         SportEvent
  facilityName:  string
  facilityExists: boolean
  dimmed?:       boolean
  profileMatch?: boolean
}

export function EventCard({
  event,
  facilityName,
  facilityExists,
  dimmed = false,
  profileMatch = false,
}: EventCardProps) {
  const titleId = `event-${event.id}-title`
  const sportLabel = getSportLabel(event.sport)

  return (
    <article
      aria-labelledby={titleId}
      className={
        'flex flex-col gap-3 p-5 rounded-xl border transition-colors ' +
        (dimmed
          ? 'border-white/5 bg-white/[0.02] opacity-70'
          : profileMatch
            ? 'border-uyum-purple/40 bg-uyum-purple/10 hover:border-uyum-purple/70'
            : 'border-white/10 bg-white/5 hover:border-uyum-purple/40')
      }
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <span
            className="text-3xl flex-shrink-0 leading-none mt-0.5"
            aria-hidden="true"
          >
            {getSportIcon(event.sport)}
          </span>
          <div className="min-w-0">
            <h3
              id={titleId}
              className="text-base font-heading font-semibold text-white"
            >
              {event.title}
            </h3>
            <p className="text-xs text-white/60 mt-0.5">
              {sportLabel} · {LEVEL_LABELS[event.level]}
            </p>
          </div>
        </div>
        {profileMatch && (
          <span
            className="text-[10px] uppercase tracking-wider text-uyum-frost-blue font-heading flex-shrink-0"
            aria-label="Profiline uygun"
          >
            Sana uygun
          </span>
        )}
      </header>

      <p className="text-sm font-body text-white/80 leading-relaxed line-clamp-3">
        {event.description}
      </p>

      <div className="flex flex-wrap gap-2 text-xs">
        <span className="px-2 py-0.5 rounded-md bg-white/10 text-white/80">
          📅 {formatDate(event.date)}
        </span>
        <span className="px-2 py-0.5 rounded-md bg-white/10 text-white/60">
          {relativeDays(event.date)}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5" aria-label="Engel tipleri">
        {event.disabilityTypes.map(d => (
          <span
            key={d}
            className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/10"
          >
            {DISABILITY_LABELS[d]}
          </span>
        ))}
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10 mt-auto">
        <div className="text-xs text-white/60">
          Tesis:{' '}
          {facilityExists ? (
            <Link
              to={`/facility/${event.facilityId}`}
              className="text-uyum-purple underline hover:text-uyum-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-uyum-purple rounded"
            >
              {facilityName}
            </Link>
          ) : (
            <span className="text-white/80">{facilityName}</span>
          )}
        </div>
        {event.registrationUrl && (
          <a
            href={event.registrationUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="
              text-xs font-heading font-semibold text-uyum-frost-blue hover:text-white underline
              focus-visible:outline focus-visible:outline-2 focus-visible:outline-uyum-purple rounded
            "
          >
            Kayıt linki ↗
          </a>
        )}
      </footer>

      <p className="text-[11px] text-white/40 font-body">
        Organizatör: {event.organizer}
      </p>
    </article>
  )
}
