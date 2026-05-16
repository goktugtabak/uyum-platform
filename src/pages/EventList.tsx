import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
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

const SPORTS_IN_EVENTS = Array.from(
  new Set(ALL_EVENTS.map(e => e.sport)),
)
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
    filters.dateRange      !== 'all' ||
    filters.sport          !== 'all' ||
    filters.disabilityType !== 'all'

  function clearFilters() {
    setFilters({ dateRange: 'all', sport: 'all', disabilityType: 'all' })
  }

  if (!profile) return null

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white mb-2">
            Yaklaşan Etkinlikler
          </h1>
          <p className="text-sm text-white/60 font-body max-w-2xl">
            Ankara'da adaptif spor etkinlikleri. Hazır hissettiğinde gidersin —
            performans dayatması yok.
          </p>
        </div>
        <DemoBadge label="Etkinlik verileri mock" />
      </header>

      <section
        aria-labelledby="event-filters-heading"
        className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3"
      >
        <h2
          id="event-filters-heading"
          className="text-xs uppercase tracking-wider text-white/60 font-heading"
        >
          Filtreler
        </h2>

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
          <div className="pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={clearFilters}
              className="
                text-xs font-body text-uyum-frost-blue hover:text-white underline
                focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
                focus-visible:outline-uyum-purple rounded
              "
            >
              Filtreleri temizle
            </button>
          </div>
        )}
      </section>

      {/* Upcoming events */}
      {upcoming.length > 0 ? (
        <section aria-labelledby="upcoming-heading" className="space-y-4">
          <h2
            id="upcoming-heading"
            className="text-lg font-heading font-semibold text-white"
          >
            Gelecek Etkinlikler ({upcoming.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcoming.map(event => {
              const facility = findFacility(event.facilityId)
              const isMatch  = event.disabilityTypes.includes(profile.disabilityType)
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
        </section>
      ) : (
        <div
          role="status"
          className="rounded-xl border border-white/10 bg-white/5 p-6 text-center space-y-3"
        >
          <p className="text-white/80 font-body">
            Bu filtreyle eşleşen yaklaşan etkinlik yok.
          </p>
          {isFiltered && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm text-uyum-frost-blue underline hover:text-white"
            >
              Filtreleri temizle
            </button>
          )}
        </div>
      )}

      {/* Past events (only when no date filter) */}
      {past.length > 0 && (
        <section aria-labelledby="past-heading" className="space-y-3 pt-4 border-t border-white/10">
          <h2
            id="past-heading"
            className="text-sm uppercase tracking-wider text-white/50 font-heading"
          >
            Geçmiş Etkinlikler
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      <div className="pt-4 border-t border-white/10">
        <Link
          to="/"
          className="text-sm text-uyum-purple underline hover:text-uyum-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-uyum-purple"
        >
          ← Ana sayfaya dön
        </Link>
      </div>
    </div>
  )
}
