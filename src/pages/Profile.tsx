import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BackButton } from '../components/ui/BackButton'
import {
  PersonStanding, Target, Footprints, Pencil, MapPin, CalendarDays,
  Dumbbell, Trash2, Mail, BadgeCheck, ShieldCheck,
  Bookmark, BookmarkX, ArrowRight, ChevronRight,
} from 'lucide-react'

import type { DisabilityType, MobilityLevel, Goal, Facility, SportEvent, Exercise } from '../types'
import { useProfile } from '../contexts/ProfileContext'
import { MiniFavCard } from '../components/feature/MiniFavCard'
import { loadActivityLog, type ActivityEntry, type ActivityKind } from '../lib/activity-log'

import facilitiesData from '../data/facilities.json'
import eventsData from '../data/events.json'
import exercisesData from '../data/exercises.json'

const DISABILITY_LABELS: Record<DisabilityType, string> = {
  wheelchair: 'Tekerlekli Sandalye',
  visual: 'Görme',
  hearing: 'İşitme',
  upper_limb: 'Üst Ekstremite',
}
const MOBILITY_LABELS: Record<MobilityLevel, string> = {
  sitting:            'Oturarak',
  supported:          'Destekle',
  independent:        'Bağımsız',
  upper_limb_limited: 'Kol / El Kısıtlı',
}
const GOAL_LABELS: Record<Goal, string> = {
  strength: 'Güçlenmek',
  flexibility: 'Esneklik',
  social: 'Sosyal',
  performance: 'Performans',
  healthy: 'Sağlıklı',
  compete: 'Yarışma',
}

const POSITIVE_KINDS: ReadonlySet<ActivityKind> = new Set<ActivityKind>([
  'facility_bookmarked', 'event_bookmarked', 'exercise_bookmarked', 'profile_created',
])

const FACILITIES = facilitiesData as Facility[]
const EVENTS = eventsData as SportEvent[]
const EXERCISES = exercisesData as Exercise[]

export function Profile() {
  const { profile, clearProfile, toggleFavoriteFacility, toggleFavoriteEvent, toggleFavoriteExercise } = useProfile()
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
    <div className="mx-auto max-w-5xl pt-2 pb-16">
      <BackButton className="mb-6" />

      {/* Hero — düz, kartsız */}
      <section className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span
            aria-hidden
            className="grid size-14 shrink-0 place-items-center rounded-full bg-primary/10 text-2xl font-extrabold text-primary"
          >
            {initial}
          </span>
          <div>
            <h1 className="text-xl font-extrabold text-primary-deep">UYUM Kullanıcısı</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {profile.disabilityTypes.map(d => DISABILITY_LABELS[d]).join(' · ')} · {profile.city}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                <BadgeCheck aria-hidden className="size-3 text-primary" /> Tamamlanmış Profil
              </span>
              <span className="text-muted-foreground/40">·</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                <ShieldCheck aria-hidden className="size-3 text-primary" /> Anonim
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/onboarding"
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary/40 hover:text-primary"
          >
            <Pencil aria-hidden className="size-3.5" /> Düzenle
          </Link>
        </div>
      </section>

      <div className="grid gap-10 lg:grid-cols-[1fr_22rem]">
        <div className="min-w-0 space-y-10">

          {/* Temel bilgiler — çizgi ayraçlı liste */}
          <section aria-labelledby="basics-heading">
            <h2 id="basics-heading" className="mb-1 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              Temel Bilgiler
            </h2>
            <div className="divide-y divide-border/50">
              <InfoRow icon={<PersonStanding className="size-4" aria-hidden />} label="Engel Tipi">
                {profile.disabilityTypes.map(d => DISABILITY_LABELS[d]).join(', ')}
              </InfoRow>
              <InfoRow icon={<Footprints className="size-4" aria-hidden />} label="Hareket">
                {MOBILITY_LABELS[profile.mobilityLevel]}
              </InfoRow>
              <InfoRow icon={<Target className="size-4" aria-hidden />} label="Hedefler">
                {profile.goals.map(g => GOAL_LABELS[g]).join(', ')}
              </InfoRow>
            </div>
          </section>

          {/* Kaydedilenler */}
          <section aria-labelledby="saved-heading">
            <h2 id="saved-heading" className="mb-1 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              Kaydedilenler
            </h2>
            <div className="divide-y divide-border/50">
              <SavedGroup
                icon={<MapPin className="size-4" aria-hidden />}
                label="Tesisler"
                count={favFacilities.length}
                to="/map"
                ctaLabel="Tesisleri keşfet"
              >
                {favFacilities.map(f => (
                  <MiniFavCard key={f.id} to={`/facility/${f.id}`} title={f.name} subtitle={f.district} tone="bg-sky/20 text-sky-foreground" onRemove={() => toggleFavoriteFacility(f.id)} />
                ))}
              </SavedGroup>

              <SavedGroup
                icon={<CalendarDays className="size-4" aria-hidden />}
                label="Etkinlikler"
                count={favEvents.length}
                to="/events"
                ctaLabel="Etkinliklere bak"
              >
                {favEvents.map(e => (
                  <MiniFavCard key={e.id} to="/events" title={e.title} subtitle={formatDate(e.date)} tone="bg-primary/10 text-primary" onRemove={() => toggleFavoriteEvent(e.id)} />
                ))}
              </SavedGroup>

              <SavedGroup
                icon={<Dumbbell className="size-4" aria-hidden />}
                label="Egzersizler"
                count={favExercises.length}
                to="/exercises"
                ctaLabel="Egzersizleri gör"
              >
                {favExercises.map(e => (
                  <MiniFavCard key={e.id} to="/exercises" title={e.title} tone="bg-accent/15 text-accent" onRemove={() => toggleFavoriteExercise(e.id)} />
                ))}
              </SavedGroup>
            </div>
          </section>

          {/* Aktivite */}
          <section aria-labelledby="activity-heading">
            <h2 id="activity-heading" className="mb-1 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              Son Aktiviteler
            </h2>
            {activity.length === 0 ? (
              <p className="py-6 text-sm text-muted-foreground">
                Henüz aktivite yok. Favori eklediğinde burada görünür.
              </p>
            ) : (
              <ol className="divide-y divide-border/50">
                {activity.map(entry => {
                  const positive = POSITIVE_KINDS.has(entry.kind)
                  const isUnbookmark = entry.kind.endsWith('_unbookmarked')
                  return (
                    <li key={entry.id} className="flex items-center gap-3 py-3.5">
                      <span aria-hidden className={`size-1.5 shrink-0 rounded-full ${positive ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                      <span className="flex-1 text-sm text-foreground">
                        {isUnbookmark
                          ? <BookmarkX aria-hidden className="-mt-0.5 mr-1 inline-block size-3.5 text-muted-foreground" />
                          : <Bookmark aria-hidden className={`-mt-0.5 mr-1 inline-block size-3.5 ${positive ? 'text-primary' : 'text-muted-foreground'}`} />
                        }
                        {entry.label}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">{relTime(entry.isoDate)}</span>
                    </li>
                  )
                })}
              </ol>
            )}
          </section>
        </div>

        {/* Sağ kolon: veri kontrolü */}
        <aside className="space-y-8">
          <section aria-labelledby="data-heading">
            <h2 id="data-heading" className="mb-1 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              Veri &amp; Gizlilik
            </h2>
            <div className="divide-y divide-border/50">
              <div className="py-4 text-sm leading-relaxed text-muted-foreground">
                Profil bilgilerin hiçbir sunucuya gönderilmez. Tamamen tarayıcında saklanır.
              </div>
              <a
                href="mailto:hello@uyum.app"
                className="flex w-full items-center justify-between py-3.5 text-sm font-medium text-foreground transition hover:text-primary"
              >
                <span className="flex items-center gap-2">
                  <Mail aria-hidden className="size-4 text-muted-foreground" /> Bize ulaş
                </span>
                <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
              </a>
              <button
                type="button"
                onClick={handleReset}
                className="flex w-full items-center justify-between py-3.5 text-sm font-medium text-destructive transition hover:text-destructive/70"
              >
                <span className="flex items-center gap-2">
                  <Trash2 aria-hidden className="size-4" /> Verilerimi Sıfırla
                </span>
                <ChevronRight className="size-4" aria-hidden />
              </button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

function InfoRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 py-3.5">
      <span aria-hidden className="shrink-0 text-muted-foreground">{icon}</span>
      <span className="w-28 shrink-0 text-xs font-semibold text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{children}</span>
    </div>
  )
}

function SavedGroup({
  icon, label, count, to, ctaLabel, children,
}: {
  icon: React.ReactNode
  label: string
  count: number
  to: string
  ctaLabel: string
  children: React.ReactNode
}) {
  return (
    <div className="py-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <span aria-hidden className="text-muted-foreground">{icon}</span>
          {label}
          <span className="text-xs text-muted-foreground">({count})</span>
        </span>
        <Link
          to={to}
          className="flex items-center gap-1 text-xs font-semibold text-primary transition hover:text-primary-deep"
        >
          {count === 0 ? ctaLabel : 'Tümünü gör'} <ArrowRight aria-hidden className="size-3" />
        </Link>
      </div>
      {count > 0 && (
        <div className="grid gap-2 sm:grid-cols-2">{children}</div>
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
