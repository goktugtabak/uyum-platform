import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BackButton } from '../components/ui/BackButton'
import {
  PersonStanding, Target, Footprints, Pencil, MapPin, CalendarDays,
  Dumbbell, Trash2, Mail, BadgeCheck, ShieldCheck, Activity,
  Bookmark, BookmarkX, ArrowRight,
} from 'lucide-react'

import type { DisabilityType, MobilityLevel, Goal, Facility, SportEvent, Exercise } from '../types'
import { useProfile } from '../contexts/ProfileContext'
import { AccessibilityToolbar } from '../components/a11y/AccessibilityToolbar'
import { MiniFavCard } from '../components/feature/MiniFavCard'
import { loadActivityLog, type ActivityEntry, type ActivityKind } from '../lib/activity-log'

import facilitiesData from '../data/facilities.json'
import eventsData from '../data/events.json'
import exercisesData from '../data/exercises.json'

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
    <div className="mx-auto max-w-5xl space-y-12 pt-4">
      <BackButton className="mb-6" />
      {/* Hero Header - Flat, Modern */}
      <section className="relative overflow-hidden rounded-[2rem] bg-primary-deep p-8 shadow-sm sm:p-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-6">
            <span
              aria-hidden
              className="grid size-16 place-items-center rounded-full bg-primary text-2xl font-extrabold text-primary-foreground ring-4 ring-white/30 shadow-glow"
            >
              {initial}
            </span>
            <div className="min-w-0">
              <h1 className="text-2xl font-extrabold text-white sm:text-3xl">UYUM Kullanıcısı</h1>
              <p className="mt-1 text-base text-white/80">
                {profile.disabilityTypes.map(d => DISABILITY_LABELS[d]).join(' · ')} · {profile.city}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white">
                  <BadgeCheck aria-hidden className="size-4" /> Tamamlanmış Profil
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white">
                  <ShieldCheck aria-hidden className="size-4" /> Anonim
                </span>
              </div>
            </div>
          </div>
          <Link
            to="/onboarding"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-primary-deep transition-colors hover:bg-muted"
          >
            <Pencil aria-hidden className="size-4" /> Profili Düzenle
          </Link>
        </div>
      </section>

      {/* Profile facts */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-extrabold text-primary-deep">Temel Bilgiler</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Fact icon={<PersonStanding className="size-5" aria-hidden />} label="Engel Tipi" value={profile.disabilityTypes.map(d => DISABILITY_LABELS[d]).join(', ')} />
          <Fact icon={<Footprints className="size-5" aria-hidden />} label="Hareket" value={MOBILITY_LABELS[profile.mobilityLevel]} />
          <Fact icon={<Target className="size-5" aria-hidden />} label="Hedef" value={profile.goals.map(g => GOAL_LABELS[g]).join(', ')} />
        </div>
      </section>

      {/* Favorites */}
      <section className="space-y-10 border-t border-border/60 pt-10">
        <FavGroup
          title="Kaydedilen Tesisler" icon={<MapPin className="size-5" aria-hidden />}
          count={favFacilities.length} emptyLabel="Henüz tesis eklenmedi."
          emptyCta={{ to: '/map', label: 'Tesisleri keşfet' }}
        >
          {favFacilities.map(f => (
            <MiniFavCard key={f.id} to={`/facility/${f.id}`} title={f.name} subtitle={f.district} tone="bg-sky/20 text-sky-foreground" />
          ))}
        </FavGroup>

        <FavGroup
          title="Kaydedilen Etkinlikler" icon={<CalendarDays className="size-5" aria-hidden />}
          count={favEvents.length} emptyLabel="Henüz etkinlik eklenmedi."
          emptyCta={{ to: '/events', label: 'Etkinliklere bak' }}
        >
          {favEvents.map(e => (
            <MiniFavCard key={e.id} to="/events" title={e.title} subtitle={formatDate(e.date)} tone="bg-primary/10 text-primary" />
          ))}
        </FavGroup>

        <FavGroup
          title="Kaydedilen Egzersizler" icon={<Dumbbell className="size-5" aria-hidden />}
          count={favExercises.length} emptyLabel="Henüz egzersiz eklenmedi."
          emptyCta={{ to: '/exercises', label: 'Egzersizleri gör' }}
        >
          {favExercises.map(e => (
            <MiniFavCard key={e.id} to="/exercises" title={e.title} tone="bg-accent/15 text-accent" />
          ))}
        </FavGroup>
      </section>

      {/* Activity & Tools Split */}
      <section className="grid gap-8 border-t border-border/60 pt-10 lg:grid-cols-[1fr_24rem]">
        {/* Activity timeline */}
        <div className="rounded-[2rem] bg-secondary p-8">
          <div className="mb-6 flex items-center gap-3">
            <span aria-hidden className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
              <Activity className="size-5" />
            </span>
            <h2 className="text-xl font-extrabold text-primary-deep hc:text-black">Son Aktiviteler</h2>
          </div>

          {activity.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Henüz aktivite yok. Favori eklediğinde burada görünür.
            </p>
          ) : (
            <ol className="relative ml-2 space-y-6 border-l-2 border-primary/20 pl-6">
              {activity.map(entry => {
                const positive = POSITIVE_KINDS.has(entry.kind)
                const isUnbookmark = entry.kind.endsWith('_unbookmarked')
                return (
                  <li key={entry.id} className="relative">
                    <span
                      aria-hidden
                      className={`absolute -left-[31px] top-1.5 size-4 rounded-full ring-4 ring-secondary ${positive ? 'bg-primary' : 'bg-muted-foreground/40'}`}
                    />
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-foreground hc:text-black">
                        {isUnbookmark
                          ? <BookmarkX aria-hidden className="-mt-0.5 mr-1.5 inline-block size-4 text-muted-foreground" />
                          : <Bookmark aria-hidden className={`-mt-0.5 mr-1.5 inline-block size-4 ${positive ? 'text-primary' : 'text-muted-foreground'}`} />
                        }
                        {entry.label}
                      </span>
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{relTime(entry.isoDate)}</span>
                    </div>
                  </li>
                )
              })}
            </ol>
          )}
        </div>

        {/* Sidebar Tools */}
        <aside className="space-y-6">
          <AccessibilityToolbar />

          <div className="rounded-[2rem] bg-muted p-8">
            <h3 className="text-xl font-extrabold text-primary-deep hc:text-black">Veri Kontrolü</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Profil bilgilerin hiçbir sunucuya gönderilmez. Tamamen tarayıcında saklanır. Ayarları sıfırlayarak lokal verilerini temizleyebilirsin.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <a
                href="mailto:hello@uyum.app"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-primary transition-colors hover:bg-gray-50"
              >
                <Mail aria-hidden className="size-4" /> Bize ulaş
              </a>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-destructive/20 bg-destructive/10 px-5 py-3 text-sm font-bold text-destructive transition-colors hover:bg-destructive/20"
              >
                <Trash2 aria-hidden className="size-4" /> Verilerimi Sıfırla
              </button>
            </div>
          </div>
        </aside>
      </section>
    </div>
  )
}

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] bg-secondary p-5 transition-colors hover:bg-muted">
      <div className="flex items-center gap-4">
        <span aria-hidden className="grid size-12 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">{icon}</span>
        <div className="min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="mt-1 truncate text-lg font-extrabold text-primary-deep hc:text-black">{value}</div>
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
      <div className="mb-5 flex items-center gap-3 px-2">
        <span aria-hidden className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">{icon}</span>
        <h2 className="text-xl font-extrabold text-primary-deep hc:text-black">{title}</h2>
        <span className="rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground">{count}</span>
      </div>
      {count === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-[2rem] bg-secondary py-12 text-center">
          <p className="text-base font-medium text-muted-foreground">{emptyLabel}</p>
          <Link to={emptyCta.to} className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90">
            {emptyCta.label} <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
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
