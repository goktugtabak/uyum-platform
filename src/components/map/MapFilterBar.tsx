import { SlidersHorizontal, ChevronDown, X } from 'lucide-react'
import { getSportLabel } from '../../lib/sport-icons'
import type { DisabilityType } from '../../types'

interface MapFilterBarProps {
  disabilityType:    DisabilityType
  sportFilter:       string | null
  onDisabilityChange: (dt: DisabilityType) => void
  onClearSport:      () => void
  onReset:           () => void
}

const DISABILITY_OPTIONS: { value: DisabilityType; label: string }[] = [
  { value: 'wheelchair', label: 'Tekerlekli Sandalye' },
  { value: 'visual',     label: 'Görme Engeli' },
  { value: 'hearing',    label: 'İşitme Engeli' },
  { value: 'upper_limb', label: 'Üst Ekstremite' },
]

export function MapFilterBar({
  disabilityType,
  sportFilter,
  onDisabilityChange,
  onClearSport,
  onReset,
}: MapFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3" role="group" aria-label="Harita filtreleri">
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-glow"
      >
        <SlidersHorizontal className="size-4" aria-hidden /> Filtrele
      </button>

      <label className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-2.5 text-sm font-medium text-foreground/85 ring-1 ring-border/60 hover:ring-primary/40 hc:bg-white hc:ring-black">
        <span className="text-[12px] text-muted-foreground hc:text-black">Engel tipi:</span>
        <select
          value={disabilityType}
          onChange={e => onDisabilityChange(e.target.value as DisabilityType)}
          aria-label="Engel tipi"
          className="bg-transparent text-sm font-semibold text-foreground outline-none hc:text-black"
        >
          {DISABILITY_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden />
      </label>

      {sportFilter && (
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
          {getSportLabel(sportFilter)}
          <button
            type="button"
            onClick={onClearSport}
            aria-label={`${getSportLabel(sportFilter)} filtresini kaldır`}
            className="grid size-4 place-items-center rounded-full bg-primary/20 hover:bg-primary/30"
          >
            <X className="size-3" aria-hidden />
          </button>
        </span>
      )}

      <button
        type="button"
        onClick={onReset}
        className="text-xs font-semibold text-muted-foreground underline-offset-2 hover:text-primary hover:underline"
      >
        Filtreleri temizle
      </button>
    </div>
  )
}
