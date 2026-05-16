import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, X, MessageCircleQuestion } from 'lucide-react'
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

  const rawSport = params.get('sport') ?? undefined
  const rawFacility = params.get('facility') ?? undefined

  const facility = rawFacility
    ? ALL_FACILITIES.find(f => f.id === rawFacility)
    : undefined
  const sportKnown = rawSport ? ALL_COACHES.some(c => c.sports.includes(rawSport)) : true
  const sportLabel = rawSport ? getSportLabel(rawSport) : undefined

  useEffect(() => {
    if (rawSport && !sportKnown) console.warn(`[CoachDirectory] Unknown sport id: ${rawSport}`)
    if (rawFacility && !facility) console.warn(`[CoachDirectory] Unknown facility id: ${rawFacility}`)
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
    <div className="mx-auto max-w-7xl pt-2">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary"
      >
        <ArrowLeft aria-hidden className="size-3.5" /> Ana Sayfa / Koçlar
      </Link>

      <header className="mb-10">
        <h1 className="font-display text-[clamp(2rem,4vw,3rem)] font-extrabold leading-[1.04] tracking-tight text-primary-deep">
          Koçlar &amp; Antrenörler
        </h1>
        <p className="mt-3 flex max-w-2xl flex-wrap items-center gap-3 text-base text-muted-foreground">
          Sana en uygun, deneyimli, alanında uzman koçlarla tanış.
          <DemoBadge label="Koç verileri mock" />
        </p>
      </header>

      {(sportLabel || facility) && (
        <div className="mb-5 flex flex-wrap items-center gap-2">
          {sportLabel && (
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
              Spor: <strong>{sportLabel}</strong>
              <button
                type="button"
                onClick={clearSport}
                aria-label="Spor filtresini temizle"
                className="grid size-4 place-items-center rounded-full bg-primary/20 hover:bg-primary/30"
              >
                <X className="size-3" aria-hidden />
              </button>
            </span>
          )}
          {facility && (
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
              Tesis: <strong>{facility.name}</strong>
              <button
                type="button"
                onClick={clearFacility}
                aria-label="Tesis filtresini temizle"
                className="grid size-4 place-items-center rounded-full bg-primary/20 hover:bg-primary/30"
              >
                <X className="size-3" aria-hidden />
              </button>
            </span>
          )}
        </div>
      )}

      <div className="mb-8 space-y-3 rounded-3xl bg-card/85 p-4 ring-1 ring-border/40 backdrop-blur">
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
          <div className="pt-2">
            <button
              type="button"
              onClick={clearAll}
              className="text-xs font-bold text-primary underline-offset-2 hover:underline"
            >
              Tüm filtreleri temizle
            </button>
          </div>
        )}
      </div>

      {results.length === 0 ? (
        <div role="status" className="rounded-3xl bg-card p-8 text-center ring-1 ring-border/40">
          <p className="text-sm text-foreground/85">Bu filtreyle eşleşen koç yok.</p>
          <button
            type="button"
            onClick={clearAll}
            className="mt-3 text-sm font-bold text-primary underline"
          >
            Filtreleri temizle
          </button>
        </div>
      ) : (
        <section
          aria-label="Koç dizini sonuçları"
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
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

      <section className="mt-16 flex flex-wrap items-center justify-between gap-6 rounded-[2rem] bg-accent/8 px-7 py-6">
        <div className="flex items-center gap-4">
          <span aria-hidden className="grid size-12 place-items-center rounded-2xl bg-card text-primary-deep">
            <MessageCircleQuestion className="size-5" />
          </span>
          <div>
            <div className="font-bold text-primary-deep">İhtiyacın olan koçu bulamadın mı?</div>
            <div className="text-xs text-muted-foreground">
              Topluluğa ihtiyacını sor, ekip sana uygun koçları yönlendirsin.
            </div>
          </div>
        </div>
        <Link
          to="/community"
          className="inline-flex items-center gap-2 rounded-full bg-primary-deep px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-glow"
        >
          Topluluğa sor <ArrowRight aria-hidden className="size-3.5" />
        </Link>
      </section>
    </div>
  )
}
