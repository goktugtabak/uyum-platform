import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import type { Facility, SportEvent, DisabilityType, Testimony } from '../../types'
import { loadTestimonies } from '../../lib/testimony-store'
import { formatRelative } from '../../lib/live-status'
import eventsData from '../../data/events.json'

const DISABILITY_LABELS: Record<DisabilityType, string> = {
  wheelchair: 'Tekerlekli Sandalye',
  upper_limb: 'Üst Ekstremite',
  visual:     'Görme Engelli',
  hearing:    'İşitme Engelli',
}

function relativeDays(dateIso: string, now: Date = new Date()): string {
  const diffMs = new Date(dateIso).getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / 86_400_000)
  if (diffDays <= 0) return 'Bugün'
  if (diffDays === 1) return '1 gün sonra'
  return `${diffDays} gün sonra`
}

function getFacilityName(facilities: Facility[], id: string): string {
  return facilities.find(f => f.id === id)?.name ?? 'Tesis'
}

interface Props {
  facilities: Facility[]
}

export function CommunityFeed({ facilities }: Props) {
  const testimonies: Testimony[] = useMemo(
    () => loadTestimonies().slice(0, 3),
    [],
  )

  const upcomingEvent: SportEvent | null = useMemo(() => {
    const now = Date.now()
    const future = (eventsData as SportEvent[])
      .filter(e => new Date(e.date).getTime() > now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    return future[0] ?? null
  }, [])

  return (
    <div className="space-y-4">
      {/* Tanıklıklar */}
      {testimonies.length === 0 ? (
        <p className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
          Henüz tanıklık paylaşılmamış. İlk paylaşan sen ol — bir tesisi aç ve deneyimini yaz.
        </p>
      ) : (
        <ul role="list" className="space-y-2">
          {testimonies.map(t => {
            const name = t.anonymous || !t.displayName ? 'Anonim' : t.displayName
            return (
              <li
                key={t.id}
                className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                  <div className="flex items-center gap-2 text-white/70">
                    <span className="font-medium text-white">{name}</span>
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/80">
                      {DISABILITY_LABELS[t.disabilityType]}
                    </span>
                    <Link
                      to={`/facility/${t.facilityId}`}
                      className="underline text-uyum-purple hover:text-uyum-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-uyum-purple rounded"
                    >
                      {getFacilityName(facilities, t.facilityId)}
                    </Link>
                  </div>
                  <span className="text-white/50">{formatRelative(t.timestamp)}</span>
                </div>
                <p className="text-sm text-white/90 line-clamp-2">{t.text}</p>
              </li>
            )
          })}
        </ul>
      )}

      {/* Yakın etkinlik */}
      {upcomingEvent ? (
        <article className="rounded-xl border border-uyum-purple/30 bg-uyum-purple/10 p-4 space-y-1">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-uyum-purple font-heading">
            <span aria-hidden="true">📅</span>
            <span>Yakın Etkinlik</span>
          </div>
          <h4 className="font-heading font-semibold text-white text-base">
            {upcomingEvent.title}
          </h4>
          <p className="text-xs text-white/70">
            {getFacilityName(facilities, upcomingEvent.facilityId)}
            {' · '}
            {relativeDays(upcomingEvent.date)}
            {' · '}
            <span className="capitalize">{upcomingEvent.level}</span>
          </p>
        </article>
      ) : (
        <p className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
          Yakında planlı etkinlik yok — <Link to="/events" className="underline text-uyum-purple">tüm etkinliklere</Link> göz at.
        </p>
      )}
    </div>
  )
}
