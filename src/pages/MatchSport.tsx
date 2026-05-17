import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Accessibility, Target, Pencil, CheckCircle2, MapPin, RefreshCw, Heart,
  Footprints,
  Waves, CircleDot, Trophy,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useProfile } from '../contexts/ProfileContext'
import { matchSports } from '../lib/sport-match'
import { loadFacilities } from '../lib/overpass-loader'
import { pickTopFacilities } from '../lib/facility-rank'
import { SpeakButton } from '../components/ui/SpeakButton'
import { ScoreBadge } from '../components/ui/ScoreBadge'
import { MatchBadge } from '../components/ui/MatchBadge'
import sportsData from '../data/sports.json'
import type { Sport, Facility } from '../types'
import type { MatchResult } from '../lib/sport-match'
import { scoreColorFromCount } from '../lib/a11y-labels'
import sportSwim from '../assets/sport-swimming.jpg'
import sportBasket from '../assets/sport-basketball.jpg'
import sportTT from '../assets/sport-tabletennis.jpg'
import facilityPool from '../assets/facility-pool.jpg'
import facilityEryaman from '../assets/facility-eryaman.jpg'

const DISABILITY_LABELS: Record<string, string> = {
  wheelchair: 'Tekerlekli Sandalye',
  visual:     'Görme',
  hearing:    'İşitme',
  upper_limb: 'Üst Ekstremite',
}
const MOBILITY_LABELS: Record<string, string> = {
  sitting:     'Oturarak',
  supported:   'Destekle',
  independent: 'Bağımsız',
}
const GOAL_LABELS: Record<string, string> = {
  strength:    'Güçlenmek',
  flexibility: 'Esneklik',
  social:      'Sosyal',
  compete:     'Yarışma',
}

const TINTS = [
  {
    num:   'bg-accent text-primary-foreground',
    check: 'text-accent',
    icon:  'text-sky-foreground bg-sky/60',
    pill:  'text-accent bg-accent/10',
    link:  'text-accent',
  },
  {
    num:   'bg-success text-primary-foreground',
    check: 'text-success',
    icon:  'text-mint-foreground bg-mint/60',
    pill:  'text-success bg-success/10',
    link:  'text-success',
  },
  {
    num:   'bg-[oklch(0.62_0.18_55)] text-primary-foreground',
    check: 'text-[oklch(0.62_0.18_55)]',
    icon:  'text-[oklch(0.55_0.18_50)] bg-[oklch(0.92_0.07_60)]',
    pill:  'text-[oklch(0.55_0.18_50)] bg-[oklch(0.92_0.07_60)]',
    link:  'text-[oklch(0.55_0.18_50)]',
  },
] as const

const SPORT_DETAIL_ICONS: LucideIcon[] = [Waves, CircleDot, Trophy]

function getSportImage(sportId: string): string {
  if (sportId.includes('swim') || sportId.includes('aqua') || sportId.includes('water')) return sportSwim
  if (sportId.includes('basket') || sportId.includes('volleyball') || sportId.includes('football')) return sportBasket
  if (sportId.includes('tennis') || sportId.includes('table') || sportId.includes('boccia') || sportId.includes('archery') || sportId.includes('goalball')) return sportTT
  if (sportId.includes('yoga') || sportId.includes('pilates') || sportId.includes('athletics')) return facilityPool
  return facilityEryaman
}

function calcMatchLevel(score: number): 'high' | 'medium' | 'low' {
  if (score >= 5) return 'high'
  if (score >= 3) return 'medium'
  return 'low'
}


function SportPhoto({ idx, matchLevel, sport }: { idx: number; matchLevel: 'high' | 'medium' | 'low'; sport: Sport }) {
  const t = TINTS[idx]
  return (
    <div className="relative h-72 overflow-hidden rounded-[1.5rem]">
      <img
        src={getSportImage(sport.id)}
        alt={sport.name}
        className="absolute inset-0 h-full w-full object-cover"
        style={{
          WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 96%)',
          maskImage: 'linear-gradient(to bottom, black 50%, transparent 96%)',
        }}
      />
      <div className={`absolute left-5 top-5 grid size-9 place-items-center rounded-full text-sm font-extrabold ${t.num}`}>
        {idx + 1}
      </div>
      <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
        <MatchBadge level={matchLevel} />
      </div>
    </div>
  )
}

export function MatchSport() {
  const { profile } = useProfile()
  const [facilities, setFacilities] = useState<Facility[]>([])

  useEffect(() => {
    loadFacilities().then(setFacilities)
  }, [])

  const matches: MatchResult[] = useMemo(() => {
    if (!profile) return []
    return matchSports(profile, sportsData as Sport[])
  }, [profile])

  if (!profile) return null

  return (
    <div className="mx-auto max-w-7xl pt-2">
      {/* Header */}
      <header className="mb-12 flex flex-wrap items-start justify-between gap-8">
        <div>
          <p className="text-sm font-semibold text-primary">
            Sana özel eşleşme tamamlandı! <span aria-hidden>🎉</span>
          </p>
          <h1 className="mt-3 font-display text-[clamp(2rem,3.5vw,3rem)] font-extrabold leading-[1.05] tracking-tight text-primary-deep">
            Sana en uygun <span className="text-accent">{matches.length} spor</span> önerimiz
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Profiline, hedeflerine ve tercihine en uygun sporları senin için belirledik.
          </p>
        </div>

        {/* Profile chip row — clean, no card */}
        <div className="flex flex-wrap items-center gap-7 rounded-3xl bg-card/70 px-6 py-4 ring-1 ring-border/40 backdrop-blur">
          <ProfileChip i={Accessibility} l="Engel Tipi" v={DISABILITY_LABELS[profile.disabilityType]} />
          <ProfileChip i={Footprints}     l="Hareket"    v={MOBILITY_LABELS[profile.mobilityLevel]} />
          <ProfileChip i={Target}         l="Hedefin"    v={GOAL_LABELS[profile.goal]} />
          <Link
            to="/onboarding"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-success hover:text-primary"
          >
            <Pencil className="size-3.5" aria-hidden />
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Cevaplarını</span>
            <span>Düzenle</span>
          </Link>
        </div>
      </header>

      {/* No-match fallback */}
      {matches.length === 0 ? (
        <div role="status" className="rounded-3xl bg-card p-8 text-center ring-1 ring-border/40">
          <p className="text-sm text-foreground">
            Profiline tam uyan bir spor şu anda veri tabanımızda bulunmuyor.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Yakında daha fazla seçenek ekleyeceğiz.
          </p>
          <Link
            to="/onboarding"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-glow"
          >
            Profili güncelle
          </Link>
        </div>
      ) : (
        <>
          {/* 3 hero photos that fade into the canvas */}
          <div className="grid gap-x-8 gap-y-6 md:grid-cols-3">
            {matches.map((m, i) => (
              <SportPhoto key={m.sport.id} idx={i} matchLevel={calcMatchLevel(m.score)} sport={m.sport} />
            ))}
          </div>

          {/* Details row */}
          <div className="mt-10 grid gap-x-8 gap-y-12 md:grid-cols-3">
            {matches.map((m, i) => {
              const t = TINTS[i]
              const matchLevel = calcMatchLevel(m.score)
              const Icon = SPORT_DETAIL_ICONS[i] ?? Trophy
              const related = pickTopFacilities(
                facilities.filter(f => f.sports.includes(m.sport.id)),
                profile,
                3,
              )
              return (
                <article key={m.sport.id} className="flex flex-col">
                  <h3 className="font-display text-2xl font-extrabold leading-tight text-primary-deep">
                    {m.sport.name}
                  </h3>
                  <div className="mt-2">
                    <MatchBadge level={matchLevel} />
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-foreground/80">
                    {m.sport.description}
                  </p>

                  <div className="mt-6">
                    <div className="flex items-center justify-between">
                      <div className="text-[13px] font-bold text-primary-deep">Sana göre neden uygun?</div>
                      <SpeakButton text={m.reason} label={`${m.sport.name} önerisi`} />
                    </div>
                    <ul className="mt-3 space-y-2">
                      {m.reason.split(',').slice(0, 4).map(r => (
                        <li key={r} className="flex items-start gap-2 text-[13.5px] text-foreground/85">
                          <CheckCircle2 aria-hidden className={`mt-0.5 size-4 shrink-0 ${t.check}`} />
                          <span>{r.trim().replace(/\.$/, '')}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {related.length > 0 && (
                    <div className="mt-7">
                      <div className="text-[13px] font-bold text-primary-deep">Erişilebilir Tesisler (Ankara)</div>
                      <ul className="mt-3 space-y-2.5">
                        {related.map(({ facility, verifiedCount }) => (
                          <li key={facility.id} className="flex items-center gap-2 text-[13px]">
                            <MapPin className="size-3.5 text-muted-foreground" aria-hidden />
                            <Link
                              to={`/facility/${facility.id}`}
                              className="flex-1 truncate hover:text-primary"
                            >
                              {facility.name}
                            </Link>
                            <span className="text-muted-foreground">{facility.district.split(',')[0]}</span>
                            <ScoreBadge color={scoreColorFromCount(verifiedCount)} size="sm" />
                          </li>
                        ))}
                      </ul>
                      <Link
                        to={`/map?sport=${m.sport.id}`}
                        className={`mt-3 inline-block text-right text-[11.5px] font-bold ${t.link}`}
                      >
                        Tümünü gör →
                      </Link>
                    </div>
                  )}

                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <Link to={`/map?sport=${m.sport.id}`} className="inline-flex items-center gap-3 self-start">
                      <span className={`grid size-12 place-items-center rounded-full ${t.icon}`}>
                        <Icon className="size-5" aria-hidden />
                      </span>
                      <span className={`text-sm font-bold underline underline-offset-[6px] decoration-2 ${t.link}`}>
                        Detayları incele →
                      </span>
                    </Link>
                    <Link
                      to={`/coaches?sport=${m.sport.id}`}
                      className="text-sm font-semibold text-muted-foreground hover:text-primary"
                    >
                      Koç bul →
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>

          {/* Footer feedback row */}
          <section className="mt-16 flex flex-wrap items-center justify-between gap-6 rounded-[2rem] bg-accent/10 px-7 py-6">
            <div className="flex items-center gap-4">
              <span aria-hidden className="grid size-12 place-items-center rounded-2xl bg-white text-primary-deep">
                <RefreshCw className="size-5" />
              </span>
              <div>
                <div className="font-bold text-primary-deep">Bu öneriler hoşuna gitti mi?</div>
                <div className="text-xs text-muted-foreground">
                  Tercihlerini değiştirmek istersen yeniden eşleştirme yapabilirsin.
                </div>
              </div>
            </div>
            <Link
              to="/onboarding"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-bold text-primary-deep ring-1 ring-border/60 hover:ring-primary/40"
            >
              <RefreshCw aria-hidden className="size-3.5" /> Yeniden eşleştir
            </Link>
            <blockquote className="flex max-w-md items-center gap-3 text-sm italic text-foreground/80">
              <span>
                "Spor yapabilmek için mükemmel olman gerekmiyor. Başlamak için başlaman yeterli."
              </span>
              <Heart aria-hidden className="size-5 shrink-0 text-accent" />
            </blockquote>
          </section>
        </>
      )}
    </div>
  )
}

function ProfileChip({ i: I, l, v }: { i: LucideIcon; l: string; v: string }) {
  return (
    <div className="flex items-center gap-3">
      <span aria-hidden className="grid size-10 place-items-center rounded-full bg-accent/10 text-accent">
        <I className="size-4" />
      </span>
      <div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{l}</div>
        <div className="text-[13px] font-bold text-foreground">{v}</div>
      </div>
    </div>
  )
}
