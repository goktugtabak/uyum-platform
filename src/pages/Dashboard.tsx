import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MapPin, Sparkles, ArrowRight, Heart, ChevronRight,
  Waves, CircleDot, Activity, Target, CalendarDays, FileSpreadsheet,
  Footprints,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
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
import { ScoreBadge } from '../components/ui/ScoreBadge'
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
          <h1 className="text-[clamp(2.2rem,4vw,3.4rem)] font-extrabold leading-[1.05] tracking-tight text-primary-deep">
            Merhaba!
          </h1>
          <p className="mt-3 max-w-md text-base text-muted-foreground">
            Bugün hareket etmek için harika bir gün. <br />
            <span className="font-semibold text-foreground">
              {profile.disabilityTypes.map(d => DISABILITY_LABELS[d]).join(' · ')}
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
                  'bg-accent/15 text-accent'
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

          <div>
            {/* Leaflet mini map preview */}
            <div className="relative mt-5 h-44 overflow-hidden rounded-3xl">
              <MiniMap facilities={facilities} ranked={ranked.map(r => r.facility)} />
            </div>

            <ul className="mt-6 space-y-5">
              {ranked.map(({ facility, overall }, idx) => {
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
                      <ScoreBadge color={overall} size="sm" />
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

            <Link
              to="/map"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-glow hover:bg-primary-deep transition"
            >
              <MapPin className="size-4" aria-hidden /> Haritada tüm tesisleri gör
            </Link>
          </div>
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
                    <div className="grid size-10 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
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
                      'bg-accent/15 text-accent'
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
                    'bg-accent/15 text-accent'
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
                      <span className="text-xl font-extrabold leading-none">{d.getDate()}</span>
                      <span className="text-[10px] uppercase tracking-wider">{MONTHS_TR[d.getMonth()].slice(0, 5)}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold">{upcomingEvent.title}</div>
                      <div className="text-[11.5px] text-muted-foreground">
                        {WEEKDAYS_TR[d.getDay()]} · {d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-[11.5px] text-muted-foreground"> {facilityName}</div>
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
            className="relative mt-9 block overflow-hidden rounded-[2rem] bg-primary-deep px-6 py-7 text-primary-foreground"
          >
            <div className="absolute -right-8 -top-8 size-40 rounded-full bg-mint/20 blur-2xl" aria-hidden />
            <FileSpreadsheet className="size-7 opacity-90" aria-hidden />
            <h3 className="mt-3  text-lg font-extrabold">İlk ziyaret rehberini oluştur</h3>
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
        <h2 className="flex items-center gap-2  text-[19px] font-extrabold text-primary-deep">
          {icon} {title}
        </h2>
        {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
      </div>
      <Link to={to} className="text-xs font-semibold text-primary">Tümünü gör →</Link>
    </div>
  )
}

const ANKARA_CENTER: [number, number] = [39.9208, 32.8541]

function makeDotIcon(color: string, size = 12) {
  return L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.35)"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

const PIN_COLORS = ['#4C2A85', '#6b5fc7', '#f97316', '#22c55e']

function MiniMap({ facilities, ranked }: { facilities: Facility[]; ranked: Facility[] }) {
  const pins = facilities.slice(0, 4)

  const center: [number, number] = ranked.length > 0
    ? [
        ranked.reduce((s, f) => s + f.coordinates.lat, 0) / ranked.length,
        ranked.reduce((s, f) => s + f.coordinates.lng, 0) / ranked.length,
      ]
    : ANKARA_CENTER

  return (
    <div className="absolute inset-0 overflow-hidden rounded-3xl">
      <MapContainer
        center={center}
        zoom={13}
        zoomControl={false}
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
        touchZoom={false}
        keyboard={false}
        attributionControl={false}
        style={{ height: '100%', width: '100%' }}
        aria-label="Yakındaki tesisler haritası"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {pins.map((f, i) => {
          const isRanked = ranked.some(r => r.id === f.id)
          return (
            <Marker
              key={f.id}
              position={[f.coordinates.lat, f.coordinates.lng]}
              icon={makeDotIcon(PIN_COLORS[i % PIN_COLORS.length], isRanked ? 14 : 10)}
            />
          )
        })}
      </MapContainer>
      {/* Overlay: subtle vignette + non-interactive shield */}
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl"
        style={{ boxShadow: 'inset 0 0 30px rgba(0,0,0,0.08)' }}
        aria-hidden
      />
    </div>
  )
}
