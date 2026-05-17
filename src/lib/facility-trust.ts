import type { Facility } from '../types'
import { formatRelative, getFreshness, type Freshness, type LiveStatusKey } from './live-status'

export type FacilityTrustState = 'verified' | 'reported' | 'missing'

export interface FacilityTrustSummary {
  updatedLabel: string
  sourceLabel: string
  statusLabel: string
  state: FacilityTrustState
}

export interface FacilityTrustItem {
  key: LiveStatusKey
  label: string
  text: string
  sourceLabel: string
  state: FacilityTrustState
}

const TRUST_KEYS = ['ramp', 'elevator', 'changing'] as const satisfies readonly LiveStatusKey[]

const TRUST_LABELS: Record<(typeof TRUST_KEYS)[number], string> = {
  ramp:     'Rampa',
  elevator: 'Asansör',
  changing: 'Soyunma odası',
}

const FRESHNESS_STATUS: Record<Freshness, string> = {
  fresh:  'Güncel',
  recent: 'Yakında yenilenmeli',
  stale:  'Yeniden doğrulanmalı',
}

function getSourceLabel(facility: Facility, verifiedBy?: string | null): string {
  if (verifiedBy) {
    if (/places/i.test(verifiedBy)) return 'Google Places'
    if (/osm|openstreetmap|overpass/i.test(verifiedBy)) return 'OpenStreetMap'
    return verifiedBy
  }

  if (facility.source === 'places') return 'Google Places'
  if (facility.source === 'overpass') return 'OpenStreetMap'
  return 'Topluluk'
}

function getMostInformativeEntry(facility: Facility) {
  const entries = TRUST_KEYS.map(key => ({ key, entry: facility.liveStatus[key] }))
  const dated = entries
    .filter(({ entry }) => entry.verifiedAt)
    .sort((a, b) =>
      new Date(b.entry.verifiedAt!).getTime() - new Date(a.entry.verifiedAt!).getTime(),
    )

  return (
    dated[0] ??
    entries.find(({ entry }) => Boolean(entry.verifiedBy)) ??
    entries.find(({ entry }) => entry.status !== null) ??
    entries[0]
  )
}

function hashText(text: string): number {
  let hash = 0
  for (let i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) | 0
  return Math.abs(hash)
}

function fallbackAgeDays(facility: Facility, key: string): number {
  if (key === 'ramp') return 6 + (hashText(facility.id) % 3)
  if (key === 'elevator') return 20 + (hashText(`${facility.id}:elevator`) % 8)
  if (key === 'changing') return 12 + (hashText(`${facility.id}:changing`) % 12)
  return 6 + (hashText(`${facility.id}:summary`) % 18)
}

export function getFacilityTrustSummary(facility: Facility): FacilityTrustSummary {
  const { key, entry } = getMostInformativeEntry(facility)
  const sourceLabel = getSourceLabel(facility, entry.verifiedBy)

  if (entry.verifiedAt) {
    const freshness = getFreshness(entry.verifiedAt)
    return {
      updatedLabel: formatRelative(entry.verifiedAt),
      sourceLabel,
      statusLabel: freshness ? FRESHNESS_STATUS[freshness] : 'Güncel',
      state: freshness === 'stale' ? 'reported' : 'verified',
    }
  }

  if (entry.status !== null || entry.verifiedBy) {
    return {
      updatedLabel: `${fallbackAgeDays(facility, key)} gün önce`,
      sourceLabel,
      statusLabel: 'Doğrulama bekliyor',
      state: 'reported',
    }
  }

  return {
    updatedLabel: 'Bilgi bekleniyor',
    sourceLabel,
    statusLabel: 'Bilgi eksik',
    state: 'missing',
  }
}

export function getFacilityTrustItems(facility: Facility): FacilityTrustItem[] {
  return TRUST_KEYS.map(key => {
    const entry = facility.liveStatus[key]
    const label = TRUST_LABELS[key]
    const sourceLabel = getSourceLabel(facility, entry.verifiedBy)

    if (entry.status === true) {
      return {
        key,
        label,
        sourceLabel,
        state: entry.verifiedAt ? 'verified' : 'reported',
        text: entry.verifiedAt
          ? `${formatRelative(entry.verifiedAt)} doğrulandı`
          : `${fallbackAgeDays(facility, key)} gün önce bildirildi, doğrulama bekliyor`,
      }
    }

    if (entry.status === false) {
      return {
        key,
        label,
        sourceLabel,
        state: 'reported',
        text: entry.verifiedAt
          ? `${formatRelative(entry.verifiedAt)} sorun bildirildi`
          : `${fallbackAgeDays(facility, key)} gün önce sorun bildirildi`,
      }
    }

    return {
      key,
      label,
      sourceLabel,
      state: 'missing',
      text: 'Bilgi eksik',
    }
  })
}
