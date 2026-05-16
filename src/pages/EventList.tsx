import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, ChevronDown, CalendarDays, ChevronLeft, ChevronRight, Plus, Bell } from 'lucide-react'
import type { SportEvent, DisabilityType, Facility, Sport } from '../types'
import { useProfile } from '../contexts/ProfileContext'
import { DemoBadge } from '../components/ui/DemoBadge'
import { FilterChip, FilterGroup } from '../components/ui/FilterChip'
import { EventCard } from '../components/feature/EventCard'
import {
  filterEvents,
  type EventFilters,
  type DateRange,
} from '../lib/event-filter'
import eventsData     from '../data/events.json'
import sportsData     from '../data/sports.json'
import facilitiesData from '../data/facilities.json'

const ALL_EVENTS:     SportEvent[] = eventsData     as SportEvent[]
const ALL_SPORTS:     Sport[]      = sportsData     as Sport[]
const ALL_FACILITIES: Facility[]   = facilitiesData as Facility[]

const SPORTS_IN_EVENTS = Array.from(new Set(ALL_EVENTS.map(e => e.sport)))
  .map(id => ALL_SPORTS.find(s => s.id === id))
  .filter((s): s is Sport => Boolean(s))

const DATE_OPTIONS: ReadonlyArray<{ id: DateRange; label: string }> = [
  { id: 'week',  label: 'Bu hafta' },
  { id: 'month', label: 'Bu ay' },
  { id: 'all',   label: 'Tümü' },
]

const DISABILITY_OPTIONS: ReadonlyArray<{ id: DisabilityType; label: string }> = [
  { id: 'wheelchair', label: 'Tekerlekli Sandalye' },
  { id: 'visual',     label: 'Görme' },
  { id: 'hearing',    label: 'İşitme' },
  { id: 'upper_limb', label: 'Üst Ekstremite' },
]

function findFacility(id: string): Facility | undefined {
  return ALL_FACILITIES.find(f => f.id === id)
}

function ParkScene() {
  return (
    <svg viewBox="0 0 480 200" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="evt-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="oklch(0.96 0.04 270)" />
          <stop offset="1" stopColor="oklch(0.985 0.005 290)" />
        </linearGradient>
      </defs>
      <rect width="480" height="200" fill="url(#evt-sky)" rx="24" />
      <g opacity="0.5" fill="oklch(0.78 0.08 270)">
        <rect x="320" y="80" width="20" height="80" />
        <rect x="345" y="60" width="24" height="100" />
        <rect x="372" y="90" width="18" height="70" />
        <rect x="395" y="70" width="22" height="90" />
        <rect x="420" y="100" width="16" height="60" />
      </g>
      <ellipse cx="80" cy="190" rx="140" ry="40" fill="oklch(0.92 0.07 145 / 0.7)" />
      <ellipse cx="380" cy="200" rx="160" ry="50" fill="oklch(0.92 0.07 145 / 0.6)" />
      <circle cx="60" cy="150" r="18" fill="oklch(0.78 0.12 145)" />
      <rect x="58" y="160" width="4" height="20" fill="oklch(0.5 0.08 60)" />
      <circle cx="430" cy="155" r="20" fill="oklch(0.78 0.12 145)" />
      <rect x="428" y="165" width="4" height="22" fill="oklch(0.5 0.08 60)" />
      <path d="M0 195 Q 240 170, 480 195" stroke="oklch(0.88 0.04 60)" strokeWidth="6" fill="none" />
      <g transform="translate(190, 90)" fill="oklch(0.55 0.14 295)">
        <circle cx="20" cy="10" r="8" />
        <path d="M10 22 L 30 22 L 32 50 L 8 50 Z" />
        <circle cx="12" cy="62" r="14" fill="none" stroke="oklch(0.55 0.14 295)" strokeWidth="2.5" />
        <circle cx="32" cy="62" r="14" fill="none" stroke="oklch(0.55 0.14 295)" strokeWidth="2.5" />
      </g>
      <g transform="translate(290, 100)" fill="oklch(0.72 0.10 270)">
        <circle cx="10" cy="8" r="6" />
        <path d="M5 16 L 16 16 L 18 38 L 14 50 L 18 50 L 22 38 L 24 18 Z" />
      </g>
    </svg>
  )
}

function Calendar() {
  const days = Array.from({ length: 31 }, (_, i) => i + 1)
  const today = new Date().getDate()
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          aria-label="Önceki ay"
          className="grid size-8 place-items-center rounded-full text-foreground/70 ring-1 ring-border/60 hover:bg-card"
        >
          <ChevronLeft className="size-4" aria-hidden />
        </button>
        <span className="font-display text-base font-extrabold text-primary-deep">
          {new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
        </span>
        <button
          type="button"
          aria-label="Sonraki ay"
          className="grid size-8 place-items-center rounded-full text-foreground/70 ring-1 ring-border/60 hover:bg-card"
        >
          <ChevronRight className="size-4" aria-hidden />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-muted-foreground">
        {['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'].map(d => <span key={d}>{d}</span>)}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1 text-center text-xs">
        {days.map(d => (
          <span
            key={d}
            className={`grid h-9 place-items-center rounded-xl ${
              d === today
                ? 'bg-primary font-bold text-primary-foreground shadow-glow'
                : 'text-foreground/70 hover:bg-card'
            }`}
          >
            {d}
          </span>
        ))}
      </div>
    </div>
  )
}

export function EventList() {
  const { profile } = useProfile()
  const [now] = useState<number>(() => Date.now())
  const [filters, setFilters] = useState<EventFilters>({
    dateRange:      'all',
    sport:          'all',
    disabilityType: 'all',
  })

  const { upcoming, past } = useMemo(
    () => filterEvents(filters, profile, ALL_EVENTS, now),
    [filters, profile, now],
  )

  const isFiltered =
    filters.dateRange !== 'all' ||
    filters.sport !== 'all' ||
    filters.disabilityType !== 'all'

  function clearFilters() {
    setFilters({ dateRange: 'all', sport: 'all', disabilityType: 'all' })
  }

  if (!profile) return null

  return (
    <div className="mx-auto max-w-7xl pt-2">
      {/* Hero */}
      <header className="relative mb-10 grid items-end gap-10 md:grid-cols-12">
        <div className="md:col-span-7">
          <h1 className="font-display text-[clamp(2rem,4.4vw,3.4rem)] font-extrabold leading-[1.04] tracking-tight text-primary-deep">
            Etkinlikler
          </h1>
          <p className="mt-3 flex max-w-lg flex-wrap items-center gap-3 text-base text-muted-foreground">
            Profiline ve ilgi alanlarına göre senin için sıralanan etkinlikleri keşfet, katıl ve yeni deneyimler kazan.
            <DemoBadge />
          </p>
        </div>
        <div className="relative h-40 md:col-span-5">
          <ParkScene />
        </div>
      </header>

      {/* Filters */}
      <div className="mb-8 space-y-3 rounded-3xl bg-card/85 p-4 ring-1 ring-border/40 backdrop-blur">
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-glow"
          >
            <Sparkles className="size-4" aria-hidden /> Senin için
          </button>
        </div>

        <FilterGroup label="Tarih">
          {DATE_OPTIONS.map(opt => (
            <FilterChip
              key={opt.id}
              role="radio"
              active={filters.dateRange === opt.id}
              onClick={() => setFilters(f => ({ ...f, dateRange: opt.id }))}
            >
              {opt.label}
            </FilterChip>
          ))}
        </FilterGroup>

        <FilterGroup label="Spor">
          <FilterChip
            role="radio"
            active={filters.sport === 'all'}
            onClick={() => setFilters(f => ({ ...f, sport: 'all' }))}
          >
            Hepsi
          </FilterChip>
          {SPORTS_IN_EVENTS.map(s => (
            <FilterChip
              key={s.id}
              role="radio"
              active={filters.sport === s.id}
              onClick={() => setFilters(f => ({ ...f, sport: s.id }))}
            >
              {s.name}
            </FilterChip>
          ))}
        </FilterGroup>

        <FilterGroup label="Engel tipi">
          <FilterChip
            role="radio"
            active={filters.disabilityType === 'all'}
            onClick={() => setFilters(f => ({ ...f, disabilityType: 'all' }))}
          >
            Hepsi
          </FilterChip>
          {DISABILITY_OPTIONS.map(opt => (
            <FilterChip
              key={opt.id}
              role="radio"
              active={filters.disabilityType === opt.id}
              onClick={() => setFilters(f => ({ ...f, disabilityType: opt.id }))}
            >
              {opt.label}
            </FilterChip>
          ))}
        </FilterGroup>

        {isFiltered && (
          <div className="pt-2">
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-bold text-primary underline-offset-2 hover:underline"
            >
              Filtreleri temizle
            </button>
          </div>
        )}
      </div>

      <div className="grid gap-12 xl:grid-cols-[1fr_22rem]">
        {/* Main events */}
        <section aria-labelledby="upcoming-heading">
          <div className="mb-7 flex flex-wrap items-end gap-3">
            <h2 id="upcoming-heading" className="font-display text-xl font-extrabold text-primary-deep">
              Sana özel önerilen etkinlikler
            </h2>
            {upcoming.length > 0 && (
              <span className="rounded-full bg-mint/50 px-3 py-1 text-[11px] font-bold text-mint-foreground">
                {upcoming.length} etkinlik
              </span>
            )}
          </div>

          {upcoming.length > 0 ? (
            <div className="space-y-10">
              {upcoming.map(event => {
                const facility = findFacility(event.facilityId)
                const isMatch = event.disabilityTypes.includes(profile.disabilityType)
                return (
                  <EventCard
                    key={event.id}
                    event={event}
                    facilityName={facility?.name ?? 'Bilinmeyen tesis'}
                    facilityExists={!!facility}
                    now={now}
                    profileMatch={isMatch}
                  />
                )
              })}
            </div>
          ) : (
            <div
              role="status"
              className="rounded-3xl bg-card p-6 text-center ring-1 ring-border/40"
            >
              <p className="text-sm text-foreground/85">
                Bu filtreyle eşleşen yaklaşan etkinlik yok.
              </p>
              {isFiltered && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-3 text-sm font-bold text-primary underline"
                >
                  Filtreleri temizle
                </button>
              )}
            </div>
          )}

          {past.length > 0 && (
            <section aria-labelledby="past-heading" className="mt-12 border-t border-border/40 pt-6">
              <h2
                id="past-heading"
                className="mb-5 text-sm font-bold uppercase tracking-wider text-muted-foreground"
              >
                Geçmiş Etkinlikler ({past.length})
              </h2>
              <div className="space-y-10">
                {past.map(event => {
                  const facility = findFacility(event.facilityId)
                  return (
                    <EventCard
                      key={event.id}
                      event={event}
                      facilityName={facility?.name ?? 'Bilinmeyen tesis'}
                      facilityExists={!!facility}
                      now={now}
                      dimmed
                    />
                  )
                })}
              </div>
            </section>
          )}
        </section>

        {/* Aside */}
        <aside className="space-y-10">
          <Calendar />

          <div>
            <div className="mb-4 flex items-end justify-between">
              <h3 className="inline-flex items-center gap-2 font-display text-base font-extrabold text-primary-deep">
                <CalendarDays aria-hidden className="size-4 text-primary" /> Yaklaşan etkinliklerin
              </h3>
              <Link to="/events" className="text-xs font-semibold text-primary">Tümü →</Link>
            </div>
            <ul className="space-y-5">
              {upcoming.slice(0, 3).map(event => {
                const facility = findFacility(event.facilityId)
                return (
                  <li key={event.id} className="flex gap-3">
                    <div
                      aria-hidden
                      className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-brand text-xl text-primary-foreground"
                    >
                      {new Date(event.date).getDate()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-bold text-foreground hc:text-black">{event.title}</div>
                      <div className="text-[11.5px] text-muted-foreground">
                        {new Date(event.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                      </div>
                      <div className="truncate text-[11px] text-muted-foreground">
                        <span aria-hidden>📍</span> {facility?.name ?? 'Tesis'}
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-deep px-6 py-7 text-primary-foreground">
            <div aria-hidden className="absolute -right-8 -top-8 size-40 rounded-full bg-mint/25 blur-2xl" />
            <Plus aria-hidden className="size-7 opacity-90" />
            <h3 className="mt-3 font-display text-lg font-extrabold">Kendi etkinliğini oluştur</h3>
            <p className="mt-1 text-[12.5px] text-primary-foreground/75">
              Topluluğunu davet et, birlikte hareket edin.
            </p>
            <Link
              to="/community"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-xs font-bold text-primary-deep"
            >
              Etkinlik oluştur <ChevronDown aria-hidden className="size-3.5 -rotate-90" />
            </Link>
          </div>

          <div className="flex items-start gap-3">
            <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full bg-mint/60 text-mint-foreground">
              <Bell className="size-4" />
            </span>
            <div>
              <div className="text-sm font-bold text-foreground hc:text-black">Uygun etkinliklerden haberdar ol</div>
              <p className="mt-1 text-[12px] text-muted-foreground">
                Profiline uygun yeni etkinlikler açıldığında sana bildiririz.
              </p>
              <button type="button" className="mt-3 text-xs font-bold text-primary">Bildirimleri aç →</button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
