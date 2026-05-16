import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MapPin, Sparkles, Heart, ArrowRight, Footprints, CalendarDays, ChevronRight,
  FileSpreadsheet, Target, Plus,
} from 'lucide-react'
import { useProfile } from '../contexts/ProfileContext'
import { loadFacilities } from '../lib/overpass-loader'
import { pickTopFacilities } from '../lib/facility-rank'
import { matchSports } from '../lib/sport-match'
import sportsData from '../data/sports.json'
import eventsData from '../data/events.json'
import { DemoBadge } from '../components/ui/DemoBadge'
import { MiniFacilityCard } from '../components/feature/MiniFacilityCard'
import { CommunityFeed } from '../components/feature/CommunityFeed'
import { getSportIcon, getSportLabel } from '../lib/sport-icons'
import type { Facility, Sport, SportEvent } from '../types'
import dashHero from '../assets/dashboard-hero.jpg'

const NEARBY_LIMIT = 3

const DISABILITY_LABELS: Record<string, string> = {
  wheelchair: 'Tekerlekli Sandalye',
  visual:     'Görme',
  hearing:    'İşitme',
  upper_limb: 'Üst Ekstremite',
}

function NearbySkeleton() {
  return (
    <ul className="mt-4 space-y-3" aria-hidden>
      {Array.from({ length: NEARBY_LIMIT }).map((_, i) => (
        <li key={i} className="h-16 animate-pulse rounded-2xl bg-card/60" />
      ))}
    </ul>
  )
}

function MiniMap() {
  return (
    <div className="absolute inset-0 bg-[oklch(0.96_0.02_240)]" aria-hidden>
      <svg viewBox="0 0 400 200" className="absolute inset-0 h-full w-full">
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
  const cls =
    color === 'violet' ? 'text-primary' :
    color === 'peach' ? 'text-[oklch(0.62_0.18_55)]' :
    'text-mint-foreground'
  return (
    <div className="absolute -translate-x-1/2 -translate-y-full" style={pos} aria-hidden>
      <svg className={`${big ? 'size-9' : 'size-6'} ${cls}`} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2 C 7 2, 4 5.5, 4 9.5 C 4 15, 12 22, 12 22 C 12 22, 20 15, 20 9.5 C 20 5.5, 17 2, 12 2 Z" />
        <circle cx="12" cy="9.5" r="2.8" fill="white" />
      </svg>
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
      <Link to={to} className="text-xs font-semibold text-primary hover:text-primary-deep">
        Tümünü gör →
      </Link>
    </div>
  )
}

export function Dashboard() {
  const { profile } = useProfile()
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [loading, setLoading] = useState(true)
  const [now] = useState<number>(() => Date.now())

  useEffect(() => {
    loadFacilities()
      .then(setFacilities)
      .finally(() => setLoading(false))
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

  const upcomingFacility = upcomingEvent && facilities.find(f => f.id === upcomingEvent.facilityId)

  return (
    <div className="mx-auto max-w-7xl space-y-12 pt-4">
      {/* Hero */}
      <section className="grid gap-8 md:grid-cols-12">
        <div className="md:col-span-7">
          <h1 className="flex flex-wrap items-center gap-3 font-display text-[clamp(2rem,4vw,3.4rem)] font-extrabold leading-[1.05] tracking-tight text-primary-deep">
            Hoş geldin! <span aria-hidden>👋</span>
          </h1>
          <p className="mt-3 max-w-md text-base text-muted-foreground">
            <span className="font-semibold text-foreground">{DISABILITY_LABELS[profile.disabilityType]}</span> profiline göre,
            sana en uygun seçenekleri buraya derledik.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-3">
            {[
              { i: MapPin,     t: 'Tesisleri Keşfet', d: 'Sana uygun tesisleri bul',  c: 'mint'     as const, to: '/map'       as const },
              { i: Footprints, t: 'Sporları Keşfet',  d: 'Sana uygun sporları öğren', c: 'lavender' as const, to: '/match'     as const },
              { i: CalendarDays, t: 'Yakındaki Etkinlikler', d: 'Etkinlikleri incele', c: 'peach'  as const, to: '/events'    as const },
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
                  <div className="text-[13px] font-bold leading-tight text-foreground hc:text-black">{t}</div>
                  <div className="text-[11px] leading-tight text-muted-foreground">{d}</div>
                </div>
                <ArrowRight aria-hidden className="size-3.5 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            ))}
          </div>
        </div>

        {/* Photo fades into background */}
        <div className="relative h-60 md:col-span-5 md:h-80">
          <img
            src={dashHero}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full rounded-3xl object-cover"
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

      {/* 3 columns */}
      <div className="grid gap-12 xl:grid-cols-3">
        {/* Nearby */}
        <section aria-labelledby="sec-nearby">
          <div className="flex items-center gap-2">
            <SectionHeader
              icon={<MapPin aria-hidden className="size-4 text-primary" />}
              title="Yakındaki Tesisler"
              to="/map"
            />
            <DemoBadge />
          </div>

          <div className="relative mt-5 h-44 overflow-hidden rounded-3xl">
            <MiniMap />
          </div>

          {loading ? (
            <NearbySkeleton />
          ) : ranked.length === 0 ? (
            <div className="mt-5 rounded-2xl bg-card p-4 text-sm text-muted-foreground ring-1 ring-border/40">
              Profiline uygun tesis bulunamadı.{' '}
              <Link to="/map" className="text-primary underline">Haritadan ara</Link>.
            </div>
          ) : (
            <ul className="mt-5 space-y-3">
              {ranked.map(({ facility }) => (
                <li key={facility.id}>
                  <MiniFacilityCard facility={facility} disabilityType={profile.disabilityType} />
                </li>
              ))}
            </ul>
          )}

          <Link
            to="/map"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-deep"
          >
            Haritadaki tüm tesisleri gör <ArrowRight aria-hidden className="size-3.5" />
          </Link>
        </section>

        {/* Community */}
        <section aria-labelledby="sec-community" className="relative">
          <div className="flex items-center gap-2">
            <SectionHeader
              icon={<Heart aria-hidden className="size-4 text-destructive" />}
              title="Topluluk Akışı"
              to="/community"
            />
            <DemoBadge />
          </div>

          <div className="mt-5">
            <CommunityFeed facilities={facilities} />
          </div>

          <p className="mt-8 text-center text-sm font-semibold text-primary">
            Paylaş, ilham ver, destek ol.
          </p>

          <Link
            to="/community"
            aria-label="Paylaşımda bulun"
            className="fixed bottom-8 right-8 z-20 grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-glow hover:bg-primary-deep"
          >
            <Plus className="size-6" aria-hidden />
          </Link>
        </section>

        {/* Discover */}
        <section aria-labelledby="sec-discover">
          <SectionHeader
            icon={<Sparkles aria-hidden className="size-4 text-primary" />}
            title="Sana Özel Keşif"
            sub="Profiline göre öneriler"
            to="/match"
          />

          <div className="mt-5">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
              <Target aria-hidden className="size-4" /> Sana Önerilen Sporlar
            </p>
            <div className="mt-5 grid grid-cols-4 gap-2">
              {sportSuggestions.length > 0 ? sportSuggestions.map((s, i) => (
                <Link
                  key={s.id}
                  to="/match"
                  className="group flex flex-col items-center gap-2"
                >
                  <div className={`grid size-14 place-items-center rounded-full text-2xl ${
                    i % 4 === 0 ? 'bg-sky/70' :
                    i % 4 === 1 ? 'bg-mint/70' :
                    i % 4 === 2 ? 'bg-accent/15' :
                    'bg-[oklch(0.92_0.07_60)]'
                  }`}>
                    <span aria-hidden>{getSportIcon(s.id)}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-foreground hc:text-black">
                    {getSportLabel(s.id) || s.name}
                  </span>
                </Link>
              )) : (
                <div className="col-span-4 rounded-2xl bg-card p-3 text-xs text-muted-foreground ring-1 ring-border/40">
                  Henüz öneri yok.
                </div>
              )}
            </div>
          </div>

          {upcomingEvent && (
            <div className="mt-9">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="inline-flex items-center gap-2 text-sm font-bold text-primary-deep">
                  <CalendarDays aria-hidden className="size-4 text-primary" /> Yaklaşan Etkinlikler
                </h3>
                <Link to="/events" className="text-xs font-semibold text-primary">Tümünü gör →</Link>
              </div>
              <Link to="/events" className="flex items-center gap-4">
                <div className="flex flex-col items-center rounded-2xl bg-primary/10 px-3 py-2 text-primary-deep">
                  <span className="font-display text-xl font-extrabold leading-none">
                    {new Date(upcomingEvent.date).getDate()}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider">
                    {new Date(upcomingEvent.date).toLocaleDateString('tr-TR', { month: 'short' })}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-foreground hc:text-black">{upcomingEvent.title}</div>
                  <div className="text-[11.5px] text-muted-foreground">
                    {new Date(upcomingEvent.date).toLocaleDateString('tr-TR', { weekday: 'long' })}
                  </div>
                  {upcomingFacility && (
                    <div className="text-[11.5px] text-muted-foreground">
                      <span aria-hidden>📍</span> {upcomingFacility.name}
                    </div>
                  )}
                </div>
              </Link>
            </div>
          )}

          {/* F3 CTA */}
          <Link
            to="/match"
            className="relative mt-9 block overflow-hidden rounded-[2rem] bg-gradient-deep px-6 py-7 text-primary-foreground"
          >
            <div aria-hidden className="absolute -right-8 -top-8 size-40 rounded-full bg-mint/20 blur-2xl" />
            <FileSpreadsheet aria-hidden className="size-7 opacity-90" />
            <h3 className="mt-3 font-display text-lg font-extrabold">İlk ziyaret rehberini oluştur</h3>
            <p className="mt-1 text-[12.5px] text-primary-foreground/75">
              Seçtiğin tesis için kişisel rehberini hazırlayalım.
            </p>
            <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-xs font-bold text-primary-deep">
              Rehber oluştur <ChevronRight aria-hidden className="size-3.5" />
            </span>
          </Link>
        </section>
      </div>
    </div>
  )
}
