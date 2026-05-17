import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BackButton } from '../components/ui/BackButton'
import {
  ArrowLeft, ArrowRight, Flame, Dumbbell, Sparkles, Activity, Wind,
  LayoutGrid, List, MessageCircleQuestion, ChevronLeft, ChevronRight, X,
} from 'lucide-react'
import { FilterDropdown, type DropdownOption } from '../components/ui/FilterDropdown'
import type { Exercise } from '../types'
import { useProfile } from '../contexts/ProfileContext'
import { ExerciseCard } from '../components/feature/ExerciseCard'
import exercisesData from '../data/exercises.json'

const ALL_EXERCISES = exercisesData as Exercise[]

const PAGE_SIZE = 9

/* ----- Filter universes (real, derived from data) ----- */

const SPORT_TAGS = ['yüzme', 'tenis', 'yoga', 'pilates', 'boccia', 'judo', 'atletizm', 'dans', 'koşu'] as const
const LEVEL_TAGS = ['başlangıç', 'orta', 'ileri'] as const
const ZONE_TAGS  = ['üst vücut', 'merkez kası', 'denge', 'esneme', 'nefes', 'koordinasyon'] as const
const EQUIPMENT_LIST = ['direnç bandı', 'yoga matı', 'pilates topu', 'hafif dumbbell', 'tenis raketi', 'boccia topu', 'judogi'] as const

type SortBy = 'recommended' | 'duration-asc' | 'duration-desc'

interface FilterState {
  sport:     string | 'all'  // tag
  level:     string | 'all'  // tag
  equipment: string | 'all'  // equipment name or 'none' (no equipment)
  zone:      string | 'all'  // tag
  sort:      SortBy
  // Category chips on top map to tags also (single-select)
  category:  string | null    // tag
  // Subtitle-first toggle
  subsFirst: boolean
}

const DEFAULT_FILTERS: FilterState = {
  sport:     'all',
  level:     'all',
  equipment: 'all',
  zone:      'all',
  sort:      'recommended',
  category:  null,
  subsFirst: true,
}

const CATEGORIES = [
  { l: 'Isınma', tag: 'ısınma',     i: Flame,    c: 'peach'    as const },
  { l: 'Kuvvet', tag: 'kuvvet',     i: Dumbbell, c: 'mint'     as const },
  { l: 'Esneme', tag: 'esneme',     i: Sparkles, c: 'lavender' as const },
  { l: 'Denge',  tag: 'denge',      i: Activity, c: 'sky'      as const },
  { l: 'Nefes',  tag: 'nefes',      i: Wind,     c: 'mint'     as const },
]

/* ----- Real filter pipeline ----- */

function applyFilters(all: Exercise[], f: FilterState): Exercise[] {
  let out = all.filter(e => {
    if (f.sport !== 'all' && !e.tags.includes(f.sport)) return false
    if (f.level !== 'all' && !e.tags.includes(f.level)) return false
    if (f.zone  !== 'all' && !e.tags.includes(f.zone))  return false
    if (f.category && !e.tags.includes(f.category))     return false
    if (f.equipment !== 'all') {
      if (f.equipment === 'none') {
        if (e.equipment.length > 0) return false
      } else if (!e.equipment.includes(f.equipment)) {
        return false
      }
    }
    return true
  })

  out = [...out].sort((a, b) => {
    // subtitle-first toggle: prepend subtitled videos before any other sort
    if (f.subsFirst && a.hasSubtitles !== b.hasSubtitles) return a.hasSubtitles ? -1 : 1

    if (f.sort === 'duration-asc')  return a.duration - b.duration
    if (f.sort === 'duration-desc') return b.duration - a.duration
    // recommended: Turkish first, then duration asc
    if (a.language !== b.language) {
      if (a.language === 'tr') return -1
      if (b.language === 'tr') return 1
    }
    return a.duration - b.duration
  })

  return out
}

function buildAllOptions(values: ReadonlyArray<string>, includeNone = false): DropdownOption[] {
  const opts: DropdownOption[] = [{ value: 'all', label: 'Tümü' }]
  if (includeNone) opts.push({ value: 'none', label: 'Ekipman yok' })
  for (const v of values) {
    opts.push({ value: v, label: v.charAt(0).toLocaleUpperCase('tr') + v.slice(1) })
  }
  return opts
}

const SORT_OPTIONS: DropdownOption[] = [
  { value: 'recommended',  label: 'Önerilen'  },
  { value: 'duration-asc', label: 'Kısadan uzuna' },
  { value: 'duration-desc',label: 'Uzundan kısaya' },
]

/* ----- Page ----- */

export function ExerciseLibrary() {
  const { profile } = useProfile()
  const [view, setView]       = useState<'grid' | 'list'>('grid')
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [openDD, setOpenDD]   = useState<string | null>(null)
  const [page, setPage]       = useState<number>(1)

  const results = useMemo(() => applyFilters(ALL_EXERCISES, filters), [filters])
  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE))
  const pageSafe = Math.min(page, totalPages)
  const paged = results.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE)

  const isFiltered =
    filters.sport     !== 'all' ||
    filters.level     !== 'all' ||
    filters.equipment !== 'all' ||
    filters.zone      !== 'all' ||
    filters.category  !== null  ||
    filters.sort      !== 'recommended'

  function patch(partial: Partial<FilterState>) {
    setFilters(f => ({ ...f, ...partial }))
    setPage(1)
  }
  function clearFilters() {
    setFilters(DEFAULT_FILTERS)
    setPage(1)
  }
  function toggleCategory(tag: string) {
    patch({ category: filters.category === tag ? null : tag })
  }
  function toggleDD(key: string) {
    setOpenDD(prev => (prev === key ? null : key))
  }

  if (!profile) return null

  return (
    <div className="mx-auto max-w-7xl pt-2">
      <BackButton className="mb-6" />


      {/* Hero — title only, soft mint glow on right */}
      <header className="relative mb-12">
        <div className="absolute -right-10 -top-6 size-56 rounded-full bg-mint/40 blur-3xl" aria-hidden />
        <h1 className="text-[clamp(2.4rem,4.4vw,3.6rem)] font-extrabold leading-[1.04] tracking-tight text-primary-deep">
          Egzersiz Rehberi
        </h1>
        <p className="mt-3 max-w-xl text-base text-muted-foreground">
          Farklı branşlara özel egzersizleri izle, adım adım öğren ve kendi
          gelişimini destekle.
        </p>
      </header>

      {/* Hızlı Kategoriler */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Kategori filtrele">
          {CATEGORIES.map(({ l, tag, i: I, c }) => {
            const active = filters.category === tag
            return (
              <button
                key={l}
                type="button"
                onClick={() => toggleCategory(tag)}
                aria-pressed={active}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold transition ${
                  active
                    ? 'bg-primary text-primary-foreground shadow-glow'
                    : 'bg-card ring-1 ring-border/50 text-foreground hover:ring-primary/30 hover:bg-primary/5'
                }`}
              >
                <I aria-hidden className={`size-3.5 ${active ? '' : (
                  c === 'peach' ? 'text-accent' :
                  c === 'mint' ? 'text-mint-foreground' :
                  c === 'lavender' ? 'text-accent' :
                  'text-sky-foreground'
                )}`} strokeWidth={1.8} />
                {l}
              </button>
            )
          })}
          {filters.category !== null && (
            <button
              type="button"
              onClick={() => patch({ category: null })}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-semibold text-muted-foreground ring-1 ring-border/40 hover:text-primary hover:ring-primary/30"
            >
              <X className="size-3" aria-hidden /> Temizle
            </button>
          )}
        </div>
      </div>

      {/* Filter row — design's label-above-value dropdowns */}
      <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <FilterDropdown
          label="Spor Dalı"
          value={filters.sport}
          options={buildAllOptions(SPORT_TAGS)}
          onChange={v => patch({ sport: v as FilterState['sport'] })}
          open={openDD === 'sport'}
          onToggle={() => toggleDD('sport')}
        />
        <FilterDropdown
          label="Zorluk Seviyesi"
          value={filters.level}
          options={buildAllOptions(LEVEL_TAGS)}
          onChange={v => patch({ level: v as FilterState['level'] })}
          open={openDD === 'level'}
          onToggle={() => toggleDD('level')}
        />
        <FilterDropdown
          label="Ekipman"
          value={filters.equipment}
          options={buildAllOptions(EQUIPMENT_LIST, true)}
          onChange={v => patch({ equipment: v as FilterState['equipment'] })}
          open={openDD === 'equipment'}
          onToggle={() => toggleDD('equipment')}
        />
        <FilterDropdown
          label="Hedef Bölge"
          value={filters.zone}
          options={buildAllOptions(ZONE_TAGS)}
          onChange={v => patch({ zone: v as FilterState['zone'] })}
          open={openDD === 'zone'}
          onToggle={() => toggleDD('zone')}
        />
        <FilterDropdown
          label="Sırala:"
          value={filters.sort}
          options={SORT_OPTIONS}
          onChange={v => patch({ sort: v as SortBy })}
          open={openDD === 'sort'}
          onToggle={() => toggleDD('sort')}
        />
      </div>

      {isFiltered && (
        <div className="-mt-6 mb-8">
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs font-bold text-primary underline-offset-2 hover:underline"
          >
            Filtreleri temizle
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-primary-deep">
            Egzersiz Videoları{' '}
            <span className="ml-2 text-sm font-semibold text-muted-foreground">
              {results.length} sonuç bulundu
            </span>
          </h2>
        </div>
        <div className="flex items-center gap-5">
          {/* Subtitle-first toggle */}
          <button
            type="button"
            role="switch"
            aria-checked={filters.subsFirst}
            onClick={() => patch({ subsFirst: !filters.subsFirst })}
            className="flex items-center gap-2 text-xs font-semibold text-foreground"
          >
            Altyazılı önce göster
            <span
              className={`relative inline-block h-5 w-9 rounded-full transition ${
                filters.subsFirst ? 'bg-success' : 'bg-muted ring-1 ring-border/60'
              }`}
              aria-hidden
            >
              <span
                className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-all ${
                  filters.subsFirst ? 'right-0.5' : 'left-0.5'
                }`}
              />
            </span>
          </button>

          <div className="flex rounded-full p-1 ring-1 ring-border/60" role="group" aria-label="Görünüm">
            <button
              type="button"
              aria-label="Izgara görünümü"
              aria-pressed={view === 'grid'}
              onClick={() => setView('grid')}
              className={`grid size-7 place-items-center rounded-full ${
                view === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
              }`}
            >
              <LayoutGrid className="size-3.5" aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Liste görünümü"
              aria-pressed={view === 'list'}
              onClick={() => setView('list')}
              className={`grid size-7 place-items-center rounded-full ${
                view === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
              }`}
            >
              <List className="size-3.5" aria-hidden />
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {results.length === 0 ? (
        <div role="status" className="rounded-3xl bg-card p-8 text-center ring-1 ring-border/40">
          <p className="text-sm text-foreground/85">
            Bu filtreyle eşleşen egzersiz videosu yok.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-3 text-sm font-bold text-primary underline"
          >
            Filtreleri temizle
          </button>
        </div>
      ) : (
        <section
          aria-label="Egzersiz videoları"
          className={
            view === 'grid'
              ? 'grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3'
              : 'grid gap-6 lg:grid-cols-2'
          }
        >
          {paged.map(exercise => (
            <ExerciseCard key={exercise.id} exercise={exercise} />
          ))}
        </section>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="mt-12 flex items-center justify-center gap-2 text-sm" aria-label="Sayfalama">
          <button
            type="button"
            aria-label="Önceki"
            disabled={pageSafe === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="grid size-9 place-items-center rounded-full ring-1 ring-border/60 hover:bg-card disabled:opacity-40"
          >
            <ChevronLeft className="size-4" aria-hidden />
          </button>
          {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map(n => (
            <button
              key={n}
              type="button"
              onClick={() => setPage(n)}
              aria-current={n === pageSafe ? 'page' : undefined}
              className={`grid size-9 place-items-center rounded-full font-bold ${
                n === pageSafe ? 'bg-primary text-primary-foreground shadow-glow' : 'hover:bg-card'
              }`}
            >
              {n}
            </button>
          ))}
          {totalPages > 4 && (
            <>
              <span aria-hidden className="px-1 text-muted-foreground">…</span>
              <button
                type="button"
                onClick={() => setPage(totalPages)}
                aria-current={pageSafe === totalPages ? 'page' : undefined}
                className={`grid size-9 place-items-center rounded-full font-bold ${
                  pageSafe === totalPages ? 'bg-primary text-primary-foreground shadow-glow' : 'hover:bg-card'
                }`}
              >
                {totalPages}
              </button>
            </>
          )}
          <button
            type="button"
            aria-label="Sonraki"
            disabled={pageSafe === totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            className="grid size-9 place-items-center rounded-full ring-1 ring-border/60 hover:bg-card disabled:opacity-40"
          >
            <ChevronRight className="size-4" aria-hidden />
          </button>
        </nav>
      )}

      {/* Footer ask block */}
      <section className="mt-16 flex flex-wrap items-center justify-between gap-6 rounded-[2rem] bg-accent/10 px-7 py-6">
        <div className="flex items-center gap-4">
          <span aria-hidden className="grid size-12 place-items-center rounded-2xl bg-white text-primary-deep">
            <MessageCircleQuestion className="size-5" />
          </span>
          <div>
            <div className="font-bold text-primary-deep">Egzersizini bulamadın mı?</div>
            <div className="text-xs text-muted-foreground">
              İhtiyacına özel öneriler için topluluğa sor, uzmanlardan destek al.
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
