import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, CalendarDays } from 'lucide-react'
import type { Facility, SportEvent, DisabilityType, Testimony } from '../../types'
import { loadTestimonies } from '../../lib/testimony-store'
import { formatRelative } from '../../lib/live-status'
import eventsData from '../../data/events.json'

const SORTED_EVENTS: SportEvent[] = (eventsData as SportEvent[])
  .slice()
  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

function findUpcomingEvent(now: number = Date.now()): SportEvent | null {
  return SORTED_EVENTS.find(e => new Date(e.date).getTime() > now) ?? null
}

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
  const [testimonies] = useState<Testimony[]>(() => loadTestimonies().slice(0, 3))
  const [upcomingEvent] = useState<SportEvent | null>(() => findUpcomingEvent())

  return (
    <div className="space-y-6">
      {testimonies.length === 0 ? (
        <p className="rounded-2xl bg-card p-4 text-sm text-muted-foreground ring-1 ring-border/40">
          Henüz tanıklık paylaşılmamış. İlk paylaşan sen ol — bir tesisi aç ve deneyimini yaz.
        </p>
      ) : (
        <ul role="list" className="space-y-5">
          {testimonies.map(t => {
            const name = t.anonymous || !t.displayName ? 'Anonim' : t.displayName
            return (
              <li key={t.id}>
                <article className="space-y-2">
                  <header className="flex items-center gap-3">
                    <div
                      aria-hidden
                      className="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-brand text-xs font-bold text-primary-foreground"
                    >
                      {name[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-foreground hc:text-black">{name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {formatRelative(t.timestamp)} ·{' '}
                        <Link
                          to={`/facility/${t.facilityId}`}
                          className="underline-offset-2 hover:underline hover:text-primary"
                        >
                          {getFacilityName(facilities, t.facilityId)}
                        </Link>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent">
                      {DISABILITY_LABELS[t.disabilityType]}
                    </span>
                  </header>
                  <p className="text-[14px] leading-relaxed text-foreground/90 line-clamp-3 hc:text-black">
                    {t.text}
                  </p>
                  <footer className="flex items-center gap-5 text-[12.5px] text-muted-foreground">
                    <span className="ml-auto inline-flex items-center gap-1.5 font-semibold text-destructive">
                      <Heart aria-hidden className="size-3.5 fill-current" /> Destekle
                    </span>
                  </footer>
                </article>
              </li>
            )
          })}
        </ul>
      )}

      {upcomingEvent ? (
        <article className="rounded-2xl bg-mint/30 p-4 ring-1 ring-mint">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-mint-foreground">
            <CalendarDays aria-hidden className="size-3.5" />
            <span>Yakın Etkinlik</span>
          </div>
          <h4 className="mt-1 font-display text-base font-bold text-primary-deep">
            {upcomingEvent.title}
          </h4>
          <p className="text-xs text-foreground/70 hc:text-black">
            {getFacilityName(facilities, upcomingEvent.facilityId)}
            {' · '}
            {relativeDays(upcomingEvent.date)}
            {' · '}
            <span className="capitalize">{upcomingEvent.level}</span>
          </p>
        </article>
      ) : (
        <p className="rounded-2xl bg-card p-4 text-sm text-muted-foreground ring-1 ring-border/40">
          Yakında planlı etkinlik yok —{' '}
          <Link to="/events" className="text-primary underline">
            tüm etkinliklere
          </Link>{' '}
          göz at.
        </p>
      )}
    </div>
  )
}
