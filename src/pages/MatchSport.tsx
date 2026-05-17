import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BackButton } from '../components/ui/BackButton'
import {
  PersonStanding, Target, CheckCircle2, MapPin, RefreshCw, Heart,
  Footprints,
  Waves, CircleDot, Trophy,
  ChevronLeft, ChevronRight
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { useProfile } from '../contexts/ProfileContext'
import { matchSports } from '../lib/sport-match'
import { loadFacilities } from '../lib/overpass-loader'
import { pickTopFacilities } from '../lib/facility-rank'
import { SpeakButton } from '../components/ui/SpeakButton'
import { ScoreBadge } from '../components/ui/ScoreBadge'
import { MatchBadge, type MatchLevel } from '../components/ui/MatchBadge'
import { FacilityTrustLine } from '../components/feature/FacilityTrust'
import sportsData from '../data/sports.json'
import type { Sport, Facility } from '../types'
import type { MatchResult } from '../lib/sport-match'

// Standart stock fotoğraflar kullanarak görsellerin başlıkla alakası sorununu çözüyoruz.
// Aynı zamanda iki tane su sporu çıkması durumunda çeşitlilik sağlanmış oluyor.
const SPORT_IMAGES: Record<string, string> = {
  's-swim': 'https://images.unsplash.com/photo-1530549387789-4c1017266635?q=80&w=800&auto=format&fit=crop',
  's-aqua': 'https://images.unsplash.com/photo-1519315901367-f34f9b5e1d5c?q=80&w=800&auto=format&fit=crop',
  's-wheelchair-basket': 'https://images.unsplash.com/photo-1519656121404-b9bce2317300?q=80&w=800&auto=format&fit=crop',
  's-wheelchair-tennis': 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=800&auto=format&fit=crop',
  's-goalball': 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=800&auto=format&fit=crop',
  's-boccia': 'https://images.unsplash.com/photo-1628102491629-778571d893a3?q=80&w=800&auto=format&fit=crop',
  's-sitting-volleyball': 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?q=80&w=800&auto=format&fit=crop',
  's-athletics': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=800&auto=format&fit=crop',
  's-archery-para': 'https://images.unsplash.com/photo-1511362489816-56f8f480393f?q=80&w=800&auto=format&fit=crop',
  's-yoga': 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=800&auto=format&fit=crop',
  's-pilates': 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop',
  's-strength': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop',
  's-judo-para': 'https://images.unsplash.com/photo-1564415315949-270fb3fb4a7b?q=80&w=800&auto=format&fit=crop',
  's-football': 'https://images.unsplash.com/photo-1511886929837-354d827aae26?q=80&w=800&auto=format&fit=crop',
  's-waterpolo': 'https://images.unsplash.com/photo-1555546594-e35b7194f4c9?q=80&w=800&auto=format&fit=crop',
}

function getSportImage(sportId: string): string {
  return SPORT_IMAGES[sportId] ?? 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=800&auto=format&fit=crop'
}

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
  performance: 'Performans',
  healthy:     'Sağlıklı',
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
    num:   'bg-primary text-primary-foreground',
    check: 'text-primary',
    icon:  'text-accent bg-accent/15',
    pill:  'text-accent bg-accent/15',
    link:  'text-accent',
  },
] as const

const SPORT_DETAIL_ICONS: LucideIcon[] = [Waves, CircleDot, Trophy]

function calcMatchLevel(score: number): MatchLevel {
  if (score >= 5) return 'high'
  if (score >= 3) return 'medium'
  return 'low'
}

function SportPhoto({ idx, matchLevel, sport }: { idx: number; matchLevel: MatchLevel; sport: Sport }) {
  const t = TINTS[idx % TINTS.length]
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

  const [page, setPage] = useState(0)
  const [direction, setDirection] = useState(1)
  
  const totalPages = Math.ceil(matches.length / 3)

  const handleNext = () => {
    setDirection(1)
    setPage(p => (p + 1) % totalPages)
  }
  
  const handlePrev = () => {
    setDirection(-1)
    setPage(p => (p - 1 + totalPages) % totalPages)
  }

  const currentMatches = matches.slice(page * 3, page * 3 + 3)

  const slideVariants: Variants = {
    initial: (dir: number) => ({ opacity: 0, x: dir * 50 }),
    animate: (dir: number) => ({ opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } }),
    exit: (dir: number) => ({ opacity: 0, x: dir * -50, transition: { duration: 0.3 } })
  }

  if (!profile) return null

  return (
    <div className="mx-auto max-w-7xl pt-2 pb-16">
      <BackButton className="mb-6" />
      {/* Header */}
      <header className="mb-12 flex flex-wrap items-start justify-between gap-8">
        <div className="flex-1">
          <p className="text-sm font-semibold text-primary">
            Sana özel eşleşme tamamlandı!
          </p>
          <div className="mt-3 flex items-center justify-between gap-4 flex-wrap">
            <h1 className="text-[clamp(2rem,3.5vw,3rem)] font-extrabold leading-[1.05] tracking-tight text-primary-deep">
              Sana en uygun <span className="text-accent">{matches.length} spor</span> önerimiz
            </h1>
            {totalPages > 1 && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="grid size-11 place-items-center rounded-full bg-muted text-primary-deep transition-colors hover:bg-muted-foreground/20"
                  aria-label="Önceki sporları gör"
                >
                  <ChevronLeft className="size-6" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="grid size-11 place-items-center rounded-full bg-muted text-primary-deep transition-colors hover:bg-muted-foreground/20"
                  aria-label="Sonraki sporları gör"
                >
                  <ChevronRight className="size-6" />
                </button>
              </div>
            )}
          </div>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Profiline, hedeflerine ve tercihine en uygun sporları senin için belirledik. Oklara tıklayarak daha fazla öneri görebilirsin.
          </p>
        </div>

        {/* Profile chip row */}
        <div className="flex flex-wrap items-center gap-5 rounded-[1.5rem] bg-secondary px-6 py-4">
          <ProfileChip i={PersonStanding} l="Engel Tipi" v={profile.disabilityTypes.map(d => DISABILITY_LABELS[d]).join(', ')} />
          <ProfileChip i={Footprints}     l="Hareket"    v={MOBILITY_LABELS[profile.mobilityLevel]} />
          <ProfileChip i={Target}         l="Hedefin"    v={profile.goals.map(g => GOAL_LABELS[g]).join(', ')} />
        </div>
      </header>

      {/* No-match fallback */}
      {matches.length === 0 ? (
        <div role="status" className="rounded-[2rem] bg-secondary p-12 text-center">
          <p className="text-base text-foreground font-medium">
            Profiline tam uyan bir spor şu anda veri tabanımızda bulunmuyor.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Yakında daha fazla seçenek ekleyeceğiz.
          </p>
          <Link
            to="/onboarding"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary-deep"
          >
            Profili güncelle
          </Link>
        </div>
      ) : (
        <div className="relative overflow-hidden min-h-[500px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={page}
              custom={direction}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full"
            >
              {/* 3 hero photos */}
              <div className="grid gap-x-8 gap-y-6 md:grid-cols-3">
                {currentMatches.map((m, i) => (
                  <SportPhoto key={m.sport.id} idx={page * 3 + i} matchLevel={calcMatchLevel(m.score)} sport={m.sport} />
                ))}
              </div>

              {/* Details row */}
              <div className="mt-10 grid gap-x-8 gap-y-12 md:grid-cols-3">
                {currentMatches.map((m, i) => {
                  const t = TINTS[i % TINTS.length]
                  const matchLevel = calcMatchLevel(m.score)
                  const Icon = SPORT_DETAIL_ICONS[i % SPORT_DETAIL_ICONS.length] ?? Trophy
                  const related = pickTopFacilities(
                    facilities.filter(f => f.sports.includes(m.sport.id)),
                    profile,
                    3,
                  )
                  return (
                    <article key={m.sport.id} className="flex flex-col">
                      <h3 className="text-2xl font-extrabold leading-tight text-primary-deep">
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
                          {m.reason.split(',').slice(0, 4).map((r, listIdx) => {
                            const text = r.trim().replace(/\.$/, '')
                            // İlk harfi büyüt (işitme -> İşitme)
                            const capitalized = text.charAt(0).toLocaleUpperCase('tr-TR') + text.slice(1)
                            return (
                              <li key={listIdx} className="flex items-start gap-2 text-[13.5px] text-foreground/85">
                                <CheckCircle2 aria-hidden className={`mt-0.5 size-4 shrink-0 ${t.check}`} />
                                <span>{capitalized}</span>
                              </li>
                            )
                          })}
                        </ul>
                      </div>

                      {related.length > 0 && (
                        <div className="mt-7">
                          <div className="text-[13px] font-bold text-primary-deep">Erişilebilir Tesisler (Ankara)</div>
                          <ul className="mt-3 space-y-2.5">
                            {related.map(({ facility, overall }) => (
                              <li key={facility.id} className="text-[13px]">
                                <div className="flex items-center gap-2">
                                  <MapPin className="size-3.5 text-muted-foreground" aria-hidden />
                                  <Link
                                    to={`/facility/${facility.id}`}
                                    className="flex-1 truncate hover:text-primary"
                                  >
                                    {facility.name}
                                  </Link>
                                  <span className="text-muted-foreground">{facility.district.split(',')[0]}</span>
                                  <ScoreBadge color={overall} size="sm" />
                                </div>
                                <FacilityTrustLine facility={facility} className="ml-5 mt-1" />
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
            </motion.div>
          </AnimatePresence>
          
          {/* Footer feedback row */}
          <section className="mt-16 flex flex-wrap items-center justify-between gap-6 rounded-[2rem] bg-secondary px-8 py-6">
            <div className="flex items-center gap-4">
              <span aria-hidden className="grid size-12 place-items-center rounded-2xl bg-white text-primary-deep">
                <RefreshCw className="size-5" />
              </span>
              <div>
                <div className="font-bold text-primary-deep">Bu öneriler hoşuna gitti mi?</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  Tercihlerini değiştirmek istersen yeniden eşleştirme yapabilirsin.
                </div>
              </div>
            </div>
            <Link
              to="/onboarding"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-bold text-primary-deep transition-colors hover:bg-muted"
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
        </div>
      )}
    </div>
  )
}

function ProfileChip({ i: I, l, v }: { i: LucideIcon; l: string; v: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span aria-hidden className="grid size-10 place-items-center rounded-full bg-white text-primary">
        <I className="size-4" />
      </span>
      <div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{l}</div>
        <div className="text-xs font-bold text-primary-deep">{v}</div>
      </div>
    </div>
  )
}
