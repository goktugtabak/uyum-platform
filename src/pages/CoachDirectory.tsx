import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft, ArrowRight, MessageCircleQuestion,
} from 'lucide-react'
import { FilterDropdown, type DropdownOption } from '../components/ui/FilterDropdown'
import { ActiveFilterChip } from '../components/ui/ActiveFilterChip'
import type { Coach, Facility, DisabilityType } from '../types'
import { useProfile } from '../contexts/ProfileContext'
import { CoachCard } from '../components/feature/CoachCard'
import { filterCoaches } from '../lib/coach-filter'
import { getSportLabel } from '../lib/sport-icons'
import coachesData    from '../data/coaches.json'
import facilitiesData from '../data/facilities.json'
import dashHero from '../assets/dashboard-hero.jpg'

const ALL_COACHES:    Coach[]    = coachesData    as Coach[]
const ALL_FACILITIES: Facility[] = facilitiesData as Facility[]

/* ----- Real filter universes from data ----- */

const ALL_SPORTS = Array.from(new Set(ALL_COACHES.flatMap(c => c.sports)))
const ALL_CITIES = Array.from(new Set(ALL_COACHES.map(c => c.city)))

const DISABILITY_OPTIONS: ReadonlyArray<{ value: DisabilityType; label: string }> = [
  { value: 'wheelchair', label: 'Tekerlekli Sandalye' },
  { value: 'visual',     label: 'Görme' },
  { value: 'hearing',    label: 'İşitme' },
  { value: 'upper_limb', label: 'Üst Ekstremite' },
]

const EXPERIENCE_OPTIONS: ReadonlyArray<{ value: string; label: string; min: number }> = [
  { value: 'all', label: 'Tümü',        min: 0  },
  { value: '5',   label: '5+ yıl',      min: 5  },
  { value: '10',  label: '10+ yıl',     min: 10 },
  { value: '15',  label: '15+ yıl',     min: 15 },
]

type SortBy = 'recommended' | 'experience-desc' | 'name-asc'

const SORT_OPTIONS: ReadonlyArray<{ value: SortBy; label: string }> = [
  { value: 'recommended',     label: 'Önerilen'           },
  { value: 'experience-desc', label: 'Deneyime göre'      },
  { value: 'name-asc',        label: 'İsim (A→Z)'         },
]

interface FilterState {
  expertise: DisabilityType | 'all'
  city:      string | 'all'
  exp:       string // '5' | '10' | '15' | 'all'
  sort:      SortBy
}

const DEFAULT_FILTERS: FilterState = {
  expertise: 'all',
  city:      'all',
  exp:       'all',
  sort:      'recommended',
}

/* ----- Page ----- */

export function CoachDirectory() {
  const { profile } = useProfile()
  const [params, setParams] = useSearchParams()
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [openDD, setOpenDD] = useState<string | null>(null)

  const rawSport     = params.get('sport') ?? undefined
  const rawFacility  = params.get('facility') ?? undefined
  const sportFromUrl = rawSport
  const facility     = rawFacility
    ? ALL_FACILITIES.find(f => f.id === rawFacility)
    : undefined
  const sportKnown   = sportFromUrl ? ALL_COACHES.some(c => c.sports.includes(sportFromUrl)) : true
  const sportLabel   = sportFromUrl ? getSportLabel(sportFromUrl) : undefined

  useEffect(() => {
    if (sportFromUrl && !sportKnown) console.warn(`[CoachDirectory] Unknown sport id: ${sportFromUrl}`)
    if (rawFacility && !facility) console.warn(`[CoachDirectory] Unknown facility id: ${rawFacility}`)
  }, [sportFromUrl, rawFacility, facility, sportKnown])

  // Filter pipeline: filterCoaches (sport+facility+expertise) → city/exp post-filter → sort
  const results = useMemo(() => {
    const minExp = EXPERIENCE_OPTIONS.find(o => o.value === filters.exp)?.min ?? 0
    const base = filterCoaches(
      {
        sportId:    sportFromUrl,
        facilityId: rawFacility,
        expertise:  filters.expertise !== 'all' ? [filters.expertise] : undefined,
      },
      profile,
      ALL_COACHES,
    )
    let out = base.filter(c => {
      if (filters.city !== 'all' && c.city !== filters.city) return false
      if (c.yearsExperience < minExp) return false
      return true
    })

    if (filters.sort === 'experience-desc') {
      out = [...out].sort((a, b) => b.yearsExperience - a.yearsExperience)
    } else if (filters.sort === 'name-asc') {
      out = [...out].sort((a, b) => a.name.localeCompare(b.name, 'tr'))
    }
    // 'recommended' uses filterCoaches's profile-match-first sort already.
    return out
  }, [sportFromUrl, rawFacility, filters, profile])

  const isFiltered =
    !!sportFromUrl ||
    !!rawFacility ||
    filters.expertise !== 'all' ||
    filters.city      !== 'all' ||
    filters.exp       !== 'all' ||
    filters.sort      !== 'recommended'

  function patch(partial: Partial<FilterState>) {
    setFilters(f => ({ ...f, ...partial }))
  }
  function clearAll() {
    setParams({})
    setFilters(DEFAULT_FILTERS)
  }
  function clearSport() {
    const next = new URLSearchParams(params); next.delete('sport'); setParams(next)
  }
  function clearFacility() {
    const next = new URLSearchParams(params); next.delete('facility'); setParams(next)
  }
  function toggleDD(key: string) {
    setOpenDD(prev => (prev === key ? null : key))
  }

  if (!profile) return null

  const sportOptions: DropdownOption[] = [
    { value: 'all', label: 'Tümü' },
    ...ALL_SPORTS.map(id => ({ value: id, label: getSportLabel(id) })),
  ]
  const expertiseOptions: DropdownOption[] = [
    { value: 'all', label: 'Tümü' },
    ...DISABILITY_OPTIONS.map(o => ({ value: o.value, label: o.label })),
  ]
  const cityOptions: DropdownOption[] = [
    { value: 'all', label: 'Tümü' },
    ...ALL_CITIES.map(c => ({ value: c, label: c })),
  ]
  const experienceOptions: DropdownOption[] = EXPERIENCE_OPTIONS.map(o => ({ value: o.value, label: o.label }))
  const sortOptions: DropdownOption[] = SORT_OPTIONS.map(o => ({ value: o.value, label: o.label }))

  return (
    <div className="mx-auto max-w-7xl pt-2">
      <Link
        to="/dashboard"
        className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="size-3.5" aria-hidden /> Ana Sayfa / Koçlar & Antrenörler
      </Link>

      {/* Hero — title + open photo fading into canvas (Dashboard style) */}
      <header className="relative mb-10 grid items-center gap-8 md:grid-cols-12">
        <div className="md:col-span-7">
          <h1 className="text-[clamp(2.4rem,4.4vw,3.6rem)] font-extrabold leading-[1.04] tracking-tight text-primary-deep">
            Koçlar &amp; Antrenörler
          </h1>
          <p className="mt-3 max-w-xl text-base text-muted-foreground">
            Sana en uygun, alanında uzman koçlarla tanış; profil bilgilerine göre öne çıkanları gör.
          </p>
        </div>
        <div className="relative h-48 md:col-span-5 md:h-64">
          <img
            src={dashHero}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover"
            style={{
              WebkitMaskImage:
                'linear-gradient(to left, black 60%, transparent), linear-gradient(to bottom, black 75%, transparent)',
              WebkitMaskComposite: 'source-in',
              maskImage:
                'linear-gradient(to left, black 60%, transparent), linear-gradient(to bottom, black 75%, transparent)',
              maskComposite: 'intersect',
            }}
          />
        </div>
      </header>

      {/* URL-source filter chips (sport + facility) */}
      {(sportLabel || facility) && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {sportLabel && (
            <ActiveFilterChip label={`Spor: ${sportLabel}`} onRemove={clearSport} />
          )}
          {facility && (
            <ActiveFilterChip label={`Tesis: ${facility.name}`} onRemove={clearFacility} />
          )}
        </div>
      )}

      {/* Filter row — design's label-above-value dropdowns */}
      <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <FilterDropdown
          label="Spor Dalı"
          value={sportFromUrl ?? 'all'}
          options={sportOptions}
          onChange={v => {
            const next = new URLSearchParams(params)
            if (v === 'all') next.delete('sport'); else next.set('sport', v)
            setParams(next)
          }}
          open={openDD === 'sport'}
          onToggle={() => toggleDD('sport')}
        />
        <FilterDropdown
          label="Uzmanlık"
          value={filters.expertise}
          options={expertiseOptions}
          onChange={v => patch({ expertise: v as FilterState['expertise'] })}
          open={openDD === 'expertise'}
          onToggle={() => toggleDD('expertise')}
        />
        <FilterDropdown
          label="Şehir"
          value={filters.city}
          options={cityOptions}
          onChange={v => patch({ city: v })}
          open={openDD === 'city'}
          onToggle={() => toggleDD('city')}
        />
        <FilterDropdown
          label="Deneyim"
          value={filters.exp}
          options={experienceOptions}
          onChange={v => patch({ exp: v })}
          open={openDD === 'exp'}
          onToggle={() => toggleDD('exp')}
        />
        <FilterDropdown
          label="Sırala:"
          value={filters.sort}
          options={sortOptions}
          onChange={v => patch({ sort: v as SortBy })}
          open={openDD === 'sort'}
          onToggle={() => toggleDD('sort')}
        />
      </div>

      {/* Toolbar */}
      <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-2xl font-extrabold text-primary-deep">
          Sonuçlar{' '}
          <span className="ml-2 text-sm font-semibold text-muted-foreground">
            {results.length} koç bulundu
          </span>
        </h2>
        {isFiltered && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-bold text-primary underline-offset-2 hover:underline"
          >
            Filtreleri temizle
          </button>
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
          className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3"
        >
          {results.map(coach => (
            <CoachCard
              key={coach.id}
              coach={coach}
              facilities={ALL_FACILITIES}
              profileMatch={coach.disabilityExpertise.some(d => profile.disabilityTypes.includes(d))}
            />
          ))}
        </section>
      )}

      {/* Footer ask block */}
      <section className="mt-16 flex flex-wrap items-center justify-between gap-6 rounded-[2rem] bg-accent/10 px-7 py-6">
        <div className="flex items-center gap-4">
          <span aria-hidden className="grid size-12 place-items-center rounded-2xl bg-white text-primary-deep">
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
          Topluluğa sor <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </section>
    </div>
  )
}
