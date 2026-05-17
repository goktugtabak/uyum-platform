import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MapPin, Sparkles, ArrowRight, Heart, Plus, ChevronRight,
  Waves, CircleDot, Activity, Target, CalendarDays, FileSpreadsheet,
  Footprints,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useProfile } from '../contexts/ProfileContext'
import { loadFacilities } from '../lib/overpass-loader'
import { pickTopFacilities } from '../lib/facility-rank'
import { matchSports } from '../lib/sport-match'
import { getSportLabel } from '../lib/sport-icons'
import { loadTestimonies } from '../lib/testimony-store'
import { formatRelative } from '../lib/live-status'
import sportsData from '../data/sports.json'
import eventsData from '../data/events.json'
import type { Facility, Sport, SportEvent, Testimony, DisabilityType } from '../types'
import dashHero from '../assets/dashboard-hero.jpg'
import facilityEryaman from '../assets/facility-eryaman.jpg'
import facilityPool from '../assets/facility-pool.jpg'
import sportSwim from '../assets/sport-swimming.jpg'
import sportBasket from '../assets/sport-basketball.jpg'
import sportTT from '../assets/sport-tabletennis.jpg'

const NEARBY_LIMIT = 3

const DISABILITY_LABELS: Record<DisabilityType, string> = {
  wheelchair: 'Tekerlekli Sandalye',
  visual:     'Görme',
  hearing:    'İşitme',
  upper_limb: 'Üst Ekstremite',
}

const FACILITY_THUMBS: string[] = [facilityEryaman, facilityPool, sportBasket, sportTT, sportSwim]
const EVENT_THUMBS: Record<string, string> = {
  's-swim':              sportSwim,
  's-wheelchair-basket': sportBasket,
  's-aqua':              facilityPool,
  's-yoga':              facilityPool,
  's-pilates':           facilityPool,
}

const SPORT_DISCOVERY_ICONS: Array<{ icon: LucideIcon; c: 'sky' | 'mint' | 'lavender' | 'peach' }> = [
  { icon: Waves,     c: 'sky'      },
  { icon: CircleDot, c: 'mint'     },
  { icon: Activity,  c: 'lavender' },
  { icon: Target,    c: 'peach'    },
]

const MONTHS_TR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
const WEEKDAYS_TR = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']

function getEventImage(sportId: string): string {
  return EVENT_THUMBS[sportId] ?? sportSwim
}

function getFacilityImage(facility: Facility, fallbackIndex: number): string {
  if (facility.photos?.[0]?.url) return facility.photos[0].url
  const facilityId = facility.id
  if (facilityId.includes('eryaman')) return facilityEryaman
  if (facilityId.includes('havuz') || facilityId.includes('yuzme') || facilityId.includes('olimpik')) return facilityPool
  if (facilityId.includes('basket')) return sportBasket
  if (facilityId.includes('ted') || facilityId.includes('tenis')) return sportTT
  return FACILITY_THUMBS[fallbackIndex % FACILITY_THUMBS.length]
}

function estimatedDistance(facility: Facility): number {
  // Ankara merkez (~Kızılay) referans: 39.9208, 32.8541
  const lat0 = 39.9208, lng0 = 32.8541
  const dLat = (facility.coordinates.lat - lat0) * 111
  const dLng = (facility.coordinates.lng - lng0) * 95
  const km = Math.sqrt(dLat * dLat + dLng * dLng)
  return Math.round(km * 10) / 10
}

export function Dashboard() {
  const { profile } = useProfile()
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [now] = useState<number>(() => Date.now())
  const [testimonies] = useState<Testimony[]>(() => loadTestimonies().slice(0, 2))

  useEffect(() => {
    loadFacilities().then(setFacilities).catch(() => setFacilities([]))
  }, [])

  const ranked = useMemo(() => {
    if (!profile || facilities.length === 0) return []
    return pickTopFacilities(facilities, profile, NEARBY_LIMIT)
  }, [facilities, profile])

  const sportSuggestions = useMemo<Sport[]>(() => {
    if (!profile) return []
    return matchSports(profile, sportsData as Sport[]).slice(0, 4).map(m => m.sport)
  }, [profile])

  const upcomingEvent = useMemo<SportEvent | null>(() => {
    return ((eventsData as SportEvent[]).slice()
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .find(e => new Date(e.date).getTime() > now)) ?? null
  }, [now])

  if (!profile) return null

  return (
    <div className="mx-auto max-w-7xl pt-2">
      {/* Hero — open, no card; image fades into canvas */}
      <section className="relative mb-16 grid grid-cols-1 items-center gap-8 md:grid-cols-12">
        <div className="md:col-span-7">
          <h1 className="flex flex-wrap items-center gap-3 font-display text-[clamp(2.2rem,4vw,3.4rem)] font-extrabold leading-[1.05] tracking-tight text-primary-deep">
            Merhaba! <span aria-hidden>👋</span>
          </h1>
          <p className="mt-3 max-w-md text-base text-muted-foreground">
            Bugün hareket etmek için harika bir gün. <br />
            <span className="font-semibold text-foreground">
              {DISABILITY_LABELS[profile.disabilityType]}
            </span>{' '}
            profiline göre sana en uygun seçenekleri keşfet.
          </p>

          <div className="mt-9 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-3">
            {[
              { i: MapPin,       t: 'Tesisleri Keşfet',        d: 'Sana uygun tesisleri bul',   c: 'mint'     as const, to: '/map'    as const },
              { i: Footprints,   t: 'Sporları Keşfet',         d: 'Sana uygun sporları öğren', c: 'lavender' as const, to: '/match'  as const },
              { i: CalendarDays, t: 'Yakındaki Etkinlikler',   d: 'Etkinlikleri incele',       c: 'peach'    as const, to: '/events' as const },
            ].map(({ i: I, t, d, c, to }) => (
              <Link key={t} to={to} className="group flex items-center gap-2.5">
                <span className={`grid size-11 shrink-0 place-items-center rounded-full ${
                  c === 'mint' ? 'bg-mint/70 text-mint-foreground' :
                  c === 'lavender' ? 'bg-accent/15 text-accent' :
                  'bg-[oklch(0.92_0.07_60)] text-[oklch(0.55_0.16_50)]'
                }`}>
                  <I className="size-[18px]" strokeWidth={1.8} aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-bold leading-tight text-foreground">{t}</div>
                  <div className="text-[11px] leading-tight text-muted-foreground">{d}</div>
                </div>
                <ArrowRight className="size-3.5 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden />
              </Link>
            ))}
          </div>
        </div>

        {/* Photo fades into background — no card, no border */}
        <div className="relative h-72 md:col-span-5 md:h-80">
          <img
            src={dashHero}
            alt="Spor yapan kullanıcı"
            className="absolute inset-0 h-full w-full object-cover"
            style={{
              WebkitMaskImage:
                'linear-gradient(to left, black 60%, transparent), linear-gradient(to bottom, black 70%, transparent)',
              WebkitMaskComposite: 'source-in',
              maskImage:
                'linear-gradient(to left, black 60%, transparent), linear-gradient(to bottom, black 70%, transparent)',
              maskComposite: 'intersect',
            }}
          />
        </div>
      </section>

      {/* 3 flowing columns — no containers */}
      <div className="grid gap-12 xl:grid-cols-3">
        {/* Nearby facilities */}
        <section>
          <SectionHeader icon={<MapPin className="size-4 text-primary" aria-hidden />} title="Yakındaki Tesisler" to="/map" />

          {/* Soft mini map (no border) */}
          <div className="relative mt-5 h-44 overflow-hidden rounded-3xl">
            <MiniMap />
          </div>

          <ul className="mt-6 space-y-5">
            {ranked.map(({ facility, verifiedCount }, idx) => {
              const scorePct = Math.round((verifiedCount / 6) * 100)
              return (
                <li key={facility.id}>
                  <Link to={`/facility/${facility.id}`} className="flex items-center gap-3 hover:opacity-90">
                    <img
                      src={getFacilityImage(facility, idx)}
                      alt=""
                      className="size-14 rounded-2xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-bold text-foreground">{facility.name}</div>
                      <div className="text-[11.5px] text-muted-foreground">
                        {estimatedDistance(facility)} km · {facility.district.split(',')[0]}
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 text-foreground/40">
                        {[Activity, MapPin, Waves, CircleDot].map((I, i) => (
                          <I key={i} className="size-3" aria-hidden />
                        ))}
                      </div>
                    </div>
                    <span className="rounded-full bg-mint/60 px-2.5 py-1 text-[11px] font-bold text-mint-foreground">
                      %{scorePct} Uygun
                    </span>
                  </Link>
                </li>
              )
            })}
            {ranked.length === 0 && (
              <li className="text-sm text-muted-foreground">
                Profiline uygun tesis bulunamadı.{' '}
                <Link to="/map" className="text-primary underline">Haritadan ara</Link>.
              </li>
            )}
          </ul>

          <Link to="/map" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
            Haritadaki tüm tesisleri gör <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </section>

        {/* Community feed */}
        <section className="relative">
          <SectionHeader icon={<Heart className="size-4 text-destructive" aria-hidden />} title="Topluluk Akışı" to="/community" />

          <div className="mt-5 space-y-8">
            {testimonies.map((t, i) => {
              const name = t.anonymous || !t.displayName ? 'Anonim' : t.displayName
              const facilityName = facilities.find(f => f.id === t.facilityId)?.name ?? 'Tesis'
              const supporters = 18 + ((i * 5) % 15)
              return (
                <article key={t.id}>
                  <header className="flex items-center gap-3">
                    <div className="grid size-10 place-items-center rounded-full bg-gradient-brand text-xs font-bold text-primary-foreground">
                      {name[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold">{name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {formatRelative(t.timestamp)} · {facilityName}
                      </div>
                    </div>
                  </header>
                  <p className="mt-3 text-[14px] leading-relaxed text-foreground/90">{t.text}</p>
                  {i === 0 && (
                    <img src={sportBasket} alt="" className="mt-3 h-44 w-full rounded-3xl object-cover" />
                  )}
                  <footer className="mt-3 flex items-center gap-5 text-[12.5px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="flex -space-x-1" aria-hidden>
                        {[0, 1, 2].map(k => (
                          <span key={k} className="grid size-5 place-items-center rounded-full bg-mint text-[8px] ring-2 ring-background">·</span>
                        ))}
                      </span>
                      {supporters} kişi destekledi
                    </span>
                    <span className="ml-auto inline-flex items-center gap-1.5 font-semibold text-destructive">
                      <Heart className="size-3.5 fill-current" aria-hidden /> {12 + i * 9}
                    </span>
                  </footer>
                </article>
              )
            })}
            {testimonies.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Henüz tanıklık paylaşılmamış. İlk paylaşan sen ol.
              </p>
            )}
          </div>

          <Link to="/community" className="mt-8 block text-center text-sm font-semibold text-primary">
            Paylaş, ilham ver, destek ol.
          </Link>

          <Link
            to="/community"
            aria-label="Paylaş"
            className="fixed bottom-8 right-8 z-20 grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-glow"
          >
            <Plus className="size-6" aria-hidden />
          </Link>
        </section>

        {/* Personalised discovery */}
        <section>
          <SectionHeader icon={<Sparkles className="size-4 text-primary" aria-hidden />} title="Sana Özel Keşif" sub="Profiline göre öneriler" to="/match" />

          <div className="mt-5">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
              <Target className="size-4" aria-hidden /> Sana Önerilen Sporlar
            </div>
            <div className="mt-5 grid grid-cols-4 gap-2">
              {sportSuggestions.map((s, i) => {
                const meta = SPORT_DISCOVERY_ICONS[i % SPORT_DISCOVERY_ICONS.length]
                const Icon = meta.icon
                return (
                  <Link key={s.id} to="/match" className="group flex flex-col items-center gap-2">
                    <div className={`grid size-14 place-items-center rounded-full ${
                      meta.c === 'sky' ? 'bg-sky/70 text-sky-foreground' :
                      meta.c === 'mint' ? 'bg-mint/70 text-mint-foreground' :
                      meta.c === 'lavender' ? 'bg-accent/15 text-accent' :
                      'bg-[oklch(0.92_0.07_60)] text-[oklch(0.55_0.16_50)]'
                    }`}>
                      <Icon className="size-6" strokeWidth={1.7} aria-hidden />
                    </div>
                    <span className="text-[11px] font-semibold text-foreground text-center">
                      {getSportLabel(s.id) || s.name}
                    </span>
                  </Link>
                )
              })}
              {sportSuggestions.length === 0 &&
                SPORT_DISCOVERY_ICONS.map(({ icon: Icon, c }, i) => (
                  <div key={i} className={`grid size-14 place-items-center rounded-full ${
                    c === 'sky' ? 'bg-sky/70 text-sky-foreground' :
                    c === 'mint' ? 'bg-mint/70 text-mint-foreground' :
                    c === 'lavender' ? 'bg-accent/15 text-accent' :
                    'bg-[oklch(0.92_0.07_60)] text-[oklch(0.55_0.16_50)]'
                  }`}>
                    <Icon className="size-6" strokeWidth={1.7} aria-hidden />
                  </div>
                ))}
            </div>
          </div>

          {upcomingEvent && (
            <div className="mt-9">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="inline-flex items-center gap-2 text-sm font-bold text-primary-deep">
                  <CalendarDays className="size-4 text-primary" aria-hidden /> Yaklaşan Etkinlikler
                </h3>
                <Link to="/events" className="text-xs font-semibold text-primary">Tümünü gör →</Link>
              </div>
              {(() => {
                const d = new Date(upcomingEvent.date)
                const facilityName = facilities.find(f => f.id === upcomingEvent.facilityId)?.name ?? 'Tesis'
                return (
                  <Link to="/events" className="flex items-center gap-4">
                    <div className="flex flex-col items-center rounded-2xl bg-primary/10 px-3 py-2 text-primary-deep">
                      <span className="font-display text-xl font-extrabold leading-none">{d.getDate()}</span>
                      <span className="text-[10px] uppercase tracking-wider">{MONTHS_TR[d.getMonth()].slice(0, 5)}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold">{upcomingEvent.title}</div>
                      <div className="text-[11.5px] text-muted-foreground">
                        {WEEKDAYS_TR[d.getDay()]} · {d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-[11.5px] text-muted-foreground">📍 {facilityName}</div>
                    </div>
                    <span className="rounded-full bg-mint/60 px-2 py-1 text-[10px] font-bold text-mint-foreground">
                      Ücretsiz
                    </span>
                    <img src={getEventImage(upcomingEvent.sport)} alt="" className="size-16 rounded-2xl object-cover" />
                  </Link>
                )
              })()}
              <p className="mt-3 text-[11.5px] text-muted-foreground">12 katılacak</p>
            </div>
          )}

          {/* Soft CTA — not a box, just gradient surface with content */}
          <Link
            to="/match"
            className="relative mt-9 block overflow-hidden rounded-[2rem] bg-gradient-deep px-6 py-7 text-primary-foreground"
          >
            <div className="absolute -right-8 -top-8 size-40 rounded-full bg-mint/20 blur-2xl" aria-hidden />
            <FileSpreadsheet className="size-7 opacity-90" aria-hidden />
            <h3 className="mt-3 font-display text-lg font-extrabold">İlk ziyaret rehberini oluştur</h3>
            <p className="mt-1 text-[12.5px] text-primary-foreground/75">
              Seçtiğin tesis için kişisel rehberini hazırlayalım.
            </p>
            <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-xs font-bold text-primary-deep">
              Rehber oluştur <ChevronRight className="size-3.5" aria-hidden />
            </span>
          </Link>
        </section>
      </div>
    </div>
  )
}

function SectionHeader({
  icon, title, sub, to,
}: {
  icon: React.ReactNode
  title: string
  sub?: string
  to: string
}) {
  return (
    <div className="flex items-end justify-between">
      <div>
        <h2 className="flex items-center gap-2 font-display text-[19px] font-extrabold text-primary-deep">
          {icon} {title}
        </h2>
        {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
      </div>
      <Link to={to} className="text-xs font-semibold text-primary">Tümünü gör →</Link>
    </div>
  )
}

function MiniMap() {
  return (
    <div className="absolute inset-0 bg-[oklch(0.96_0.02_240)]">
      <svg viewBox="0 0 400 200" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <pattern id="dash-grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M32 0H0V32" stroke="oklch(0.88 0.03 240)" strokeWidth="0.6" fill="none" />
          </pattern>
        </defs>
        <rect width="400" height="200" fill="url(#dash-grid)" />
        <path d="M0 110 Q 120 80, 220 120 T 400 130" stroke="oklch(0.82 0.04 240)" strokeWidth="6" fill="none" opacity="0.7" />
        <path d="M180 0 Q 160 90, 200 130 T 240 200" stroke="oklch(0.82 0.04 240)" strokeWidth="5" fill="none" opacity="0.6" />
        <ellipse cx="80" cy="50" rx="42" ry="22" fill="oklch(0.92 0.08 140 / 0.5)" />
        <ellipse cx="320" cy="160" rx="50" ry="26" fill="oklch(0.92 0.08 140 / 0.5)" />
      </svg>
      <MiniPin top="34%" left="22%" color="violet" />
      <MiniPin top="56%" left="48%" color="violet" big />
      <MiniPin top="22%" right="22%" color="peach" />
      <MiniPin bottom="20%" left="38%" color="mint" />
    </div>
  )
}

function MiniPin({
  color, big, ...pos
}: {
  color: 'violet' | 'peach' | 'mint'
  big?: boolean
  top?: string; left?: string; right?: string; bottom?: string
}) {
  const c =
    color === 'violet' ? 'text-primary' :
    color === 'peach' ? 'text-[oklch(0.62_0.18_55)]' :
    'text-mint-foreground'
  return (
    <div className="absolute -translate-x-1/2 -translate-y-full" style={pos}>
      <svg className={`${big ? 'size-9' : 'size-6'} ${c}`} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 2 C 7 2, 4 5.5, 4 9.5 C 4 15, 12 22, 12 22 C 12 22, 20 15, 20 9.5 C 20 5.5, 17 2, 12 2 Z" />
        <circle cx="12" cy="9.5" r="2.8" fill="white" />
      </svg>
    </div>
  )
}
