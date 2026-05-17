import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Clock, MapPin, ChevronRight, Globe, Mail, ExternalLink,
  CheckCircle2, AlertCircle, HelpCircle, Bookmark,
} from 'lucide-react'
import { BackButton } from '../components/ui/BackButton'
import { EventRegistrationModal } from '../components/feature/EventRegistrationModal'
import { isAlreadyRegistered } from '../lib/event-registration'
import {
  parseQuickFacts, findRelatedEvents,
  attendeesFor, spotsLeftFor,
  getEventImage, categoryTone,
  MONTHS_TR,
} from '../lib/event-detail'
import { getSportLabel } from '../lib/sport-icons'
import { useProfile } from '../contexts/ProfileContext'
import type { SportEvent, Facility, EventSupporter, EventAccessibilityNote, DisabilityType } from '../types'

import eventsData     from '../data/events.json'
import facilitiesData from '../data/facilities.json'

import sportSwim       from '../assets/sport-swimming.jpg'
import sportBasket     from '../assets/sport-basketball.jpg'
import sportTT         from '../assets/sport-tabletennis.jpg'
import facilityPool    from '../assets/facility-pool.jpg'
import facilityEryaman from '../assets/facility-eryaman.jpg'
import facilityGym     from '../assets/facility-gym.jpg'

const ALL_EVENTS:     SportEvent[] = eventsData     as SportEvent[]
const ALL_FACILITIES: Facility[]   = facilitiesData as Facility[]

const ASSETS = { sportSwim, sportBasket, sportTT, facilityPool, facilityEryaman, facilityGym }

const DISABILITY_LABELS: Record<DisabilityType, string> = {
  wheelchair: 'Tekerlekli Sandalye',
  visual:     'Görme Engeli',
  hearing:    'İşitme Engeli',
  upper_limb: 'Üst Ekstremite Kısıtı',
}

const DISABILITY_TONES: Record<DisabilityType, string> = {
  wheelchair: 'bg-accent/15 text-accent',
  visual:     'bg-sky/60 text-sky-foreground',
  hearing:    'bg-mint/60 text-mint-foreground',
  upper_limb: 'bg-primary/10 text-primary',
}

const SUPPORTER_TONES: Record<EventSupporter['tone'], string> = {
  violet: 'bg-primary/10 text-primary',
  amber:  'bg-[#FFF3E0] text-[#c2410c]',
  mint:   'bg-mint/60 text-mint-foreground',
  sky:    'bg-sky/60 text-sky-foreground',
  peach:  'bg-[#FFF3E0] text-[#c2410c]',
}

const NOTE_ICONS: Record<EventAccessibilityNote['status'], React.ReactNode> = {
  ok:      <CheckCircle2 className="size-4 shrink-0 text-success" aria-hidden />,
  partial: <AlertCircle  className="size-4 shrink-0 text-warning"  aria-hidden />,
  unknown: <HelpCircle   className="size-4 shrink-0 text-muted-foreground" aria-hidden />,
}

const NOTE_GLYPH: Record<EventAccessibilityNote['status'], string> = {
  ok:      'bg-success text-white',
  partial: 'bg-warning text-white',
  unknown: 'bg-muted-foreground/50 text-white',
}

const NOTE_SYMBOL: Record<EventAccessibilityNote['status'], string> = {
  ok: '✓', partial: '~', unknown: '?',
}

function QuickFact({ disc, label, value, meta }: {
  disc: React.ReactNode
  label: string
  value: string
  meta?: string
}) {
  return (
    <div className="flex items-start gap-3.5 border-r border-border/40 p-5 last:border-r-0">
      <div className="grid size-10 shrink-0 place-items-center rounded-full">{disc}</div>
      <div>
        <div className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">{label}</div>
        <div className="mt-1 text-sm font-extrabold text-primary-deep leading-snug">{value}</div>
        {meta && <div className="mt-0.5 text-xs text-muted-foreground">{meta}</div>}
      </div>
    </div>
  )
}

function OrganizerCard({ event }: { event: SportEvent }) {
  const org = event.organizerDetail
  const name = org?.name ?? event.organizer
  const abbr = name.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase()

  return (
    <section
      aria-label="Etkinlik organizatörü"
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-deep to-accent p-7 text-white"
    >
      {/* decorative blob */}
      <div className="pointer-events-none absolute -bottom-10 -right-10 size-48 rounded-full bg-mint/20 blur-3xl" aria-hidden />

      <div className="relative">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-white/80">Bu etkinliği düzenleyen</p>

        <div className="mt-3 flex items-center gap-4">
          <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-white text-primary font-extrabold text-xl tracking-tighter">
            {abbr}
          </div>
          <div>
            <div className="font-display text-xl font-extrabold tracking-tight">{name}</div>
            {org?.role && <div className="mt-0.5 text-xs text-white/80">{org.role}</div>}
          </div>
        </div>

        {org?.description && (
          <p className="mt-4 text-sm text-white/90 leading-relaxed max-w-lg">{org.description}</p>
        )}

        {(org?.website || org?.contactEmail) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {org.website && (
              <a
                href={org.website}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-4 py-2 text-xs font-bold text-primary hover:bg-white transition"
              >
                <Globe className="size-3.5" aria-hidden />
                {org.website.replace(/^https?:\/\//, '')}
                <ExternalLink className="size-3" aria-hidden />
              </a>
            )}
            {org.contactEmail && (
              <a
                href={`mailto:${org.contactEmail}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-xs font-bold text-white hover:bg-white/25 transition backdrop-blur-sm"
              >
                <Mail className="size-3.5" aria-hidden /> İletişim
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

function SupportersCard({ supporters }: { supporters: EventSupporter[] }) {
  return (
    <section aria-label="Destekleyenler ve paydaşlar" className="rounded-3xl bg-card p-6 ring-1 ring-border/40">
      <h2 className="font-display mb-1 text-lg font-extrabold text-primary-deep">Destekleyenler &amp; Paydaşlar</h2>
      <p className="mb-5 text-xs text-muted-foreground">Bu etkinliği mümkün kılan kurumlar ve markalar.</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {supporters.map(s => (
          <div key={s.shortCode} className="flex items-center gap-3.5 rounded-2xl bg-muted/30 p-3.5">
            <div className={`grid size-14 shrink-0 place-items-center rounded-2xl text-xl font-extrabold tracking-tighter ${SUPPORTER_TONES[s.tone]}`}>
              {s.shortCode}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                {s.type === 'federation' ? 'Federasyon' : s.type === 'official' ? 'Resmi Destek' : 'Sponsor'}
              </div>
              <div className="mt-0.5 text-sm font-extrabold text-primary-deep leading-snug">{s.name}</div>
              {s.description && <div className="mt-0.5 text-xs text-muted-foreground">{s.description}</div>}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function DescriptionCard({ event }: { event: SportEvent }) {
  const text = event.longDescription ?? event.description
  const paragraphs = text.split('\n\n').filter(Boolean)

  return (
    <section aria-label="Etkinlik hakkında" className="rounded-3xl bg-card p-6 ring-1 ring-border/40">
      <h2 className="font-display mb-1 text-lg font-extrabold text-primary-deep">Etkinlik hakkında</h2>
      <p className="mb-5 text-xs text-muted-foreground">Programın akışı, neler bekleyebilirsin, neler yanına almalısın.</p>
      <div className="space-y-3">
        {paragraphs.map((p, i) => (
          <p key={i} className="text-sm leading-relaxed text-foreground/85">{p}</p>
        ))}
      </div>
    </section>
  )
}

function AudienceCard({ event }: { event: SportEvent }) {
  return (
    <section aria-label="Katılımcı profili ve erişilebilirlik" className="rounded-3xl bg-card p-6 ring-1 ring-border/40">
      <h2 className="font-display mb-1 text-lg font-extrabold text-primary-deep">Bu etkinlik kimler için uygun</h2>
      <p className="mb-4 text-xs text-muted-foreground">Profilin etkinliğe uygun mu? Aşağıdaki etiketlerden kontrol et.</p>

      <div className="flex flex-wrap gap-2">
        {event.disabilityTypes.map(dt => (
          <span
            key={dt}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${DISABILITY_TONES[dt]}`}
          >
            {DISABILITY_LABELS[dt]}
          </span>
        ))}
      </div>

      {event.accessibilityNotes && event.accessibilityNotes.length > 0 && (
        <>
          <div className="my-5 border-t border-dashed border-border/50" />
          <h3 className="font-display mb-1 text-sm font-extrabold text-primary-deep">Erişilebilirlik notları</h3>
          <p className="mb-4 text-xs text-muted-foreground">Personel onayladı · 2 saat önce güncellendi.</p>
          <ul className="space-y-2.5">
            {event.accessibilityNotes.map((note, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-2xl bg-muted/30 px-4 py-3"
              >
                <span className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-xs font-extrabold ${NOTE_GLYPH[note.status]}`}>
                  {NOTE_SYMBOL[note.status]}
                </span>
                <div>
                  <div className="text-sm font-extrabold text-primary-deep">{note.title}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{note.description}</div>
                </div>
                <span className="ml-auto" aria-hidden>{NOTE_ICONS[note.status]}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

function CtaCard({ event, onRegister, alreadyRegistered, isBookmarked, onToggleBookmark }: {
  event: SportEvent
  onRegister: () => void
  alreadyRegistered: boolean
  isBookmarked: boolean
  onToggleBookmark: () => void
}) {
  const registered = event.registered ?? attendeesFor(event)
  const capacity   = event.capacity ?? (registered + spotsLeftFor(event))
  const spotsLeft  = Math.max(0, capacity - registered)
  const fillPct    = Math.min(100, Math.round((registered / capacity) * 100))
  const isFree     = !event.fee || event.fee === 'free'

  return (
    <section aria-label="Katılım" className="rounded-3xl bg-card p-6 ring-1 ring-border/40">
      <div className="flex items-baseline gap-2">
        <span className="font-display text-2xl font-extrabold tracking-tight text-primary">
          {isFree ? 'Ücretsiz' : typeof event.fee === 'object' ? `${event.fee.amount} ${event.fee.currency}` : 'Ücretsiz'}
        </span>
        {isFree && <span className="text-xs text-muted-foreground">· kayıt zorunlu</span>}
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs text-foreground">
        <span className="font-extrabold">{registered} / {capacity}</span>
        <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-border/60">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all"
            style={{ width: `${fillPct}%` }}
          />
        </div>
      </div>
      {event.registrationDeadline && (
        <p className="mt-1.5 text-xs text-muted-foreground">
          Kayıt {(() => {
            const dl = new Date(event.registrationDeadline)
            return `${dl.getDate()} ${MONTHS_TR[dl.getMonth()]} ${dl.toLocaleDateString('tr-TR', { weekday: 'long' })} ${dl.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`
          })()}'da kapanır.
        </p>
      )}

      {alreadyRegistered ? (
        <div className="mt-4 flex items-center gap-2 rounded-full bg-mint/60 px-5 py-3 text-sm font-bold text-mint-foreground">
          <CheckCircle2 className="size-4 shrink-0" aria-hidden /> Kayıt tamamlandı
        </div>
      ) : spotsLeft > 0 ? (
        <button
          type="button"
          onClick={onRegister}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-extrabold text-primary-foreground shadow-glow hover:bg-primary-deep transition"
        >
          Katılacağım <ChevronRight className="size-4" aria-hidden />
        </button>
      ) : (
        <div className="mt-4 rounded-full bg-muted/40 px-5 py-3 text-center text-sm font-bold text-muted-foreground">
          Kontenjan doldu
        </div>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => {
            onToggleBookmark()
            const region = document.getElementById('aria-live-region')
            if (region) {
              region.textContent = isBookmarked
                ? `${event.title} favorilerden kaldırıldı`
                : `${event.title} favorilere eklendi`
            }
          }}
          aria-pressed={isBookmarked}
          aria-label={isBookmarked ? `${event.title} favorilerden kaldır` : `${event.title} favorilere ekle`}
          className={`flex items-center justify-center gap-1.5 rounded-full border py-2 text-xs font-bold transition ${
            isBookmarked
              ? 'border-primary/40 bg-primary/10 text-primary'
              : 'border-border/60 bg-card text-foreground hover:border-foreground/40'
          }`}
        >
          <Bookmark className="size-3.5" fill={isBookmarked ? 'currentColor' : 'none'} aria-hidden />
          {isBookmarked ? 'Kaydedildi' : 'Kaydet'}
        </button>
        <button
          type="button"
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: event.title, url: window.location.href }).catch(() => null)
            } else {
              navigator.clipboard.writeText(window.location.href).catch(() => null)
            }
          }}
          className="flex items-center justify-center gap-1.5 rounded-full border border-border/60 bg-card py-2 text-xs font-bold text-foreground hover:border-foreground/40 transition"
        >
          <ExternalLink className="size-3.5" aria-hidden /> Paylaş
        </button>
      </div>
    </section>
  )
}

function FacilityMiniCard({ facility }: { facility: Facility }) {
  const img = facility.photos?.[0]?.url ?? facilityPool

  return (
    <section aria-label="Tesis bilgisi" className="rounded-3xl bg-card p-6 ring-1 ring-border/40">
      <h2 className="font-display mb-4 text-sm font-extrabold text-primary-deep flex items-center gap-2">
        <MapPin className="size-4 text-accent" aria-hidden /> Konum
      </h2>
      <div
        className="mb-4 h-32 w-full rounded-2xl bg-cover bg-center"
        style={{ backgroundImage: `url(${img})` }}
        role="img"
        aria-label={`${facility.name} fotoğrafı`}
      />
      <div className="font-display text-base font-extrabold text-primary-deep">{facility.name}</div>
      <div className="mt-1 flex items-start gap-1.5 text-xs text-muted-foreground">
        <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        {facility.contact.address ?? `${facility.district}, Ankara`}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Link
          to={`/facility/${facility.id}`}
          className="inline-flex items-center gap-1.5 rounded-full bg-muted/40 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/10 transition"
        >
          Tesisi gör <ChevronRight className="size-3" aria-hidden />
        </Link>
      </div>
    </section>
  )
}

function AttendeesCard({ event }: { event: SportEvent }) {
  const count = event.registered ?? attendeesFor(event)
  const wheelchair = Math.max(1, Math.floor(count * 0.22))
  const avatarColors = [
    'from-primary to-accent',
    'from-accent to-sky',
    'from-mint to-sky',
    'bg-muted/60 text-muted-foreground',
  ]

  return (
    <section aria-label="Katılımcılar" className="rounded-3xl bg-card p-5 ring-1 ring-border/40">
      <div className="flex items-center gap-3">
        <div className="flex -space-x-2" aria-hidden>
          {[0,1,2].map(i => (
            <span
              key={i}
              className={`grid size-8 place-items-center rounded-full bg-gradient-to-br ${avatarColors[i]} text-xs font-extrabold text-white ring-2 ring-card`}
            >
              {['M','A','E'][i]}
            </span>
          ))}
          <span className="grid size-8 place-items-center rounded-full bg-muted/50 text-xs font-extrabold text-foreground/70 ring-2 ring-card">
            +{Math.max(0, count - 3)}
          </span>
        </div>
        <div>
          <div className="text-sm font-extrabold text-primary-deep">{count} kişi katılıyor</div>
          <div className="text-xs text-muted-foreground">İçinde {wheelchair} tekerlekli sandalye kullanıcısı.</div>
        </div>
      </div>
    </section>
  )
}

function RelatedEventCard({ event, facility }: { event: SportEvent; facility?: Facility }) {
  const d = new Date(event.date)
  const day = d.getDate()
  const month = MONTHS_TR[d.getMonth()].slice(0, 3)
  const time = d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
  const tone = categoryTone(event.sport)

  return (
    <Link
      to={`/events/${event.id}`}
      className="flex gap-3.5 rounded-2xl bg-card p-4 ring-1 ring-border/40 transition hover:ring-primary/40 hover:-translate-y-0.5"
    >
      <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-primary/10 text-primary-deep">
        <span className="text-2xl font-extrabold leading-none">{day}</span>
        <span className="text-xs font-bold uppercase tracking-wide">{month}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-extrabold text-primary-deep leading-snug line-clamp-2">{event.title}</div>
        <div className="mt-1 text-xs text-muted-foreground">
          {facility?.district ?? 'Ankara'} · {time}
        </div>
        <span className={`mt-1.5 inline-flex rounded-md px-2 py-0.5 text-xs font-bold ${tone}`}>
          {getSportLabel(event.sport)}
        </span>
      </div>
    </Link>
  )
}

export function EventDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { profile, toggleFavoriteEvent } = useProfile()
  const [modalOpen, setModalOpen] = useState(false)

  const event = ALL_EVENTS.find(e => e.id === id)
  if (!event) {
    return (
      <div className="mx-auto max-w-2xl p-8 text-center">
        <p className="mb-4 text-lg font-bold text-primary-deep">Etkinlik bulunamadı.</p>
        <button
          type="button"
          onClick={() => navigate('/events')}
          className="text-primary underline hover:text-primary-deep"
        >
          Etkinlikler listesine dön
        </button>
      </div>
    )
  }

  const facility        = ALL_FACILITIES.find(f => f.id === event.facilityId)
  const related         = findRelatedEvents(event, ALL_EVENTS)
  const facts           = parseQuickFacts(event, facility)
  const heroImage       = getEventImage(event.sport, ASSETS)
  const sportLabel      = getSportLabel(event.sport)
  const alreadyReg      = isAlreadyRegistered(event.id)
  const isBookmarked    = profile?.favoriteEvents.includes(event.id) ?? false

  const d           = new Date(event.date)
  const day         = d.getDate()
  const monthLong   = MONTHS_TR[d.getMonth()]
  const year        = d.getFullYear()
  const weekday     = d.toLocaleDateString('tr-TR', { weekday: 'long' })
  const time        = d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })

  const LEVEL_BADGE: Record<string, string> = {
    'başlangıç': 'Başlangıç seviyesi',
    'orta':      'Orta seviye',
    'ileri':     'İleri seviye',
    'yarışma':   'Yarışma',
  }

  return (
    <div className="mx-auto max-w-7xl pt-2 pb-20">
      <BackButton className="mb-5" />

      {/* Breadcrumb */}
      <nav aria-label="Sayfa konumu" className="mb-4 flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
        <Link to="/events" className="hover:text-primary-deep hover:underline underline-offset-2">Etkinlikler</Link>
        <ChevronRight className="size-3.5 text-border shrink-0" aria-hidden />
        <span>{sportLabel}</span>
        <ChevronRight className="size-3.5 text-border shrink-0" aria-hidden />
        <strong className="font-bold text-primary-deep truncate max-w-xs">{event.title}</strong>
        <span className="ml-auto shrink-0 inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">
          DEMO VERİSİ · Etkinlik
        </span>
      </nav>

      {/* Hero */}
      <section className="relative mb-5 h-[380px] overflow-hidden rounded-[2rem]">
        <img
          src={heroImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          aria-hidden
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, rgba(50,14,59,0.10) 0%, rgba(50,14,59,0.20) 40%, rgba(50,14,59,0.78) 100%)' }}
          aria-hidden
        />

        {/* Bottom content */}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 flex-wrap px-8 py-8">
          <div>
            {/* Tags */}
            <div className="mb-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold bg-sky/90 text-sky-foreground backdrop-blur-sm">
                {sportLabel}
              </span>
              <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
                {LEVEL_BADGE[event.level] ?? event.level}
              </span>
              {event.disabilityTypes.includes('wheelchair') && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
                  Tekerlekli sandalye uygun
                </span>
              )}
            </div>
            {/* Title */}
            <h1 className="font-display text-[clamp(1.75rem,4vw,2.75rem)] font-extrabold leading-[1.05] tracking-tight text-white max-w-2xl">
              {event.title}
            </h1>
            {event.longDescription ? (
              <p className="mt-2.5 max-w-xl text-sm text-white/85 leading-relaxed line-clamp-2">
                {event.longDescription.split('\n\n')[0]}
              </p>
            ) : (
              <p className="mt-2.5 max-w-xl text-sm text-white/85 leading-relaxed line-clamp-2">
                {event.description}
              </p>
            )}
          </div>

          {/* Date block */}
          <div className="shrink-0 rounded-3xl bg-white px-5 py-4 text-center min-w-[140px] shadow-[0_20px_60px_-20px_rgba(50,14,59,0.4)]">
            <div className="font-display text-5xl font-extrabold leading-none tracking-tight text-primary">{day}</div>
            <div className="mt-1 text-xs font-bold text-primary-deep uppercase tracking-wide">{monthLong} {year}</div>
            <div className="mt-0.5 text-xs text-muted-foreground capitalize">{weekday}</div>
            <div className="mt-2 border-t border-dashed border-border/50 pt-2 text-xs font-bold text-primary-deep">
              {time}
            </div>
          </div>
        </div>
      </section>

      {/* Quick facts strip */}
      <div className="mb-6 grid grid-cols-2 overflow-hidden rounded-2xl bg-card ring-1 ring-border/40 lg:grid-cols-4">
        <QuickFact
          disc={<Clock className="size-5 text-primary" />}
          label="Ne Zaman"
          value={facts.whenLabel}
          meta={facts.whenMeta}
        />
        <QuickFact
          disc={<MapPin className="size-5 text-accent" />}
          label="Nerede"
          value={facts.whereName}
          meta={facts.whereMeta}
        />
        <QuickFact
          disc={<span className="text-lg">🏅</span>}
          label="Seviye"
          value={facts.levelLabel}
          meta={facts.levelMeta}
        />
        <QuickFact
          disc={<span className="text-lg">💰</span>}
          label="Ücret"
          value={facts.feeLabel}
          meta={facts.feeMeta}
        />
      </div>

      {/* Two-column grid */}
      <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">

        {/* Left column */}
        <div className="space-y-5">
          <OrganizerCard event={event} />
          {event.supporters && event.supporters.length > 0 && (
            <SupportersCard supporters={event.supporters} />
          )}
          <DescriptionCard event={event} />
          <AudienceCard event={event} />
        </div>

        {/* Right sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <CtaCard
            event={event}
            onRegister={() => setModalOpen(true)}
            alreadyRegistered={alreadyReg}
            isBookmarked={isBookmarked}
            onToggleBookmark={() => toggleFavoriteEvent(event.id)}
          />
          {facility && <FacilityMiniCard facility={facility} />}
          <AttendeesCard event={event} />
        </aside>
      </div>

      {/* Related events */}
      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="mt-12">
          <div className="mb-5 flex items-baseline justify-between">
            <h2 id="related-heading" className="font-display text-2xl font-extrabold text-primary-deep">
              Yakındaki diğer etkinlikler
            </h2>
            <Link to="/events" className="text-xs font-bold text-primary hover:underline underline-offset-2">
              Tümünü gör →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map(e => (
              <RelatedEventCard
                key={e.id}
                event={e}
                facility={ALL_FACILITIES.find(f => f.id === e.facilityId)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Registration modal — key remounts to reset form state each open */}
      <EventRegistrationModal
        key={modalOpen ? 'open' : 'closed'}
        event={event}
        facility={facility}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  )
}
