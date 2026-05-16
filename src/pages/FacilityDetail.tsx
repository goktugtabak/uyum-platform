import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, ArrowRight, MapPin, Bookmark, GraduationCap, Plus,
} from 'lucide-react'
import type { Facility, DisabilityType } from '../types'
import { useProfile } from '../contexts/ProfileContext'
import { loadFacilities } from '../lib/overpass-loader'
import { getSportIcon, getSportLabel } from '../lib/sport-icons'
import { useFacilityScore } from '../hooks/useFacilityScore'
import { DemoBadge } from '../components/ui/DemoBadge'
import { DisabilityTypeSelect } from '../components/facility/DisabilityTypeSelect'
import { AccessibilityRadar } from '../components/facility/AccessibilityRadar'
import { AccessibilityLabelList } from '../components/facility/AccessibilityLabelList'
import { LiveStatus } from '../components/facility/LiveStatus'
import { Testimonies } from '../components/feature/Testimonies'
import { F3Guide } from '../components/feature/F3Guide'
import { Spinner } from '../components/ui/Spinner'
import type { UserProfile } from '../types'

const SCORE_PERCENT_BY_COLOR = { green: 92, yellow: 68, red: 35, gray: 50 } as const
const SCORE_LABEL = { green: 'Çok Uygun', yellow: 'Kısmen Uygun', red: 'Riskli', gray: 'Bilgi Yetersiz' } as const

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
  const score = SCORE_PERCENT_BY_COLOR[overall]

  return (
    <div className="mx-auto max-w-7xl pt-2">
      <Link
        to="/map"
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="size-4" aria-hidden /> Tesislere dön
      </Link>

      {/* Hero */}
      <section
        aria-labelledby="facility-heading"
        className="relative mb-12 grid items-center gap-10 lg:grid-cols-12"
      >
        <div className="lg:col-span-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-mint/60 px-3 py-1 text-[11px] font-bold text-mint-foreground">
            %{score} {SCORE_LABEL[overall]}
          </span>
          <h1
            id="facility-heading"
            className="mt-4 font-display text-[clamp(2rem,4.2vw,3.5rem)] font-extrabold leading-[1.04] tracking-tight text-primary-deep"
          >
            {facility.name}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[13px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <MapPin aria-hidden className="size-3.5 text-accent" /> {facility.district}
            </span>
            {facility.contact.address && <span>{facility.contact.address}</span>}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <DisabilityTypeSelect value={disabilityType} onChange={onDisabilityChange} />
            <DemoBadge label="Erişilebilirlik verileri mock" />
          </div>

          <div className="mt-6 flex flex-wrap gap-2.5" aria-label="Spor dalları">
            {facility.sports.slice(0, 5).map((id, i) => (
              <span
                key={id}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                  i % 3 === 0 ? 'bg-sky/60 text-sky-foreground' :
                  i % 3 === 1 ? 'bg-mint/60 text-mint-foreground' :
                  'bg-accent/15 text-accent'
                }`}
              >
                <span aria-hidden>{getSportIcon(id)}</span> {getSportLabel(id)}
              </span>
            ))}
            {facility.sports.length > 5 && (
              <span className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-muted-foreground ring-1 ring-border/60">
                <Plus aria-hidden className="size-3" /> {facility.sports.length - 5} daha
              </span>
            )}
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a
              href={facility.contact.address
                ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(facility.name + ' ' + facility.district)}`
                : `https://www.openstreetmap.org/?mlat=${facility.coordinates.lat}&mlon=${facility.coordinates.lng}#map=18/${facility.coordinates.lat}/${facility.coordinates.lng}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-primary-deep px-6 py-3 text-sm font-bold text-primary-foreground shadow-glow hover:bg-primary"
            >
              Rota oluştur <ArrowRight aria-hidden className="size-4" />
            </a>
            <button
              type="button"
              aria-label="Kaydet"
              className="grid size-12 place-items-center rounded-full text-foreground/70 ring-1 ring-border/60 hover:bg-card"
            >
              <Bookmark aria-hidden className="size-4" />
            </button>
          </div>
        </div>

        {/* Right photo / glow */}
        <div className="relative h-72 lg:col-span-6 lg:h-[26rem]">
          <div aria-hidden className="absolute -right-10 -top-10 size-56 rounded-full bg-mint/40 blur-3xl" />
          <div
            aria-hidden
            className="absolute inset-0 grid place-items-center rounded-[2rem] bg-gradient-brand text-[10rem] text-primary-foreground"
            style={{
              WebkitMaskImage:
                'linear-gradient(to left, black 60%, transparent), linear-gradient(to bottom, black 80%, transparent)',
              WebkitMaskComposite: 'source-in',
              maskImage:
                'linear-gradient(to left, black 60%, transparent), linear-gradient(to bottom, black 80%, transparent)',
              maskComposite: 'intersect',
            }}
          >
            {getSportIcon(facility.sports[0] ?? '')}
          </div>
        </div>
      </section>

      {/* Tabs (visual only — sections below) */}
      <nav aria-label="Bölümler" className="mb-12 flex flex-wrap gap-7 border-b border-border/50 text-sm font-semibold text-muted-foreground">
        {[
          { l: 'Genel Bakış', h: '#overview', active: true },
          { l: 'Olanaklar', h: '#about' },
          { l: 'Canlı Durum', h: '#live' },
          { l: 'Rehber', h: '#guide' },
          { l: 'Yorumlar', h: '#reviews' },
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

      <div className="grid gap-x-10 gap-y-14 lg:grid-cols-3">
        {/* Radar */}
        <section id="overview" aria-labelledby="f1-heading" className="lg:col-span-2">
          <h2 id="f1-heading" className="font-display text-2xl font-extrabold text-primary-deep">
            Erişilebilirlik Puanı
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Tesisin erişilebilirlik kriterlerine göre değerlendirilmesi
          </p>

          <div className="mt-7 grid items-center gap-8 md:grid-cols-[auto_1fr]">
            <div className="relative grid size-44 place-items-center">
              <div aria-hidden className="absolute inset-0 rounded-full bg-mint/40 blur-2xl" />
              <div className="relative grid size-36 place-items-center rounded-full bg-card/85 ring-1 ring-border/40 backdrop-blur">
                <div className="text-center">
                  <div className="font-display text-4xl font-extrabold text-primary-deep">%{score}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-mint-foreground">
                    {SCORE_LABEL[overall]}
                  </div>
                </div>
              </div>
            </div>
            <AccessibilityRadar facility={facility} disabilityType={disabilityType} />
          </div>

          <AccessibilityLabelList dimensions={dimensions} />
        </section>

        {/* Live status */}
        <section id="live" aria-labelledby="f4-heading">
          <h2 id="f4-heading" className="font-display text-xl font-extrabold text-primary-deep mb-5">
            Canlı Durum
          </h2>
          <LiveStatus facility={facility} />
        </section>

        {/* About */}
        <section id="about" aria-labelledby="about-heading" className="lg:col-span-2">
          <h2 id="about-heading" className="font-display text-2xl font-extrabold text-primary-deep">
            Tesis Hakkında
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-foreground/80 hc:text-black">
            {facility.name}, {facility.district} bölgesinde adaptif spor erişimini önceliklendiren bir tesistir.
            Modern altyapı, uzman kadro ve dahil edici tasarım anlayışıyla hizmet vermektedir.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-4">
            <Stat l="Mahalle"   v={facility.district.split(',')[0]} />
            <Stat l="Spor Dalı" v={String(facility.sports.length)} />
            <Stat l="Koç"       v={String(facility.coaches.length)} />
            <Stat l="Kaynak"    v={facility.source === 'overpass' ? 'OSM' : 'Manuel'} />
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
                    Koçları gör <ArrowRight aria-hidden className="size-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* F3 Guide */}
        <section id="guide" aria-labelledby="f3-heading">
          <h2 id="f3-heading" className="font-display text-xl font-extrabold text-primary-deep mb-5">
            İlk Ziyaret Rehberi
          </h2>
          <F3Guide facility={facility} profile={profile} />
        </section>

        {/* Testimonies */}
        <section id="reviews" aria-labelledby="testimonies-heading" className="lg:col-span-3">
          <div className="mb-5 flex items-center justify-between">
            <h2
              id="testimonies-heading"
              className="font-display text-xl font-extrabold text-primary-deep"
            >
              Topluluk Tanıklıkları
            </h2>
            <DemoBadge />
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
