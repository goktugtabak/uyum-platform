import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
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

export function ExerciseLibrary() {
  const { profile } = useProfile()

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
    setFilters({
      disabilityType: 'all',
      mobilityLevel:  'all',
      duration:       'all',
      language:       'all',
    })
  }

  if (!profile) return null

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-white mb-2">
            Adaptif Egzersiz Kütüphanesi
          </h1>
          <p className="text-sm text-white/60 font-body max-w-2xl">
            Profilin için seçilmiş video rehberleri. Altyazılı olanlar listenin başında.
          </p>
        </div>
        <DemoBadge label="Video küratörlüğü mock" />
      </header>

      <section
        aria-labelledby="exercise-filters-heading"
        className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3"
      >
        <h2
          id="exercise-filters-heading"
          className="text-xs uppercase tracking-wider text-white/60 font-heading"
        >
          Filtreler
        </h2>

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

      {results.length === 0 ? (
        <div
          role="status"
          className="rounded-xl border border-white/10 bg-white/5 p-8 text-center space-y-3"
        >
          <p className="text-white/80 font-body">
            Bu filtreyle eşleşen egzersiz videosu yok.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm text-uyum-frost-blue underline hover:text-white"
          >
            Filtreleri temizle
          </button>
        </div>
      ) : (
        <section aria-label="Egzersiz videoları" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map(exercise => (
            <ExerciseCard key={exercise.id} exercise={exercise} />
          ))}
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
