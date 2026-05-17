import type { AccessibilityDimension } from '../types'

export interface A11yLabel {
  label: string
  icon: string
  value: number | null
}

const LABELS: Record<AccessibilityDimension, A11yLabel> = {
  verified: { label: 'Doğrulanmış',  icon: '✅', value: 1.0 },
  partial:  { label: 'Kısmi',        icon: '⚠️', value: 0.5 },
  none:     { label: 'Mevcut Değil', icon: '❌', value: 0.0 },
  unknown:  { label: 'Bilgi Yok',    icon: '❓', value: null },
}

export function getAccessibilityLabel(dim: AccessibilityDimension): A11yLabel {
  return LABELS[dim]
}

import type { ScoreColor } from '../hooks/useFacilityScore'

export const SCORE_LABEL: Record<ScoreColor, string> = {
  green:  'Çok Uygun',
  yellow: 'Kısmen Uygun',
  red:    'Riskli',
  gray:   'Bilgi Eksik',
}

export const SCORE_GLYPH: Record<ScoreColor, string> = {
  green:  '✓',
  yellow: '~',
  red:    '✕',
  gray:   '?',
}

export const SCORE_TONE: Record<ScoreColor, string> = {
  green:  'bg-mint/60 text-mint-foreground',
  yellow: 'bg-[oklch(0.95_0.07_85)] text-[oklch(0.45_0.14_75)]',
  red:    'bg-destructive/15 text-destructive',
  gray:   'bg-muted text-foreground/70',
}
