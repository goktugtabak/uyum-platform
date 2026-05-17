import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Accessibility, Target, Footprints, Pencil, MapPin, CalendarDays,
  Dumbbell, Trash2, Mail, BadgeCheck, ShieldCheck, Activity,
  Bookmark, BookmarkX, Sparkles, UserCog,
} from 'lucide-react'

import type { DisabilityType, MobilityLevel, Goal, Facility, SportEvent, Exercise } from '../types'
import { useProfile } from '../contexts/ProfileContext'
import { AccessibilityToolbar } from '../components/a11y/AccessibilityToolbar'
import { MiniFavCard } from '../components/feature/MiniFavCard'
import { loadActivityLog, type ActivityEntry, type ActivityKind } from '../lib/activity-log'

import facilitiesData from '../data/facilities.json'
import eventsData from '../data/events.json'
import exercisesData from '../data/exercises.json'
import dashHero from '../assets/dashboard-hero.jpg'

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
  flexibility: 'Esneklik',
  social:      'Sosyal',
  performance: 'Performans',
  healthy:     'Sağlıklı',
  compete:     'Yarışma',
}

const POSITIVE_KINDS: ReadonlySet<ActivityKind> = new Set<ActivityKind>([
  'facility_bookmarked', 'event_bookmarked', 'exercise_bookmarked', 'profile_created',
])

const FACILITIES = facilitiesData as Facility[]
const EVENTS     = eventsData as SportEvent[]
const EXERCISES  = exercisesData as Exercise[]

export function Profile() {
  const { profile, clearProfile } = useProfile()
  const navigate = useNavigate()

  const [activity] = useState<ActivityEntry[]>(() => loadActivityLog().slice(0, 8))

  if (!profile) return null

  function handleReset() {
    if (confirm('Profilini sıfırlamak istediğine emin misin? Bütün ayarların silinecek.')) {
      clearProfile()
      navigate('/onboarding')
    }
  }

  const favFacilities: Facility[] = profile.favoriteFacilities
    .map(id => FACILITIES.find(f => f.id === id))
    .filter((f): f is Facility => Boolean(f))

  const favEvents: SportEvent[] = profile.favoriteEvents
    .map(id => EVENTS.find(e => e.id === id))
    .filter((e): e is SportEvent => Boolean(e))

  const favExercises: Exercise[] = profile.favoriteExercises
    .map(id => EXERCISES.find(e => e.id === id))
    .filter((e): e is Exercise => Boolean(e))

  const initial = DISABILITY_LABELS[profile.disabilityTypes[0]]?.charAt(0).toUpperCase() ?? 'U'

  return (
    <div className="mx-auto max-w-5xl space-y-10 pt-2">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl ring-1 ring-border/40" style={{ height: 240 }}>
        <img src={dashHero} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-deep/85 via-primary-deep/45 to-primary-deep/10" />
        <div className="relative flex h-full items-end justify-between gap-4 p-6">
          <div className="flex items-end gap-4">
            <span
              aria-hidden
              className="grid size-16 place-items-center rounded-full bg-primary text-2xl font-extrabold text-primary-foreground ring-4 ring-white/30 shadow-glow"
            >
              {initial}
            </span>
            <div className="min-w-0">
              <div className="font-display text-xl font-extrabold text-white sm:text-2xl">UYUM Kullanıcısı</div>
              <div className="mt-0.5 truncate text-sm text-white/80">
                {profile.disabilityTypes.map(d => DISABILITY_LABELS[d]).join(' · ')} · {profile.city} sporcusu
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                  <BadgeCheck aria-hidden className="size-3" /> Profil tamamlandı
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                  <ShieldCheck aria-hidden className="size-3" /> Anonim
                </span>
              </div>
            </div>
          </div>
          <Link
            to="/onboarding"
            className="hidden shrink-0 items-center gap-1.5 rounded-full bg-white/95 px-4 py-2 text-sm font-bold text-primary-deep shadow-glow hover:bg-white sm:inline-flex"
          >
            <Pencil aria-hidden className="size-3.5" /> Düzenle
          </Link>
        </div>
      </section>

      {/* Profile facts */}
      <section className="space-y-3">
        <div className="grid gap-4 sm:grid-cols-3">
          <Fact icon={<Accessibility className="size-5" aria-hidden />} label="Engel Tipi" value={profile.disabilityTypes.map(d => DISABILITY_LABELS[d]).join(', ')} />
          <Fact icon={<Footprints className="size-5" aria-hidden />} label="Hareket" value={MOBILITY_LABELS[profile.mobilityLevel]} />
          <Fact icon={<Target className="size-5" aria-hidden />} label="Hedef" value={profile.goals.map(g => GOAL_LABELS[g]).join(', ')} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          <p className="text-xs text-muted-foreground">Profilin önerilerinin temelini oluşturur.</p>
          <Link to="/onboarding" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-deep">
            <UserCog aria-hidden className="size-3.5" /> Profili düzenle
          </Link>
        </div>
      </section>

      {/* Favorites */}
      <section className="space-y-8">
        <FavGroup
          title="Tesisler" icon={<MapPin className="size-4" aria-hidden />}
          count={favFacilities.length} emptyLabel="Henüz tesis eklenmedi."
          emptyCta={{ to: '/map', label: 'Tesisleri keşfet' }}
        >
          {favFacilities.map(f => (
            <MiniFavCard key={f.id} to={`/facility/${f.id}`} title={f.name} subtitle={f.district} tone="bg-mint/60 text-mint-foreground" />
          ))}
        </FavGroup>

        <FavGroup
          title="Etkinlikler" icon={<CalendarDays className="size-4" aria-hidden />}
          count={favEvents.length} emptyLabel="Henüz etkinlik eklenmedi."
          emptyCta={{ to: '/events', label: 'Etkinliklere bak' }}
        >
          {favEvents.map(e => (
            <MiniFavCard key={e.id} to="/events" title={e.title} subtitle={formatDate(e.date)} tone="bg-accent/15 text-accent" />
          ))}
        </FavGroup>

        <FavGroup
          title="Egzersizler" icon={<Dumbbell className="size-4" aria-hidden />}
          count={favExercises.length} emptyLabel="Henüz egzersiz eklenmedi."
          emptyCta={{ to: '/exercises', label: 'Egzersizleri gör' }}
        >
          {favExercises.map(e => (
            <MiniFavCard key={e.id} to="/exercises" title={e.title} tone="bg-sky/70 text-primary-deep" />
          ))}
        </FavGroup>
      </section>

      {/* Activity timeline */}
      <section className="rounded-3xl bg-card p-6 ring-1 ring-border/40 hc:bg-white hc:ring-black">
        <div className="mb-4 flex items-center gap-2">
          <span aria-hidden className="grid size-9 place-items-center rounded-full bg-primary/10 text-primary">
            <Activity className="size-4" />
          </span>
          <h2 className="font-display text-base font-extrabold text-primary-deep hc:text-black">Son Aktiviteler</h2>
        </div>

        {activity.length === 0 ? (
          <p className="rounded-2xl bg-muted/60 p-4 text-sm text-muted-foreground">
            Henüz aktivite yok. Favori eklediğinde burada görünür.
          </p>
        ) : (
          <ol className="relative ml-1 space-y-3 border-l border-border/60 pl-5">
            {activity.map(entry => {
              const positive = POSITIVE_KINDS.has(entry.kind)
              const isUnbookmark = entry.kind.endsWith('_unbookmarked')
              return (
                <li key={entry.id} className="relative">
                  <span
                    aria-hidden
                    className={`absolute -left-[27px] top-1.5 size-3.5 rounded-full ring-2 ring-card ${positive ? 'bg-success' : 'bg-muted-foreground/60'}`}
                  />
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-sm text-foreground hc:text-black">
                      {isUnbookmark
                        ? <BookmarkX aria-hidden className="-mt-0.5 mr-1 inline-block size-3.5 text-muted-foreground/80" />
                        : <Bookmark aria-hidden className={`-mt-0.5 mr-1 inline-block size-3.5 ${positive ? 'text-success' : 'text-muted-foreground/80'}`} />
                      }
                      {entry.label}
                    </span>
                    <span className="shrink-0 text-[11px] text-muted-foreground">{relTime(entry.isoDate)}</span>
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </section>

      {/* Privacy & tools */}
      <section className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="rounded-3xl bg-card p-6 ring-1 ring-border/40 hc:bg-white hc:ring-black">
          <h3 className="font-display text-base font-extrabold text-primary-deep hc:text-black">Gizlilik &amp; Veri</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Bilgilerin sadece sana özel öneriler için kullanılır. Profilini sıfırladığında lokal verilerin silinir.
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
        <aside><AccessibilityToolbar /></aside>
      </section>
    </div>
  )
}

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card p-4 ring-1 ring-border/40 hc:bg-white hc:ring-black">
      <div className="flex items-start gap-3">
        <span aria-hidden className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">{icon}</span>
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
          <div className="mt-0.5 truncate font-display text-base font-extrabold text-primary-deep hc:text-black">{value}</div>
        </div>
      </div>
    </div>
  )
}

function FavGroup({
  title, icon, count, emptyLabel, emptyCta, children,
}: {
  title: string; icon: React.ReactNode; count: number
  emptyLabel: string; emptyCta: { to: string; label: string }; children: React.ReactNode
}) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2 px-1">
        <span aria-hidden className="grid size-8 place-items-center rounded-full bg-primary/10 text-primary">{icon}</span>
        <h2 className="font-display text-base font-extrabold text-primary-deep hc:text-black">{title}</h2>
        <span className="rounded-full bg-muted/60 px-2 py-0.5 text-[10px] font-bold text-muted-foreground">{count}</span>
      </div>
      {count === 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-muted/40 p-4 ring-1 ring-border/30">
          <p className="text-sm text-muted-foreground">{emptyLabel}</p>
          <Link to={emptyCta.to} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary-deep">
            <Sparkles aria-hidden className="size-3.5" /> {emptyCta.label}
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
      )}
    </div>
  )
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso
    return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch { return iso }
}

function relTime(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return iso
  const diff = Math.max(0, Date.now() - then)
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'Az önce'
  if (mins < 60) return `${mins} dk önce`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} saat önce`
  const days = Math.floor(hrs / 24)
  if (days === 1) return 'Dün'
  if (days < 7) return `${days} gün önce`
  return new Date(then).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })
}
