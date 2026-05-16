export const DIMENSION_KEYS = [
  'entry',
  'internal',
  'changing',
  'equipment',
  'staff',
  'communication',
] as const

export type DimensionKey = (typeof DIMENSION_KEYS)[number]

const DIMENSION_LABELS: Record<DimensionKey, string> = {
  entry:         'Giriş',
  internal:      'İç Dolaşım',
  changing:      'Soyunma & Tuvalet',
  equipment:     'Ekipman',
  staff:         'Personel',
  communication: 'İletişim',
}

export function getDimensionLabel(key: DimensionKey): string {
  return DIMENSION_LABELS[key]
}
