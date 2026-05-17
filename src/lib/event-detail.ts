import type { SportEvent, Facility } from '../types'

const MONTHS_TR = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
]

const LEVEL_LABELS: Record<string, string> = {
  'başlangıç': 'Başlangıç',
  'orta':      'Orta',
  'ileri':     'İleri',
  'yarışma':   'Yarışma',
}

export interface QuickFacts {
  whenLabel: string
  whenMeta: string
  whereName: string
  whereMeta: string
  levelLabel: string
  levelMeta: string
  feeLabel: string
  feeMeta: string
}

export function parseQuickFacts(event: SportEvent, facility: Facility | undefined): QuickFacts {
  const d = new Date(event.date)
  const day = d.getDate()
  const month = MONTHS_TR[d.getMonth()]
  const time = d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })

  const now = Date.now()
  const diffDays = Math.ceil((d.getTime() - now) / 86_400_000)
  let whenMeta = ''
  if (diffDays === 0) whenMeta = 'Bugün'
  else if (diffDays === 1) whenMeta = 'Yarın'
  else if (diffDays > 0) whenMeta = `${diffDays} gün sonra`

  let feeLabel = 'Ücretsiz'
  let feeMeta = ''
  if (event.fee && event.fee !== 'free') {
    feeLabel = `${event.fee.amount} ${event.fee.currency}`
    feeMeta = 'Kayıt zorunlu'
  } else if (event.capacity) {
    feeMeta = `Kayıt zorunlu · ${event.capacity} kişi limiti`
  }

  if (event.registrationDeadline) {
    const dl = new Date(event.registrationDeadline)
    const dlDay = dl.getDate()
    const dlMonth = MONTHS_TR[dl.getMonth()]
    feeMeta = feeMeta
      ? `${feeMeta} · Son: ${dlDay} ${dlMonth}`
      : `Son kayıt: ${dlDay} ${dlMonth}`
  }

  return {
    whenLabel: `${day} ${month} · ${time}`,
    whenMeta,
    whereName: facility?.name ?? 'Bilinmeyen tesis',
    whereMeta: facility?.district ? `${facility.district}, Ankara` : 'Ankara',
    levelLabel: LEVEL_LABELS[event.level] ?? event.level,
    levelMeta: event.level === 'başlangıç' ? 'Daha önce denemiş olman gerekmez' : '',
    feeLabel,
    feeMeta,
  }
}

export function findRelatedEvents(
  current: SportEvent,
  all: SportEvent[],
  max = 3,
): SportEvent[] {
  const now = Date.now()
  return all
    .filter(e => {
      if (e.id === current.id) return false
      if (new Date(e.date).getTime() < now) return false
      return e.sport === current.sport || e.facilityId === current.facilityId
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, max)
}

function hashId(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0
  return Math.abs(h)
}

export function attendeesFor(event: SportEvent): number {
  if (event.registered !== undefined) return event.registered
  return 8 + (hashId(event.id) % 24)
}

export function spotsLeftFor(event: SportEvent): number {
  if (event.capacity !== undefined && event.registered !== undefined) {
    return Math.max(0, event.capacity - event.registered)
  }
  return 2 + (hashId(event.id + 'spots') % 14)
}

export function getEventImage(sportId: string, assets: {
  sportSwim: string
  sportBasket: string
  sportTT: string
  facilityPool: string
  facilityEryaman: string
  facilityGym?: string
}): string {
  if (sportId.includes('swim') || sportId.includes('aqua') || sportId.includes('waterpolo')) return assets.sportSwim
  if (sportId.includes('basket') || sportId.includes('volley') || sportId.includes('football')) return assets.sportBasket
  if (sportId.includes('tennis') || sportId.includes('table') || sportId.includes('boccia') || sportId.includes('archery') || sportId.includes('goalball')) return assets.sportTT
  if (sportId.includes('yoga') || sportId.includes('pilates') || sportId.includes('strength')) return assets.facilityGym ?? assets.facilityEryaman
  if (sportId.includes('athletics')) return assets.facilityEryaman
  return assets.facilityEryaman
}

export function categoryTone(sportId: string): string {
  if (sportId.includes('swim') || sportId.includes('aqua') || sportId.includes('waterpolo'))
    return 'bg-sky/60 text-sky-foreground'
  if (sportId.includes('basket') || sportId.includes('volley') || sportId.includes('football'))
    return 'bg-primary/10 text-primary'
  if (sportId.includes('yoga') || sportId.includes('pilates') || sportId.includes('strength'))
    return 'bg-mint/60 text-mint-foreground'
  return 'bg-accent/15 text-accent'
}

export { MONTHS_TR, LEVEL_LABELS }
