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
