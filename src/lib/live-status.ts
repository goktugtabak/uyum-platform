export type Freshness = 'fresh' | 'recent' | 'stale'

export const LIVE_STATUS_KEYS = ['lift', 'elevator', 'ramp', 'changing'] as const
export type LiveStatusKey = (typeof LIVE_STATUS_KEYS)[number]

const LIVE_STATUS_LABELS: Record<LiveStatusKey, string> = {
  lift:     'Lift',
  elevator: 'Asansör',
  ramp:     'Rampa',
  changing: 'Soyunma Alanı',
}

export function getLiveStatusLabel(key: LiveStatusKey): string {
  return LIVE_STATUS_LABELS[key]
}

export function getFreshness(
  verifiedAt: string | null,
  now: Date = new Date(),
): Freshness | null {
  if (!verifiedAt) return null
  const diffDays = (now.getTime() - new Date(verifiedAt).getTime()) / 86_400_000
  if (diffDays <= 7) return 'fresh'
  if (diffDays <= 30) return 'recent'
  return 'stale'
}

export function formatRelative(
  verifiedAt: string | null,
  now: Date = new Date(),
): string {
  if (!verifiedAt) return 'Bilinmiyor'
  const diffDays = Math.floor(
    (now.getTime() - new Date(verifiedAt).getTime()) / 86_400_000,
  )
  if (diffDays === 0) return 'Bugün'
  if (diffDays === 1) return '1 gün önce'
  return `${diffDays} gün önce`
}
