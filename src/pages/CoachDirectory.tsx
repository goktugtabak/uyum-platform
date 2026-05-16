import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import type { Coach, Facility, DisabilityType } from '../types'
import { useProfile } from '../contexts/ProfileContext'
import { DemoBadge } from '../components/ui/DemoBadge'
import { FilterChip, FilterGroup } from '../components/ui/FilterChip'
import { CoachCard } from '../components/feature/CoachCard'
import { filterCoaches } from '../lib/coach-filter'
import { getSportLabel } from '../lib/sport-icons'
import coachesData    from '../data/coaches.json'
import facilitiesData from '../data/facilities.json'

const ALL_COACHES:    Coach[]    = coachesData    as Coach[]
const ALL_FACILITIES: Facility[] = facilitiesData as Facility[]

const DISABILITY_OPTIONS: ReadonlyArray<{ id: DisabilityType; label: string }> = [
  { id: 'wheelchair', label: 'Tekerlekli Sandalye' },
  { id: 'visual',     label: 'Görme' },
  { id: 'hearing',    label: 'İşitme' },
  { id: 'upper_limb', label: 'Üst Ekstremite' },
]

function toggle<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item]
}

export function CoachDirectory() {
  const { profile } = useProfile()
  const [params, setParams] = useSearchParams()
  const [expertise, setExpertise] = useState<DisabilityType[]>([])

  const rawSport    = params.get('sport') ?? undefined
  const rawFacility = params.get('facility') ?? undefined

  const facility = rawFacility
    ? ALL_FACILITIES.find(f => f.id === rawFacility)
    : undefined
  const sportKnown = rawSport ? ALL_COACHES.some(c => c.sports.includes(rawSport)) : true
  const sportLabel = rawSport ? getSportLabel(rawSport) : undefined

  useEffect(() => {
    if (rawSport && !sportKnown) {
      console.warn(`[CoachDirectory] Unknown sport id in query: ${rawSport}`)
    }
    if (rawFacility && !facility) {
      console.warn(`[CoachDirectory] Unknown facility id in query: ${rawFacility}`)
    }
  }, [rawSport, rawFacility, facility, sportKnown])

  const results = useMemo(() => {
    return filterCoaches(
      {
        sportId:    rawSport,
        facilityId: rawFacility,
        expertise:  expertise.length > 0 ? expertise : undefined,
      },
      profile,
      ALL_COACHES,
    )
  }, [rawSport, rawFacility, expertise, profile])

  const isFiltered = !!rawSport || !!rawFacility || expertise.length > 0

  function clearAll() {
    setParams({})
    setExpertise([])
  }

  function clearSport() {
    const next = new URLSearchParams(params)
    next.delete('sport')
    setParams(next)
  }

  function clearFacility() {
    const next = new URLSearchParams(params)
    next.delete('facility')
    setParams(next)
  }

  if (!profile) return null

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white mb-2">
            Koç & Antrenör Dizini
          </h1>
          <p className="text-sm text-white/60 font-body max-w-2xl">
            Engel tipi uzmanlığı olan koçlar. Profilinle uyumlu olanlar listenin başında.
          </p>
        </div>
        <DemoBadge label="Koç verileri mock" />
      </header>

      {(sportLabel || facility) && (
        <div className="flex flex-wrap items-center gap-2">
          {sportLabel && (
            <span className="
              inline-flex items-center gap-2 text-xs
              px-3 py-1.5 rounded-full
              bg-uyum-purple/20 text-uyum-frost-blue border border-uyum-purple/40
            ">
              Spor filtresi: <strong className="font-heading">{sportLabel}</strong>
              <button
                type="button"
                onClick={clearSport}
                aria-label="Spor filtresini temizle"
                className="text-white/70 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-uyum-purple rounded"
              >
                ×
              </button>
            </span>
          )}
          {facility && (
            <span className="
              inline-flex items-center gap-2 text-xs
              px-3 py-1.5 rounded-full
              bg-uyum-purple/20 text-uyum-frost-blue border border-uyum-purple/40
            ">
              Tesis filtresi: <strong className="font-heading">{facility.name}</strong>
              <button
                type="button"
                onClick={clearFacility}
                aria-label="Tesis filtresini temizle"
                className="text-white/70 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-uyum-purple rounded"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}

      <section
        aria-labelledby="coach-filters-heading"
        className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3"
      >
        <h2
          id="coach-filters-heading"
          className="text-xs uppercase tracking-wider text-white/60 font-heading"
        >
          Engel uzmanlığı (çoklu seçim)
        </h2>

        <FilterGroup label="Engel uzmanlığı" multi>
          {DISABILITY_OPTIONS.map(opt => (
            <FilterChip
              key={opt.id}
              active={expertise.includes(opt.id)}
              onClick={() => setExpertise(prev => toggle(prev, opt.id))}
            >
              {opt.label}
            </FilterChip>
          ))}
        </FilterGroup>

        {isFiltered && (
          <div className="pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={clearAll}
              className="
                text-xs font-body text-uyum-frost-blue hover:text-white underline
                focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
                focus-visible:outline-uyum-purple rounded
              "
            >
              Tüm filtreleri temizle
            </button>
          </div>
        )}
      </section>

      {results.length === 0 ? (
        <div
          role="status"
          className="rounded-xl border border-white/10 bg-white/5 p-8 text-center space-y-3"
        >
          <p className="text-white/80 font-body">
            Bu filtreyle eşleşen koç yok.
          </p>
          <button
            type="button"
            onClick={clearAll}
            className="text-sm text-uyum-frost-blue underline hover:text-white"
          >
            Filtreleri temizle
          </button>
        </div>
      ) : (
        <section
          aria-label="Koç dizini sonuçları"
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {results.map(coach => {
            const isMatch = coach.disabilityExpertise.includes(profile.disabilityType)
            return (
              <CoachCard
                key={coach.id}
                coach={coach}
                facilities={ALL_FACILITIES}
                profileMatch={isMatch}
              />
            )
          })}
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
