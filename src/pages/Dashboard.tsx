import { useNavigate } from 'react-router-dom'
import { useProfile } from '../contexts/ProfileContext'
import { DemoBadge } from '../components/ui/DemoBadge'

const DISABILITY_LABELS: Record<string, string> = {
  wheelchair:  'Tekerlekli Sandalye',
  visual:      'Görme',
  hearing:     'İşitme',
  upper_limb:  'Üst Ekstremite',
}

const GOAL_LABELS: Record<string, string> = {
  strength:    'Güç',
  flexibility: 'Esneklik',
  social:      'Sosyal',
  compete:     'Yarışma',
}

export function Dashboard() {
  const navigate = useNavigate()
  const { profile, clearProfile } = useProfile()

  if (!profile) return null

  function handleReset() {
    clearProfile()
    navigate('/onboarding')
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Profil özeti */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
        <p className="text-sm text-white/70 font-body">
          <span className="text-white font-heading font-semibold">Merhaba!</span>
          {' · '}
          {DISABILITY_LABELS[profile.disabilityType]}
          {' · '}
          {GOAL_LABELS[profile.goal]}
          {' · '}
          {profile.city}
        </p>
        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-white/50 hover:text-white underline transition-colors focus-visible:ring-2 focus-visible:ring-uyum-purple rounded"
        >
          Profili yeniden oluştur
        </button>
      </div>

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
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-white/50 text-sm font-body">
          Bu bölüm Faz 8&apos;de doluyor — yakındaki erişilebilir tesisler burada görünecek.
        </div>
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
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-white/50 text-sm font-body">
          Bu bölüm Faz 8&apos;de doluyor — son tanıklıklar ve yakın etkinlikler burada görünecek.
        </div>
      </section>

      {/* Keşfet */}
      <section aria-labelledby="section-explore">
        <div className="flex items-center gap-3 mb-4">
          <h2
            id="section-explore"
            className="text-xl font-heading font-bold text-white"
          >
            Keşfet
          </h2>
          <DemoBadge />
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-white/50 text-sm font-body">
          Bu bölüm Faz 8&apos;de doluyor — spor eşleştirme, egzersiz, etkinlik ve koç bul bağlantıları burada olacak.
        </div>
      </section>
    </div>
  )
}
