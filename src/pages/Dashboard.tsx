import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useProfile } from '../contexts/ProfileContext'
import { loadFacilities } from '../lib/overpass-loader'
import { pickTopFacilities } from '../lib/facility-rank'
import { DemoBadge } from '../components/ui/DemoBadge'
import { MiniFacilityCard } from '../components/feature/MiniFacilityCard'
import { CommunityFeed } from '../components/feature/CommunityFeed'
import { DiscoverGrid } from '../components/feature/DiscoverGrid'
import type { Facility } from '../types'

const DISABILITY_LABELS: Record<string, string> = {
  wheelchair: 'Tekerlekli Sandalye',
  visual:     'Görme',
  hearing:    'İşitme',
  upper_limb: 'Üst Ekstremite',
}

const GOAL_LABELS: Record<string, string> = {
  strength:    'Güç',
  flexibility: 'Esneklik',
  social:      'Sosyal',
  compete:     'Yarışma',
}

const NEARBY_LIMIT = 3

function NearbySkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4" aria-hidden="true">
      {Array.from({ length: NEARBY_LIMIT }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-white/10 bg-white/5 h-56 animate-pulse"
        />
      ))}
    </div>
  )
}

export function Dashboard() {
  const navigate = useNavigate()
  const { profile, clearProfile } = useProfile()
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFacilities()
      .then(setFacilities)
      .finally(() => setLoading(false))
  }, [])

  const ranked = useMemo(() => {
    if (!profile || facilities.length === 0) return []
    return pickTopFacilities(facilities, profile, NEARBY_LIMIT)
  }, [facilities, profile])

  if (!profile) return null

  function handleReset() {
    clearProfile()
    navigate('/onboarding')
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-8 md:space-y-10">
      {/* Profil özeti */}
      <header className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <p className="text-xs uppercase tracking-wider text-white/50 font-heading">
            Merhaba
          </p>
          <p className="text-base text-white font-body mt-1">
            <span className="font-heading font-semibold">
              {DISABILITY_LABELS[profile.disabilityType]}
            </span>
            <span className="text-white/60"> · </span>
            Hedef:{' '}
            <span className="font-heading font-semibold">
              {GOAL_LABELS[profile.goal]}
            </span>
            <span className="text-white/60"> · </span>
            {profile.city}
          </p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-white/60 hover:text-white underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-uyum-purple rounded"
        >
          Profili düzenle
        </button>
      </header>

      {/* Sana Yakında */}
      <section aria-labelledby="section-nearby">
        <div className="flex items-center gap-3 mb-4">
          <h2
            id="section-nearby"
            className="text-xl font-heading font-bold text-white"
          >
            Sana Yakında
          </h2>
          <DemoBadge />
        </div>

        {loading ? (
          <NearbySkeleton />
        ) : ranked.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-white/60 text-sm">
            Profiline uygun tesis bulunamadı.{' '}
            <Link to="/map" className="text-uyum-purple underline">
              Haritadan ara
            </Link>
            .
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ranked.map(({ facility }) => (
              <MiniFacilityCard
                key={facility.id}
                facility={facility}
                disabilityType={profile.disabilityType}
              />
            ))}
          </div>
        )}
      </section>

      {/* Topluluktan */}
      <section aria-labelledby="section-community">
        <div className="flex items-center gap-3 mb-4">
          <h2
            id="section-community"
            className="text-xl font-heading font-bold text-white"
          >
            Topluluktan
          </h2>
          <DemoBadge />
        </div>
        <CommunityFeed facilities={facilities} />
      </section>

      {/* Keşfet */}
      <section aria-labelledby="section-explore">
        <h2
          id="section-explore"
          className="text-xl font-heading font-bold text-white mb-4"
        >
          Keşfet
        </h2>
        <DiscoverGrid />
      </section>
    </div>
  )
}
