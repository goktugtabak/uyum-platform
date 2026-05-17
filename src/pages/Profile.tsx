import { Link, useNavigate } from 'react-router-dom'
import {
  Accessibility, Target, Footprints, Pencil, RefreshCw, MapPin,
  Trash2, Mail, BadgeCheck, ShieldCheck,
} from 'lucide-react'
import type { DisabilityType, MobilityLevel, Goal } from '../types'
import { useProfile } from '../contexts/ProfileContext'
import { AccessibilityToolbar } from '../components/a11y/AccessibilityToolbar'

const DISABILITY_LABELS: Record<DisabilityType, string> = {
  wheelchair: 'Tekerlekli Sandalye',
  visual:     'Görme',
  hearing:    'İşitme',
  upper_limb: 'Üst Ekstremite',
}
const MOBILITY_LABELS: Record<MobilityLevel, string> = {
  sitting:     'Oturarak',
  supported:   'Destekle',
  independent: 'Bağımsız',
}
const GOAL_LABELS: Record<Goal, string> = {
  strength:    'Güçlenmek',
  flexibility: 'Esnekliğini artırmak',
  social:      'Sosyal olmak',
  compete:     'Rekabet etmek',
}

export function Profile() {
  const { profile, clearProfile } = useProfile()
  const navigate = useNavigate()

  if (!profile) return null

  function handleReset() {
    if (confirm('Profilini sıfırlamak istediğine emin misin? Bütün ayarların silinecek.')) {
      clearProfile()
      navigate('/onboarding')
    }
  }

  return (
    <div className="mx-auto max-w-7xl pt-2">
      <header className="mb-10">
        <h1 className="font-display text-[clamp(2rem,4vw,3rem)] font-extrabold tracking-tight text-primary-deep">
          Profilim
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground">
          Profilin önerilerinin temelini oluşturur. İstediğin zaman güncelle.
        </p>
      </header>

      <div className="grid gap-10 xl:grid-cols-[1fr_22rem]">
        <section className="space-y-8">
          {/* Hero */}
          <div className="rounded-3xl bg-card p-6 ring-1 ring-border/40 hc:bg-white hc:ring-black">
            <div className="flex flex-wrap items-center gap-5">
              <div
                aria-hidden
                className="grid size-20 place-items-center rounded-full bg-gradient-brand text-2xl font-extrabold text-primary-foreground"
              >
                {DISABILITY_LABELS[profile.disabilityType][0]}
              </div>
              <div>
                <h2 className="font-display text-2xl font-extrabold text-primary-deep hc:text-black">
                  {DISABILITY_LABELS[profile.disabilityType]}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {profile.city} sporcusu · UYUM topluluğu üyesi
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-mint/60 px-2 py-0.5 text-[10px] font-bold text-mint-foreground">
                    <BadgeCheck aria-hidden className="size-3" /> Profil tamamlandı
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent">
                    <ShieldCheck aria-hidden className="size-3" /> Anonim
                  </span>
                </div>
              </div>
              <Link
                to="/onboarding"
                className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-glow hover:bg-primary-deep"
              >
                <Pencil aria-hidden className="size-3.5" /> Profili Düzenle
              </Link>
            </div>
          </div>

          {/* Profile facts */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Fact icon={<Accessibility className="size-5" aria-hidden />}
                  label="Engel durumu"
                  value={DISABILITY_LABELS[profile.disabilityType]} />
            <Fact icon={<Footprints className="size-5" aria-hidden />}
                  label="Hareket düzeyi"
                  value={MOBILITY_LABELS[profile.mobilityLevel]} />
            <Fact icon={<Target className="size-5" aria-hidden />}
                  label="Hedefin"
                  value={GOAL_LABELS[profile.goal]} />
          </div>

          {/* Favorites */}
          <div className="rounded-3xl bg-card p-6 ring-1 ring-border/40 hc:bg-white hc:ring-black">
            <h3 className="font-display text-base font-extrabold text-primary-deep hc:text-black">
              Favorilerin
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Tesis ve etkinlikleri favorilerine ekledikçe burada listelenir.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <FavRow
                icon={<MapPin className="size-4" aria-hidden />}
                label="Favori tesisler"
                count={profile.favoriteFacilities.length}
                cta={{ to: '/map', label: 'Tesis ekle' }}
              />
              <FavRow
                icon={<MapPin className="size-4" aria-hidden />}
                label="Favori etkinlikler"
                count={profile.favoriteEvents.length}
                cta={{ to: '/events', label: 'Etkinlik ekle' }}
              />
            </div>
          </div>

          {/* Privacy */}
          <div className="rounded-3xl bg-card p-6 ring-1 ring-border/40 hc:bg-white hc:ring-black">
            <h3 className="font-display text-base font-extrabold text-primary-deep hc:text-black">
              Gizlilik &amp; Veri
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Bilgilerin sadece sana özel öneriler için kullanılır, üçüncü taraflarla paylaşılmaz.
              Profilini sıfırladığında lokal verilerin tamamı silinir.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href="mailto:hello@uyum.app"
                className="inline-flex items-center gap-1.5 rounded-full bg-card px-4 py-2 text-xs font-semibold text-primary ring-1 ring-primary/30 hover:bg-primary/10"
              >
                <Mail aria-hidden className="size-3.5" /> Bize ulaş
              </a>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-4 py-2 text-xs font-bold text-destructive ring-1 ring-destructive/30 hover:bg-destructive/20"
              >
                <Trash2 aria-hidden className="size-3.5" /> Profili sıfırla
              </button>
            </div>
          </div>
        </section>

        {/* Accessibility panel + quick actions */}
        <aside className="space-y-6">
          <AccessibilityToolbar />

          <div className="rounded-3xl bg-mint/30 p-5 ring-1 ring-mint">
            <h3 className="font-display text-base font-extrabold text-primary-deep">
              Önerini yenile
            </h3>
            <p className="mt-1 text-xs text-foreground/80 hc:text-black">
              Profilini güncelledikten sonra spor önerilerini yeniden eşleştir.
            </p>
            <Link
              to="/match"
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary-deep px-4 py-2 text-xs font-bold text-primary-foreground"
            >
              <RefreshCw aria-hidden className="size-3.5" /> Spor önerimi gör
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card p-4 ring-1 ring-border/40 hc:bg-white hc:ring-black">
      <div className="flex items-start gap-3">
        <span aria-hidden className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
          {icon}
        </span>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
          <div className="mt-0.5 font-display text-base font-extrabold text-primary-deep hc:text-black">{value}</div>
        </div>
      </div>
    </div>
  )
}

function FavRow({
  icon, label, count, cta,
}: {
  icon: React.ReactNode
  label: string
  count: number
  cta: { to: string; label: string }
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-muted/60 p-3">
      <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full bg-card text-primary">
        {icon}
      </span>
      <div className="flex-1">
        <div className="text-[12px] font-bold text-foreground hc:text-black">{label}</div>
        <div className="text-[11px] text-muted-foreground">
          {count > 0 ? `${count} adet` : 'Henüz boş'}
        </div>
      </div>
      <Link
        to={cta.to}
        className="text-xs font-bold text-primary hover:text-primary-deep"
      >
        {cta.label} →
      </Link>
    </div>
  )
}
