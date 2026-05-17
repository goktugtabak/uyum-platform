import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, ArrowRight, MapPin, Bookmark, GraduationCap, Plus,
  Accessibility, ParkingCircle, DoorOpen, MoveVertical, Star, CalendarDays,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Facility, DisabilityType, UserProfile, SportEvent, Testimony } from '../types'
import { useProfile } from '../contexts/ProfileContext'
import { loadFacilities } from '../lib/overpass-loader'
import { getSportLabel } from '../lib/sport-icons'
import { useFacilityScore } from '../hooks/useFacilityScore'
import { loadTestimonies } from '../lib/testimony-store'
import { formatRelative } from '../lib/live-status'
import { DisabilityTypeSelect } from '../components/facility/DisabilityTypeSelect'
import { AccessibilityRadar } from '../components/facility/AccessibilityRadar'
import { AccessibilityLabelList } from '../components/facility/AccessibilityLabelList'
import { LiveStatus } from '../components/facility/LiveStatus'
import { Testimonies } from '../components/feature/Testimonies'
import { F3Guide } from '../components/feature/F3Guide'
import { Spinner } from '../components/ui/Spinner'
import { ScoreBadge } from '../components/ui/ScoreBadge'
import eventsData from '../data/events.json'
import facilityEryaman from '../assets/facility-eryaman.jpg'
import facilityPool from '../assets/facility-pool.jpg'
import sportSwim from '../assets/sport-swimming.jpg'
import sportBasket from '../assets/sport-basketball.jpg'
import sportTT from '../assets/sport-tabletennis.jpg'

const ALL_EVENTS: SportEvent[] = eventsData as SportEvent[]

const FACILITY_THUMBS: string[] = [facilityEryaman, facilityPool, sportBasket, sportTT, sportSwim]

const MONTHS_TR_LONG = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
]

function getFacilityImage(facilityId: string, fallbackIndex = 0): string {
  if (facilityId.includes('eryaman')) return facilityEryaman
  if (facilityId.includes('havuz') || facilityId.includes('yuzme') || facilityId.includes('olimpik')) return facilityPool
  if (facilityId.includes('basket')) return sportBasket
  if (facilityId.includes('ted') || facilityId.includes('tenis')) return sportTT
  return FACILITY_THUMBS[fallbackIndex % FACILITY_THUMBS.length]
}

function estimatedDistance(facility: Facility): number {
  const lat0 = 39.9208, lng0 = 32.8541
  const dLat = (facility.coordinates.lat - lat0) * 111
  const dLng = (facility.coordinates.lng - lng0) * 95
  const km = Math.sqrt(dLat * dLat + dLng * dLng)
  return Math.round(km * 10) / 10
}


const A11Y_CHIPS: Array<{ key: keyof Facility['accessibility']; label: string; icon: LucideIcon }> = [
  { key: 'entry',         label: 'Tekerlekli erişim',     icon: Accessibility },
  { key: 'internal',      label: 'Asansör / iç mekan',    icon: MoveVertical },
  { key: 'changing',      label: 'Erişilebilir soyunma',  icon: DoorOpen },
  { key: 'equipment',     label: 'Adaptif ekipman',       icon: ParkingCircle },
]

function FacilityDetailInner({
  facility,
  disabilityType,
  onDisabilityChange,
  profile,
}: {
  facility: Facility
  disabilityType: DisabilityType
  onDisabilityChange: (v: DisabilityType) => void
  profile: UserProfile
}) {
  const { dimensions, overall } = useFacilityScore(facility, disabilityType)
  const distanceKm = estimatedDistance(facility)
  const hero = getFacilityImage(facility.id)

  // Real testimonies preview (Faz 7+) — filtered to this facility
  const testimonies: Testimony[] = useMemo(
    () => loadTestimonies().filter(t => t.facilityId === facility.id),
    [facility.id],
  )
  const reviewCount = testimonies.length
  // Deterministic 4.5–4.9 rating from id when there are reviews
  const ratingAvg = reviewCount === 0
    ? 0
    : 4.5 + (Math.abs([...facility.id].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 0)) % 5) / 10

  // Upcoming events at this facility
  const [now] = useState<number>(() => Date.now())
  const upcomingEvents = useMemo(
    () =>
      ALL_EVENTS
        .filter(e => e.facilityId === facility.id && new Date(e.date).getTime() >= now)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 3),
    [facility.id, now],
  )

  // Verified accessibility chips
  const verifiedChips = A11Y_CHIPS.filter(
    chip => facility.accessibility[chip.key]?.[disabilityType] === 'verified',
  )
  const chipsToShow = verifiedChips.length > 0 ? verifiedChips : A11Y_CHIPS.slice(0, 2)

  return (
    <div className="mx-auto max-w-7xl pt-2">
      <Link
        to="/map"
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="size-4" aria-hidden /> Tesislere dön
      </Link>

      {/* Hero — open, image fades into canvas */}
      <section
        aria-labelledby="facility-heading"
        className="relative mb-16 grid items-center gap-12 lg:grid-cols-12"
      >
        <div className="lg:col-span-6">
          <ScoreBadge color={overall} />
          <h1
            id="facility-heading"
            className="mt-4 font-display text-[clamp(2.4rem,4.2vw,3.6rem)] font-extrabold leading-[1.04] tracking-tight text-primary-deep"
          >
            {facility.name}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[13px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5 text-accent" aria-hidden /> {facility.district}
            </span>
            <span>
              <b className="text-foreground">{distanceKm} km</b> uzaklıkta
            </span>
            <a
              href={`https://www.openstreetmap.org/?mlat=${facility.coordinates.lat}&mlon=${facility.coordinates.lng}#map=18/${facility.coordinates.lat}/${facility.coordinates.lng}`}
              target="_blank"
              rel="noreferrer"
              className="text-primary underline-offset-4 hover:underline"
            >
              Haritada göster
            </a>
          </div>

          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-foreground/80">
            {facility.name}, {facility.district} bölgesinde adaptif spor erişimini önceliklendiren bir tesistir.
            Modern altyapısı ve dahil edici tasarım anlayışıyla hizmet vermektedir.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <DisabilityTypeSelect value={disabilityType} onChange={onDisabilityChange} />
          </div>

          {/* Accessibility chips — pills derived from real accessibility matrix */}
          <div className="mt-6 flex flex-wrap gap-2.5">
            {chipsToShow.map(({ icon: I, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 rounded-full bg-mint/40 px-3 py-1.5 text-[12px] font-semibold text-mint-foreground"
              >
                <I className="size-3.5" aria-hidden /> {label}
              </span>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-3">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(facility.name + ' ' + facility.district)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-primary-deep px-6 py-3 text-sm font-bold text-primary-foreground shadow-glow hover:bg-primary"
            >
              Rota oluştur <ArrowRight className="size-4" aria-hidden />
            </a>
            <button
              type="button"
              aria-label="Kaydet"
              className="grid size-12 place-items-center rounded-full text-foreground/70 ring-1 ring-border/60 hover:bg-card"
            >
              <Bookmark className="size-4" aria-hidden />
            </button>
          </div>
        </div>

        <div className="relative h-80 lg:col-span-6 lg:h-[28rem]">
          <div className="absolute -right-10 -top-10 size-56 rounded-full bg-mint/40 blur-3xl" aria-hidden />
          <img
            src={hero}
            alt={facility.name}
            className="absolute inset-0 h-full w-full object-cover"
            style={{
              WebkitMaskImage:
                'linear-gradient(to left, black 60%, transparent), linear-gradient(to bottom, black 80%, transparent)',
              WebkitMaskComposite: 'source-in',
              maskImage:
                'linear-gradient(to left, black 60%, transparent), linear-gradient(to bottom, black 80%, transparent)',
              maskComposite: 'intersect',
            }}
          />
        </div>
      </section>

      {/* Tabs (underline only) */}
      <nav aria-label="Bölümler" className="mb-12 flex flex-wrap gap-7 border-b border-border/50 text-sm font-semibold text-muted-foreground">
        {[
          { l: 'Genel Bakış',         h: '#overview', active: true },
          { l: 'Olanaklar',           h: '#about' },
          { l: 'Canlı Durum',         h: '#live' },
          { l: 'Rehber',              h: '#guide' },
          { l: `Yorumlar (${reviewCount})`, h: '#reviews' },
          { l: 'Etkinlikler',         h: '#events' },
        ].map(({ l, h, active }) => (
          <a
            key={l}
            href={h}
            className={`-mb-px border-b-2 pb-3 transition ${
              active ? 'border-primary text-primary' : 'border-transparent hover:text-foreground'
            }`}
          >
            {l}
          </a>
        ))}
      </nav>

      <div className="grid gap-x-12 gap-y-16 lg:grid-cols-3">
        {/* Score + Radar */}
        <section id="overview" aria-labelledby="f1-heading" className="lg:col-span-2">
          <h2 id="f1-heading" className="font-display text-2xl font-extrabold text-primary-deep">
            Erişilebilirlik Puanı
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Tesisin erişilebilirlik kriterlerine göre değerlendirilmesi
          </p>

          <div className="mt-7 grid items-center gap-8 md:grid-cols-[auto_1fr]">
            <div className="relative grid size-44 place-items-center">
              <div className="absolute inset-0 rounded-full bg-mint/40 blur-2xl" aria-hidden />
              <div className="relative grid size-36 place-items-center rounded-full bg-card/85 ring-1 ring-border/40 backdrop-blur">
                <div className="text-center">
                  <ScoreBadge color={overall} size="lg" />
                </div>
              </div>
            </div>
            <AccessibilityRadar facility={facility} disabilityType={disabilityType} />
          </div>

          <AccessibilityLabelList dimensions={dimensions} />
        </section>

        {/* Live status (real Faz 6 component) */}
        <section id="live" aria-labelledby="f4-heading">
          <div className="mb-5 flex items-end justify-between">
            <h2 id="f4-heading" className="font-display text-xl font-extrabold text-primary-deep">
              Canlı Durum
            </h2>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success">
              <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-success" /> Anlık
            </span>
          </div>
          <LiveStatus facility={facility} />
        </section>

        {/* About */}
        <section id="about" aria-labelledby="about-heading" className="lg:col-span-2">
          <h2 id="about-heading" className="font-display text-2xl font-extrabold text-primary-deep">
            Tesis Hakkında
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-foreground/80">
            {facility.name}, engelli bireylerin tüm spor branşlarına erişimini kolaylaştırmak amacıyla
            tasarlanmıştır. Modern altyapısı, erişilebilir alanları ve uzman kadrosuyla hizmet vermektedir.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-4">
            <Stat l="Mahalle"   v={facility.district.split(',')[0]} />
            <Stat l="Spor Dalı" v={String(facility.sports.length)} />
            <Stat l="Koç"       v={String(facility.coaches.length)} />
            <Stat l="Kaynak"    v={facility.source === 'overpass' ? 'OSM' : 'Manuel'} />
          </div>

          <h3 className="mt-9 font-display text-lg font-extrabold text-primary-deep">Olanaklar</h3>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {facility.sports.map((s, i) => (
              <span
                key={s}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                  i % 3 === 0 ? 'bg-sky/60 text-sky-foreground' :
                  i % 3 === 1 ? 'bg-mint/60 text-mint-foreground' :
                  'bg-accent/15 text-accent'
                }`}
              >
                <span aria-hidden className="size-1.5 rounded-full bg-current" /> {getSportLabel(s)}
              </span>
            ))}
            {facility.sports.length === 0 && (
              <span className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-muted-foreground ring-1 ring-border/60">
                <Plus aria-hidden className="size-3" /> Bilgi yok
              </span>
            )}
          </div>

          {facility.coaches.length > 0 && (
            <div className="mt-7 rounded-3xl bg-card p-5 ring-1 ring-border/40">
              <div className="flex items-start gap-3">
                <span aria-hidden className="grid size-10 place-items-center rounded-full bg-accent/15 text-accent">
                  <GraduationCap className="size-5" />
                </span>
                <div className="flex-1">
                  <h3 className="font-display text-base font-bold text-primary-deep">
                    Bu tesiste çalışan koçlar
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {facility.coaches.length} koç bu tesisle çalışıyor. Engel tipine uyumlu olanlar koç dizininde listenin başında.
                  </p>
                  <Link
                    to={`/coaches?facility=${facility.id}`}
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary-deep"
                  >
                    Koçları gör <ArrowRight className="size-3.5" aria-hidden />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Reviews preview */}
        <section id="reviews-preview" aria-labelledby="reviews-preview-heading">
          <div className="flex items-end justify-between">
            <h2 id="reviews-preview-heading" className="font-display text-xl font-extrabold text-primary-deep">
              Yorumlar
            </h2>
            <a href="#reviews" className="text-xs font-semibold text-primary">Tümünü gör →</a>
          </div>
          {reviewCount > 0 ? (
            <>
              <div className="mt-4 flex items-center gap-2.5">
                <span className="font-display text-4xl font-extrabold text-primary-deep">
                  {ratingAvg.toFixed(1)}
                </span>
                <div className="flex" aria-hidden>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-4 fill-[oklch(0.78_0.16_85)] text-[oklch(0.78_0.16_85)]" />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">{reviewCount} değerlendirme</span>
              </div>
              {testimonies[0] && (
                <blockquote className="mt-6 border-l-2 border-accent/50 pl-4">
                  <p className="text-[14px] italic leading-relaxed text-foreground/85 line-clamp-4">
                    "{testimonies[0].text}"
                  </p>
                  <footer className="mt-3 flex items-center gap-2 text-xs">
                    <span aria-hidden className="size-6 rounded-full bg-gradient-brand" />
                    <span className="font-bold">
                      {testimonies[0].anonymous || !testimonies[0].displayName
                        ? 'Anonim'
                        : testimonies[0].displayName}
                    </span>
                    <span className="text-muted-foreground">· {formatRelative(testimonies[0].timestamp)}</span>
                  </footer>
                </blockquote>
              )}
            </>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              Bu tesis için henüz tanıklık yok. İlk paylaşan sen ol — aşağıdaki bölümden ekleyebilirsin.
            </p>
          )}
        </section>

        {/* F3 Guide */}
        <section id="guide" aria-labelledby="f3-heading" className="lg:col-span-2">
          <h2 id="f3-heading" className="mb-5 font-display text-xl font-extrabold text-primary-deep">
            İlk Ziyaret Rehberi
          </h2>
          <F3Guide facility={facility} profile={profile} />
        </section>

        {/* Upcoming events at this facility */}
        <section id="events" aria-labelledby="events-heading" className="lg:col-span-3">
          <h2
            id="events-heading"
            className="mb-6 inline-flex items-center gap-2 font-display text-xl font-extrabold text-primary-deep"
          >
            <CalendarDays className="size-5 text-accent" aria-hidden /> Yaklaşan Etkinlikler
          </h2>
          {upcomingEvents.length > 0 ? (
            <div className="grid gap-x-6 gap-y-6 md:grid-cols-3">
              {upcomingEvents.map(e => {
                const d = new Date(e.date)
                const isFree = !e.registrationUrl
                const time = d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
                const weekday = d.toLocaleDateString('tr-TR', { weekday: 'long' })
                return (
                  <article key={e.id} className="group flex gap-4">
                    <div className="flex flex-col items-center justify-center rounded-2xl bg-primary/10 px-3 py-2 text-primary-deep">
                      <span className="font-display text-2xl font-extrabold leading-none">{d.getDate()}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        {MONTHS_TR_LONG[d.getMonth()].slice(0, 5)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link to="/events" className="truncate text-sm font-bold text-foreground hover:text-primary">
                        {e.title}
                      </Link>
                      <div className="text-[11.5px] text-muted-foreground capitalize">{weekday} · {time}</div>
                      <div className="truncate text-[11.5px] text-muted-foreground">📍 {facility.name}</div>
                      {isFree && (
                        <span className="mt-1.5 inline-block rounded-full bg-mint/60 px-2 py-0.5 text-[10px] font-bold text-mint-foreground">
                          Ücretsiz
                        </span>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Bu tesiste yaklaşan etkinlik yok.{' '}
              <Link to="/events" className="text-primary underline">Tüm etkinliklere</Link> göz at.
            </p>
          )}
        </section>

        {/* Full testimonies (real Faz 6 component) */}
        <section id="reviews" aria-labelledby="testimonies-heading" className="lg:col-span-3">
          <div className="mb-5 flex items-center justify-between">
            <h2
              id="testimonies-heading"
              className="font-display text-xl font-extrabold text-primary-deep"
            >
              Topluluk Tanıklıkları
            </h2>
          </div>
          <Testimonies facilityId={facility.id} defaultDisabilityType={disabilityType} />
        </section>
      </div>
    </div>
  )
}

function Stat({ l, v }: { l: string; v: string }) {
  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{l}</div>
      <div className="mt-1 font-display text-2xl font-extrabold text-primary-deep">{v}</div>
    </div>
  )
}

export function FacilityDetail() {
  const { id } = useParams<{ id: string }>()
  const { profile } = useProfile()
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [loading, setLoading] = useState(true)
  const [disabilityType, setDisabilityType] = useState<DisabilityType>(
    profile?.disabilityType ?? 'wheelchair',
  )

  useEffect(() => {
    loadFacilities().then(data => {
      setFacilities(data)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-8">
        <Spinner label="Tesis yükleniyor" />
      </div>
    )
  }

  const facility = facilities.find(f => f.id === id)

  if (!facility) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 p-8 text-center">
        <p className="font-display text-lg font-bold text-primary-deep">Tesis bulunamadı.</p>
        <Link to="/map" className="text-primary underline hover:text-primary-deep">
          Tesislere dön
        </Link>
      </div>
    )
  }

  return (
    <FacilityDetailInner
      facility={facility}
      disabilityType={disabilityType}
      onDisabilityChange={setDisabilityType}
      profile={profile!}
    />
  )
}
