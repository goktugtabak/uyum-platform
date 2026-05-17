import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BackButton } from '../components/ui/BackButton'
import {
  ChevronLeft, ChevronRight, MapPin, Clock,
  PersonStanding, Bell, CalendarDays, ArrowRight, Sparkles, ChevronDown,
} from 'lucide-react'
import type { SportEvent, DisabilityType, Facility, Sport, EventLevel, UserProfile } from '../types'
import { useProfile } from '../contexts/ProfileContext'
import { MatchBadge, type MatchLevel } from '../components/ui/MatchBadge'
import { BookmarkButton } from '../components/ui/BookmarkButton'
import { FilterChip } from '../components/ui/FilterChip'
import { FilterDropdown, type DropdownOption } from '../components/ui/FilterDropdown'
import { ActiveFilterChip } from '../components/ui/ActiveFilterChip'
import { getSportLabel } from '../lib/sport-icons'
import {
  filterEvents,
  type EventFilters,
  type DateRange,
} from '../lib/event-filter'
import eventsData     from '../data/events.json'
import sportsData     from '../data/sports.json'
import facilitiesData from '../data/facilities.json'
import sportSwim from '../assets/sport-swimming.jpg'
import sportBasket from '../assets/sport-basketball.jpg'
import sportTT from '../assets/sport-tabletennis.jpg'
import facilityPool from '../assets/facility-pool.jpg'
import facilityEryaman from '../assets/facility-eryaman.jpg'

const ALL_EVENTS:     SportEvent[] = eventsData     as SportEvent[]
const ALL_SPORTS:     Sport[]      = sportsData     as Sport[]
const ALL_FACILITIES: Facility[]   = facilitiesData as Facility[]

const SPORTS_IN_EVENTS = Array.from(new Set(ALL_EVENTS.map(e => e.sport)))
  .map(id => ALL_SPORTS.find(s => s.id === id))
  .filter((s): s is Sport => Boolean(s))

const DATE_OPTIONS: ReadonlyArray<{ id: DateRange; label: string }> = [
  { id: 'week',  label: 'Bu hafta' },
  { id: 'month', label: 'Bu ay' },
  { id: 'all',   label: 'Tümü' },
]

const DISABILITY_OPTIONS: ReadonlyArray<{ id: DisabilityType; label: string }> = [
  { id: 'wheelchair', label: 'Tekerlekli Sandalye' },
  { id: 'visual',     label: 'Görme' },
  { id: 'hearing',    label: 'İşitme' },
  { id: 'upper_limb', label: 'Üst Ekstremite' },
]

const LEVEL_LABELS: Record<EventLevel, string> = {
  'başlangıç': 'Başlangıç',
  'orta':      'Orta',
  'ileri':     'İleri',
  'yarışma':   'Yarışma',
}

const MONTHS_TR_LONG = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
]

function getEventImage(sportId: string): string {
  if (sportId.includes('swim') || sportId.includes('aqua') || sportId.includes('waterpolo')) return sportSwim
  if (sportId.includes('basket') || sportId.includes('volley') || sportId.includes('football')) return sportBasket
  if (sportId.includes('tennis') || sportId.includes('table') || sportId.includes('boccia') || sportId.includes('archery') || sportId.includes('goalball')) return sportTT
  if (sportId.includes('yoga') || sportId.includes('pilates')) return facilityPool
  if (sportId.includes('athletics') || sportId.includes('strength')) return facilityEryaman
  return facilityEryaman
}

function categoryTone(sportId: string): string {
  if (sportId.includes('swim') || sportId.includes('aqua') || sportId.includes('waterpolo'))
    return 'bg-sky/60 text-sky-foreground'
  if (sportId.includes('basket') || sportId.includes('volley') || sportId.includes('football'))
    return 'bg-primary/10 text-primary'
  if (sportId.includes('yoga') || sportId.includes('pilates') || sportId.includes('strength'))
    return 'bg-mint/60 text-mint-foreground'
  return 'bg-accent/15 text-accent'
}

// Deterministic placeholder for attendees/spotsLeft (no backend yet).
function hashId(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0
  return Math.abs(h)
}

function attendeesFor(event: SportEvent): number {
  return 8 + (hashId(event.id) % 24) // 8..31
}
function spotsLeftFor(event: SportEvent): number {
  return 2 + (hashId(event.id + 'spots') % 14) // 2..15
}

function profileMatchLevel(event: SportEvent, profile: UserProfile): MatchLevel {
  let score = 0
  const sport = ALL_SPORTS.find(s => s.id === event.sport)
  if (sport?.suitableFor.some(d => profile.disabilityTypes.includes(d))) score += 2
  if (event.disabilityTypes.some(d => profile.disabilityTypes.includes(d))) score += 2
  if (sport?.mobilityLevel.includes(profile.mobilityLevel)) score += 1
  if (score >= 4) return 'high'
  if (score >= 2) return 'medium'
  return 'low'
}

function findFacility(id: string): Facility | undefined {
  return ALL_FACILITIES.find(f => f.id === id)
}

function relativeDays(iso: string, now: number): string {
  const diffMs = new Date(iso).getTime() - now
  const diffDays = Math.ceil(diffMs / 86_400_000)
  if (diffDays === 0) return 'Bugün'
  if (diffDays === 1) return 'Yarın'
  if (diffDays > 0) return `${diffDays} gün sonra`
  return ''
}


interface EventRowProps {
  event: SportEvent
  now: number
  profile: UserProfile
  toggleFavoriteEvent: (id: string) => void
  dimmed?: boolean
}

function EventRow({ event, now, profile, toggleFavoriteEvent, dimmed = false }: EventRowProps) {
  const facility = findFacility(event.facilityId)
  const d = new Date(event.date)
  const day = String(d.getDate())
  const month = MONTHS_TR_LONG[d.getMonth()]
  const weekday = d.toLocaleDateString('tr-TR', { weekday: 'long' })
  const time = d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
  const attendees = attendeesFor(event)
  const spotsLeft = spotsLeftFor(event)
  const rel = relativeDays(event.date, now)

  return (
    <article
      aria-labelledby={`event-${event.id}-title`}
      className={`grid items-stretch gap-5 transition-opacity sm:grid-cols-[15rem_auto_1fr] ${dimmed ? 'opacity-60' : ''}`}
    >
      {/* Photo */}
      <div className="relative h-44 overflow-hidden rounded-[1.5rem] sm:h-full">
        <img
          src={getEventImage(event.sport)}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>

      {/* Date column */}
      <div className="flex flex-col items-center justify-start pt-2 text-center">
        <span className="text-3xl font-extrabold leading-none text-primary-deep">{day}</span>
        <span className="mt-1 text-[12px] font-bold text-foreground/70">{month}</span>
        <span className="mt-0.5 text-[11px] text-muted-foreground capitalize">{weekday}</span>
      </div>

      {/* Content */}
      <div className="relative pr-24">
        <div className="absolute right-0 top-0 text-right">
          <MatchBadge level={profileMatchLevel(event, profile)} />
        </div>
        <h3
          id={`event-${event.id}-title`}
          className="text-[19px] font-extrabold leading-tight text-primary-deep"
        >
          {event.title}
        </h3>
        <span className={`mt-2 inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold ${categoryTone(event.sport)}`}>
          {getSportLabel(event.sport)}
        </span>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-3.5 text-accent" aria-hidden />{' '}
            {facility ? (
              <Link to={`/facility/${facility.id}`} className="hover:text-primary">
                {facility.name}
              </Link>
            ) : 'Bilinmeyen tesis'}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-3.5" aria-hidden /> {time}
            {rel && ` · ${rel}`}
          </span>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
          <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 font-semibold text-accent">
            <PersonStanding className="size-3" aria-hidden /> Erişilebilir
          </span>
          <span className="rounded-full bg-muted px-2 py-0.5 font-semibold text-foreground/70">
            {LEVEL_LABELS[event.level]}
          </span>
          <span className="text-muted-foreground">Kontenjan: {spotsLeft} kişi kaldı</span>
        </div>

        <p className="mt-2.5 max-w-md text-[13px] leading-relaxed text-foreground/75 line-clamp-3">
          {event.description}
        </p>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2" aria-hidden>
              {[...Array(4)].map((_, i) => (
                <span key={i} className="size-7 rounded-full bg-primary ring-2 ring-background" />
              ))}
            </div>
            <span className="text-[12px] text-muted-foreground">+{Math.max(0, attendees - 4)}</span>
          </div>
          <div className="flex items-center gap-2">
            {event.registrationUrl ? (
              <a
                href={event.registrationUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 rounded-full bg-card px-5 py-2 text-xs font-bold text-primary ring-1 ring-primary/30 hover:bg-primary hover:text-primary-foreground"
              >
                {spotsLeft > 0 ? 'Katılacağım' : 'Detayları Gör'} <ArrowRight className="size-3.5" aria-hidden />
              </a>
            ) : (
              <Link
                to={facility ? `/facility/${facility.id}` : '/events'}
                className="inline-flex items-center gap-1.5 rounded-full bg-card px-5 py-2 text-xs font-bold text-primary ring-1 ring-primary/30 hover:bg-primary hover:text-primary-foreground"
              >
                {spotsLeft > 0 ? 'Katılacağım' : 'Detayları Gör'} <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            )}
            <BookmarkButton
              isBookmarked={profile.favoriteEvents.includes(event.id)}
              onToggle={() => toggleFavoriteEvent(event.id)}
              label={event.title}
            />
          </div>
        </div>
      </div>
    </article>
  )
}

function MiniCalendar({ events, now }: { events: SportEvent[]; now: Date }) {
  const [cursor, setCursor] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1))
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const year  = cursor.getFullYear()
  const month = cursor.getMonth()
  const firstWeekday = new Date(year, month, 1).getDay()
  const offset = (firstWeekday + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = now.getDate()
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth()

  const eventsByDay = useMemo(() => {
    const map = new Map<number, SportEvent[]>()
    const y = cursor.getFullYear()
    const m = cursor.getMonth()
    for (const e of events) {
      const d = new Date(e.date)
      if (d.getFullYear() === y && d.getMonth() === m) {
        const day = d.getDate()
        if (!map.has(day)) map.set(day, [])
        map.get(day)!.push(e)
      }
    }
    return map
  }, [events, cursor])

  function prevMonth() { setCursor(new Date(year, month - 1, 1)); setSelectedDay(null) }
  function nextMonth() { setCursor(new Date(year, month + 1, 1)); setSelectedDay(null) }

  const selectedEvents = selectedDay != null ? (eventsByDay.get(selectedDay) ?? []) : []

  return (
    <div className="rounded-2xl bg-card p-5 ring-1 ring-border/40">
      {/* Nav */}
      <div className="mb-5 flex items-center justify-between">
        <button
          type="button"
          onClick={prevMonth}
          aria-label="Önceki ay"
          className="grid size-8 place-items-center rounded-full text-foreground/70 ring-1 ring-border/60 hover:bg-background"
        >
          <ChevronLeft className="size-4" aria-hidden />
        </button>
        <span className="text-base font-extrabold text-primary-deep">
          {MONTHS_TR_LONG[month]} {year}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          aria-label="Sonraki ay"
          className="grid size-8 place-items-center rounded-full text-foreground/70 ring-1 ring-border/60 hover:bg-background"
        >
          <ChevronRight className="size-4" aria-hidden />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 text-center text-[11px] font-bold text-muted-foreground">
        {['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'].map(d => (
          <span key={d} className="py-1">{d}</span>
        ))}
      </div>

      {/* Day grid */}
      <div className="mt-1 grid grid-cols-7 text-center">
        {Array.from({ length: offset }).map((_, i) => <span key={`pad-${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
          const isToday    = isCurrentMonth && d === today
          const hasEvents  = eventsByDay.has(d)
          const isSelected = selectedDay === d
          return (
            <button
              key={d}
              type="button"
              onClick={() => hasEvents ? setSelectedDay(prev => prev === d ? null : d) : undefined}
              disabled={!hasEvents && !isToday}
              aria-pressed={isSelected}
              className={`relative mx-auto grid h-11 w-11 place-items-center rounded-xl text-[13px] transition ${
                isToday
                  ? 'bg-primary font-bold text-primary-foreground shadow-glow'
                  : isSelected
                  ? 'bg-primary/15 font-bold text-primary ring-1 ring-primary/30'
                  : hasEvents
                  ? 'cursor-pointer font-semibold text-primary-deep hover:bg-primary/10'
                  : 'cursor-default text-foreground/50'
              }`}
            >
              {d}
              {hasEvents && !isToday && (
                <span
                  className={`absolute bottom-1.5 left-1/2 -translate-x-1/2 size-1 rounded-full ${isSelected ? 'bg-primary' : 'bg-accent'}`}
                  aria-hidden
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Selected day popup */}
      {selectedDay != null && selectedEvents.length > 0 && (
        <div className="mt-5 border-t border-border/40 pt-4 space-y-2.5">
          <div className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
            {selectedDay} {MONTHS_TR_LONG[month]}
          </div>
          {selectedEvents.map(e => {
            const d = new Date(e.date)
            const time = d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
            const facility = findFacility(e.facilityId)
            return (
              <div key={e.id} className="flex gap-3 rounded-xl bg-background p-2.5 ring-1 ring-border/30">
                <img
                  src={getEventImage(e.sport)}
                  alt=""
                  className="size-12 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12.5px] font-bold text-foreground">{e.title}</div>
                  <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock className="size-3 shrink-0" aria-hidden /> {time}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-muted-foreground">
                    <MapPin className="size-3 shrink-0" aria-hidden /> {facility?.name ?? 'Tesis'}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function InterestList({ events }: { events: SportEvent[] }) {
  const tones: Array<'accent' | 'peach' | 'mint'> = ['accent', 'peach', 'mint']
  const items = events.slice(0, 3).map((e, i) => {
    const d = new Date(e.date)
    const facility = findFacility(e.facilityId)
    return {
      id:    e.id,
      title: e.title,
      when:  `${d.getDate()} ${MONTHS_TR_LONG[d.getMonth()]} · ${d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`,
      loc:   facility?.name ?? 'Bilinmeyen tesis',
      tag:   i === 0 ? 'Yeni' : i === 1 ? 'Popüler' : 'Sana uygun',
      tone:  tones[i],
    }
  })

  return (
    <div>
      <div className="mb-4 flex items-end justify-between">
        <h3 className="text-base font-extrabold text-primary-deep">İlgi Alanlarına Göre Öneriler</h3>
        <Link to="/events" className="text-xs font-semibold text-primary">Tümü →</Link>
      </div>
      <ul className="space-y-4">
        {items.map(it => (
          <li key={it.id} className="flex items-start gap-3">
            <span className={`grid size-9 shrink-0 place-items-center rounded-full ${
              it.tone === 'accent' ? 'bg-accent/15 text-accent' :
              it.tone === 'peach'  ? 'bg-accent/15 text-accent' :
                                     'bg-mint/60 text-mint-foreground'
            }`}>
              <Sparkles className="size-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div className="truncate text-[13px] font-bold text-foreground">{it.title}</div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9.5px] font-bold ${
                  it.tone === 'accent' ? 'bg-accent/15 text-accent' :
                  it.tone === 'peach'  ? 'bg-accent/15 text-accent' :
                                         'bg-mint/60 text-mint-foreground'
                }`}>{it.tag}</span>
              </div>
              <div className="text-[11px] text-muted-foreground">{it.when}</div>
              <div className="truncate text-[11px] text-muted-foreground">{it.loc}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function UpcomingList({ events }: { events: SportEvent[] }) {
  return (
    <div>
      <div className="mb-4 flex items-end justify-between">
        <h3 className="inline-flex items-center gap-2  text-base font-extrabold text-primary-deep">
          <CalendarDays className="size-4 text-primary" aria-hidden /> Yaklaşan etkinliklerin
        </h3>
        <Link to="/events" className="text-xs font-semibold text-primary">Tümü →</Link>
      </div>
      <ul className="space-y-5">
        {events.slice(0, 3).map(e => {
          const d = new Date(e.date)
          const facility = findFacility(e.facilityId)
          return (
            <li key={e.id} className="flex gap-3">
              <img
                src={getEventImage(e.sport)}
                alt=""
                className="size-14 shrink-0 rounded-2xl object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold text-foreground">{e.title}</div>
                <div className="text-[11.5px] text-muted-foreground">
                  {d.getDate()} {MONTHS_TR_LONG[d.getMonth()]} ·{' '}
                  {d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="truncate text-[11px] text-muted-foreground">
                  <span aria-hidden></span> {facility?.name ?? 'Tesis'}
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}


function NotifyBlock() {
  return (
    <div className="flex items-start gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-mint/60 text-mint-foreground" aria-hidden>
        <Bell className="size-4" />
      </span>
      <div>
        <div className="text-sm font-bold text-foreground">Uygun etkinliklerden haberdar ol</div>
        <p className="mt-1 text-[12px] text-muted-foreground">
          Profiline uygun yeni etkinlikler açıldığında sana bildiririz.
        </p>
        <button type="button" className="mt-3 text-xs font-bold text-primary">Bildirimleri aç →</button>
      </div>
    </div>
  )
}

export function EventList() {
  const { profile, toggleFavoriteEvent } = useProfile()
  const [now] = useState<number>(() => Date.now())
  const [filters, setFilters] = useState<EventFilters>({
    dateRange:      'all',
    sport:          'all',
    disabilityType: 'all',
  })
  const [openDD, setOpenDD] = useState<string | null>(null)

  const { upcoming, past } = useMemo(
    () => filterEvents(filters, profile, ALL_EVENTS, now),
    [filters, profile, now],
  )

  const isFiltered =
    filters.dateRange !== 'all' ||
    filters.sport !== 'all' ||
    filters.disabilityType !== 'all'

  const profileMatchCount = useMemo(() => {
    if (!profile) return 0
    return upcoming.filter(e => e.disabilityTypes.some(d => profile.disabilityTypes.includes(d))).length
  }, [upcoming, profile])

  function clearFilters() {
    setFilters({ dateRange: 'all', sport: 'all', disabilityType: 'all' })
  }
  function toggleDD(key: string) {
    setOpenDD(prev => (prev === key ? null : key))
  }

  if (!profile) return null

  const sportOptions: DropdownOption[] = [
    { value: 'all', label: 'Tümü' },
    ...SPORTS_IN_EVENTS.map(s => ({ value: s.id, label: s.name })),
  ]
  const disabilityOptions: DropdownOption[] = [
    { value: 'all', label: 'Tümü' },
    ...DISABILITY_OPTIONS.map(o => ({ value: o.id, label: o.label })),
  ]

  return (
    <div className="mx-auto max-w-7xl pt-2">
      <BackButton className="mb-6" />
      {/* Hero — fotoğraf + başlık */}
      <header className="relative mb-10 overflow-hidden rounded-3xl" style={{ minHeight: 220 }}>
        {/* Fotoğraf */}
        <img
          src="/images/event.png"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        {/* Sol: arka plan rengiyle (krem/bej) uyumlu gradient — içeriği okunur kılar */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to right, oklch(0.985 0.005 290) 28%, oklch(0.985 0.005 290 / 0.82) 50%, transparent 75%)',
          }}
          aria-hidden
        />
        {/* Alt: hafif siluet geçişi */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, oklch(0.985 0.005 290 / 0.5) 0%, transparent 40%)' }}
          aria-hidden
        />

        {/* İçerik */}
        <div className="relative px-8 py-10 md:max-w-lg">
          <h1 className="text-[clamp(2.2rem,4.2vw,3.4rem)] font-extrabold leading-[1.05] tracking-tight text-primary-deep">
            Etkinlikler
          </h1>
          <p className="mt-3 max-w-sm text-[15px] text-foreground/70">
            Profiline ve ilgi alanlarına göre senin için sıralanan etkinlikleri keşfet,
            katıl ve yeni deneyimler kazan.
          </p>
        </div>
      </header>

      {/* Filter row — hero label + FilterDropdowns + date chips */}
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        {/* "Senin için" accent pill — decorative, not a filter toggle */}
        <button
          type="button"
          className="inline-flex items-center gap-1.5 self-end rounded-full bg-primary px-2 py-1.5 text-xs font-bold text-primary-foreground shadow-glow"
          aria-label="Profiline göre sıralanmış etkinlikler"
        >
          <Sparkles className="size-3.5" aria-hidden /> Senin için
        </button>

        <FilterDropdown
          label="Spor Türü"
          value={filters.sport}
          options={sportOptions}
          onChange={v => setFilters(f => ({ ...f, sport: v }))}
          open={openDD === 'sport'}
          onToggle={() => toggleDD('sport')}
        />

        <FilterDropdown
          label="Engel Tipi"
          value={filters.disabilityType}
          options={disabilityOptions}
          onChange={v => setFilters(f => ({ ...f, disabilityType: v as EventFilters['disabilityType'] }))}
          open={openDD === 'disability'}
          onToggle={() => toggleDD('disability')}
        />

        {/* Date range chips — compact inline group */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Tarih</span>
          <div className="flex items-center gap-1">
            {DATE_OPTIONS.map(opt => (
              <FilterChip
                key={opt.id}
                role="radio"
                active={filters.dateRange === opt.id}
                onClick={() => setFilters(f => ({ ...f, dateRange: opt.id }))}
              >
                {opt.label}
              </FilterChip>
            ))}
          </div>
        </div>
      </div>

      {/* Active filter chips row */}
      {isFiltered && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {filters.sport !== 'all' && (
            <ActiveFilterChip
              label={`Spor: ${SPORTS_IN_EVENTS.find(s => s.id === filters.sport)?.name ?? filters.sport}`}
              onRemove={() => setFilters(f => ({ ...f, sport: 'all' }))}
            />
          )}
          {filters.disabilityType !== 'all' && (
            <ActiveFilterChip
              label={`Engel: ${DISABILITY_OPTIONS.find(o => o.id === filters.disabilityType)?.label ?? filters.disabilityType}`}
              onRemove={() => setFilters(f => ({ ...f, disabilityType: 'all' }))}
            />
          )}
          {filters.dateRange !== 'all' && (
            <ActiveFilterChip
              label={`Tarih: ${DATE_OPTIONS.find(o => o.id === filters.dateRange)?.label ?? filters.dateRange}`}
              onRemove={() => setFilters(f => ({ ...f, dateRange: 'all' }))}
            />
          )}
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs font-bold text-primary underline-offset-2 hover:underline"
          >
            Filtreleri temizle
          </button>
        </div>
      )}

      <div className="grid gap-12 xl:grid-cols-[1fr_22rem]">
        {/* Event flow */}
        <section aria-labelledby="upcoming-heading">
          <div className="mb-7 flex flex-wrap items-end gap-3">
            <h2 id="upcoming-heading" className="text-xl font-extrabold text-primary-deep">
              Sana özel önerilen etkinlikler
            </h2>
            {upcoming.length > 0 && (
              <span className="rounded-full bg-mint/50 px-3 py-1 text-[11px] font-bold text-mint-foreground">
                Profiline {profileMatchCount > 0 ? `${profileMatchCount} eşleşme` : `${upcoming.length} etkinlik`}
              </span>
            )}
          </div>

          {upcoming.length > 0 ? (
            <div className="space-y-10">
              {upcoming.map(event => (
                <EventRow key={event.id} event={event} now={now} profile={profile} toggleFavoriteEvent={toggleFavoriteEvent} />
              ))}
            </div>
          ) : (
            <div role="status" className="rounded-3xl bg-card p-6 text-center ring-1 ring-border/40">
              <p className="text-sm text-foreground/85">
                Bu filtreyle eşleşen yaklaşan etkinlik yok.
              </p>
              {isFiltered && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-3 text-sm font-bold text-primary underline"
                >
                  Filtreleri temizle
                </button>
              )}
            </div>
          )}

          {past.length > 0 && (
            <section aria-labelledby="past-heading" className="mt-12 border-t border-border/40 pt-6">
              <h2
                id="past-heading"
                className="mb-5 text-sm font-bold uppercase tracking-wider text-muted-foreground"
              >
                Geçmiş Etkinlikler ({past.length})
              </h2>
              <div className="space-y-10">
                {past.map(event => (
                  <EventRow key={event.id} event={event} now={now} profile={profile} toggleFavoriteEvent={toggleFavoriteEvent} dimmed />
                ))}
              </div>
            </section>
          )}

          <div className="mt-10 text-center">
            <button type="button" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
              Daha fazla etkinlik yükle <ChevronDown className="size-4" aria-hidden />
            </button>
          </div>
        </section>

        {/* Aside */}
        <aside className="space-y-10">
          <MiniCalendar events={ALL_EVENTS} now={new Date(now)} />
          <UpcomingList events={upcoming} />
          <InterestList events={upcoming.length > 0 ? upcoming : ALL_EVENTS} />
          
          <NotifyBlock />
        </aside>
      </div>
    </div>
  )
}
