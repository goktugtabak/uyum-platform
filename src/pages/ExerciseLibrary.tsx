import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft, ArrowRight, Flame, Dumbbell, Sparkles, Activity, Wind,
  LayoutGrid, List, MessageCircleQuestion, ChevronLeft, ChevronRight,
} from 'lucide-react'
import type { Exercise, DisabilityType, MobilityLevel } from '../types'
import { useProfile } from '../contexts/ProfileContext'
import { DemoBadge } from '../components/ui/DemoBadge'
import { FilterChip, FilterGroup } from '../components/ui/FilterChip'
import { ExerciseCard } from '../components/feature/ExerciseCard'
import {
  filterExercises,
  type ExerciseFilters,
  type DurationBucket,
} from '../lib/exercise-filter'
import exercisesData from '../data/exercises.json'

const DISABILITY_OPTIONS: ReadonlyArray<{ id: DisabilityType; label: string }> = [
  { id: 'wheelchair', label: 'Tekerlekli Sandalye' },
  { id: 'visual',     label: 'Görme' },
  { id: 'hearing',    label: 'İşitme' },
  { id: 'upper_limb', label: 'Üst Ekstremite' },
]

const MOBILITY_OPTIONS: ReadonlyArray<{ id: MobilityLevel; label: string }> = [
  { id: 'sitting',     label: 'Oturarak' },
  { id: 'supported',   label: 'Destekle' },
  { id: 'independent', label: 'Bağımsız' },
]

const DURATION_OPTIONS: ReadonlyArray<{ id: DurationBucket; label: string }> = [
  { id: 'short',  label: '≤ 10 dk' },
  { id: 'medium', label: '10–20 dk' },
  { id: 'long',   label: '20 dk+' },
]

const LANGUAGE_OPTIONS: ReadonlyArray<{ id: 'tr' | 'en'; label: string }> = [
  { id: 'tr', label: 'Türkçe' },
  { id: 'en', label: 'İngilizce' },
]

const ALL_EXERCISES = exercisesData as Exercise[]

const CATEGORIES = [
  { l: 'Isınma',  i: Flame,    c: 'peach' as const },
  { l: 'Kuvvet',  i: Dumbbell, c: 'mint'  as const },
  { l: 'Esneme',  i: Sparkles, c: 'lavender' as const },
  { l: 'Denge',   i: Activity, c: 'sky'   as const },
  { l: 'Nefes',   i: Wind,     c: 'mint'  as const },
]

export function ExerciseLibrary() {
  const { profile } = useProfile()
  const [view, setView] = useState<'grid' | 'list'>('grid')

  const [filters, setFilters] = useState<ExerciseFilters>(() => ({
    disabilityType: profile?.disabilityType ?? 'all',
    mobilityLevel:  'all',
    duration:       'all',
    language:       'all',
  }))

  const results = useMemo(() => filterExercises(filters, ALL_EXERCISES), [filters])

  const isFiltered =
    filters.disabilityType !== 'all' ||
    filters.mobilityLevel  !== 'all' ||
    filters.duration       !== 'all' ||
    filters.language       !== 'all'

  function clearFilters() {
    setFilters({ disabilityType: 'all', mobilityLevel: 'all', duration: 'all', language: 'all' })
  }

  if (!profile) return null

  return (
    <div className="mx-auto max-w-7xl pt-2">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary"
      >
        <ArrowLeft aria-hidden className="size-3.5" /> Ana Sayfa / Egzersizler
      </Link>

      {/* Hero */}
      <header className="relative mb-12">
        <div aria-hidden className="absolute -right-10 -top-6 size-56 rounded-full bg-mint/40 blur-3xl" />
        <h1 className="font-display text-[clamp(2rem,4.4vw,3.4rem)] font-extrabold leading-[1.04] tracking-tight text-primary-deep">
          Egzersiz Rehberi
        </h1>
        <p className="mt-3 flex max-w-xl flex-wrap items-center gap-3 text-base text-muted-foreground">
          Farklı branşlara özel egzersizleri izle, adım adım öğren ve kendi gelişimini destekle.
          <DemoBadge label="Video küratörlüğü mock" />
        </p>
      </header>

      {/* Quick categories */}
      <div className="mb-10">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-base font-extrabold text-primary-deep">
            Hızlı Kategoriler
          </h2>
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1.5 rounded-full bg-card px-3.5 py-1.5 text-[12px] font-semibold text-primary ring-1 ring-border/50 hover:ring-primary/40"
          >
            Tüm kategoriler <ArrowRight aria-hidden className="size-3.5" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {CATEGORIES.map(({ l, i: I, c }) => (
            <button
              key={l}
              type="button"
              className="group flex items-center gap-3 rounded-2xl bg-card px-3.5 py-3 ring-1 ring-border/40 transition hover:-translate-y-0.5 hover:ring-primary/30"
            >
              <span aria-hidden className={`grid size-10 shrink-0 place-items-center rounded-full ${
                c === 'peach' ? 'bg-[oklch(0.92_0.07_60)] text-[oklch(0.55_0.16_50)]' :
                c === 'mint' ? 'bg-mint/70 text-mint-foreground' :
                c === 'lavender' ? 'bg-accent/15 text-accent' :
                'bg-sky/70 text-sky-foreground'
              }`}>
                <I className="size-4" strokeWidth={1.8} />
              </span>
              <span className="text-[12.5px] font-bold leading-tight text-foreground hc:text-black">
                {l}
                <br />
                <span className="font-medium text-muted-foreground">Egzersizleri</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-10 space-y-3 rounded-3xl bg-card/85 p-4 ring-1 ring-border/40 backdrop-blur">
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

        <FilterGroup label="Hareket tipi">
          <FilterChip
            role="radio"
            active={filters.mobilityLevel === 'all'}
            onClick={() => setFilters(f => ({ ...f, mobilityLevel: 'all' }))}
          >
            Hepsi
          </FilterChip>
          {MOBILITY_OPTIONS.map(opt => (
            <FilterChip
              key={opt.id}
              role="radio"
              active={filters.mobilityLevel === opt.id}
              onClick={() => setFilters(f => ({ ...f, mobilityLevel: opt.id }))}
            >
              {opt.label}
            </FilterChip>
          ))}
        </FilterGroup>

        <FilterGroup label="Süre">
          <FilterChip
            role="radio"
            active={filters.duration === 'all'}
            onClick={() => setFilters(f => ({ ...f, duration: 'all' }))}
          >
            Hepsi
          </FilterChip>
          {DURATION_OPTIONS.map(opt => (
            <FilterChip
              key={opt.id}
              role="radio"
              active={filters.duration === opt.id}
              onClick={() => setFilters(f => ({ ...f, duration: opt.id }))}
            >
              {opt.label}
            </FilterChip>
          ))}
        </FilterGroup>

        <FilterGroup label="Dil">
          <FilterChip
            role="radio"
            active={filters.language === 'all'}
            onClick={() => setFilters(f => ({ ...f, language: 'all' }))}
          >
            Hepsi
          </FilterChip>
          {LANGUAGE_OPTIONS.map(opt => (
            <FilterChip
              key={opt.id}
              role="radio"
              active={filters.language === opt.id}
              onClick={() => setFilters(f => ({ ...f, language: opt.id }))}
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

      {/* Toolbar */}
      <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-display text-2xl font-extrabold text-primary-deep">
          Egzersiz Videoları{' '}
          <span className="ml-2 text-sm font-semibold text-muted-foreground">
            {results.length} sonuç
          </span>
        </h2>
        <div className="flex items-center gap-3">
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
        <div
          role="status"
          className="rounded-3xl bg-card p-8 text-center ring-1 ring-border/40"
        >
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
          {results.map(exercise => (
            <ExerciseCard key={exercise.id} exercise={exercise} />
          ))}
        </section>
      )}

      {/* Pagination (visual) */}
      {results.length > 9 && (
        <div className="mt-12 flex items-center justify-center gap-2 text-sm" role="navigation" aria-label="Sayfalama">
          <button type="button" aria-label="Önceki" className="grid size-9 place-items-center rounded-full ring-1 ring-border/60 hover:bg-card">
            <ChevronLeft className="size-4" aria-hidden />
          </button>
          {[1, 2, 3].map(n => (
            <button
              key={n}
              type="button"
              aria-current={n === 1 ? 'page' : undefined}
              className={`grid size-9 place-items-center rounded-full font-bold ${
                n === 1 ? 'bg-primary text-primary-foreground shadow-glow' : 'hover:bg-card'
              }`}
            >
              {n}
            </button>
          ))}
          <span aria-hidden className="px-1 text-muted-foreground">…</span>
          <button type="button" aria-label="Sonraki" className="grid size-9 place-items-center rounded-full ring-1 ring-border/60 hover:bg-card">
            <ChevronRight className="size-4" aria-hidden />
          </button>
        </div>
      )}

      {/* Footer help */}
      <section className="mt-16 flex flex-wrap items-center justify-between gap-6 rounded-[2rem] bg-accent/8 px-7 py-6">
        <div className="flex items-center gap-4">
          <span aria-hidden className="grid size-12 place-items-center rounded-2xl bg-card text-primary-deep">
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
          Topluluğa sor <ArrowRight aria-hidden className="size-3.5" />
        </Link>
      </section>
    </div>
  )
}
