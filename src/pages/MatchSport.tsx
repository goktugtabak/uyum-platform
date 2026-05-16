import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useProfile } from '../contexts/ProfileContext'
import { matchSports } from '../lib/sport-match'
import { SportMatchCard } from '../components/feature/SportMatchCard'
import { DemoBadge } from '../components/ui/DemoBadge'
import sportsData from '../data/sports.json'
import type { Sport } from '../types'

const DISABILITY_LABELS: Record<string, string> = {
  wheelchair:  'Tekerlekli Sandalye',
  visual:      'Görme',
  hearing:     'İşitme',
  upper_limb:  'Üst Ekstremite',
}

const MOBILITY_LABELS: Record<string, string> = {
  sitting:     'Oturarak',
  supported:   'Destekle',
  independent: 'Bağımsız',
}

const GOAL_LABELS: Record<string, string> = {
  strength:    'Güç',
  flexibility: 'Esneklik',
  social:      'Sosyal',
  compete:     'Yarışma',
}

export function MatchSport() {
  const { profile } = useProfile()

  // RequireProfile guard ensures profile is never null here, but TS needs the check.
  const matches = useMemo(() => {
    if (!profile) return []
    return matchSports(profile, sportsData as Sport[])
  }, [profile])

  if (!profile) return null

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header — profile snapshot + edit link */}
      <header className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white mb-2">
            Sana Uygun Sporlar
          </h1>
          <p className="text-sm text-white/60 font-body">
            {DISABILITY_LABELS[profile.disabilityType]}
            {' · '}
            {MOBILITY_LABELS[profile.mobilityLevel]}
            {' · '}
            Hedef: {GOAL_LABELS[profile.goal]}
          </p>
        </div>
        <Link
          to="/onboarding"
          className="text-xs text-white/60 hover:text-white underline transition-colors focus-visible:ring-2 focus-visible:ring-uyum-purple rounded"
        >
          Profilini değiştirmek ister misin?
        </Link>
      </header>

      {/* DEMO VERİSİ rozeti — sports.json mock data */}
      <div className="flex items-center gap-3">
        <p className="text-xs text-white/50 font-body">
          Spor önerileri kural tabanlı bir algoritma ile profiline göre seçildi.
        </p>
        <DemoBadge />
      </div>

      {/* Results */}
      {matches.length === 0 ? (
        <div
          role="status"
          className="rounded-xl border border-white/10 bg-white/5 p-8 text-center"
        >
          <p className="text-white/80 font-body mb-3">
            Profiline tam uyan bir spor şu anda veri tabanımızda bulunmuyor.
          </p>
          <p className="text-white/50 text-sm font-body">
            Yakında daha fazla seçenek ekleyeceğiz.
          </p>
        </div>
      ) : (
        <section aria-label="Önerilen sporlar" className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {matches.map((result, idx) => (
            <SportMatchCard
              key={result.sport.id}
              result={result}
              rank={(idx + 1) as 1 | 2 | 3}
            />
          ))}
        </section>
      )}
    </div>
  )
}
