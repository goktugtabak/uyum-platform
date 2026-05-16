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
    <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-white/10 bg-uyum-dark hc:border-white">
      {/* Disability type selector */}
      <label className="flex items-center gap-2">
        <span className="text-xs font-body text-white/60 whitespace-nowrap hc:text-white">
          Engel tipi:
        </span>
        <select
          value={disabilityType}
          onChange={e => onDisabilityChange(e.target.value as DisabilityType)}
          aria-label="Engel tipi seç"
          className="
            text-xs font-body bg-white/10 border border-white/20 rounded-md
            px-2 py-1 text-white
            focus-visible:ring-2 focus-visible:ring-uyum-purple focus-visible:outline-none
            hc:bg-black hc:border-white hc:text-white
          "
        >
          {DISABILITY_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value} className="bg-uyum-dark text-white">
              {label}
            </option>
          ))}
        </select>
      </label>

      {/* Active sport filter chip */}
      {sportFilter && (
        <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-uyum-purple/20 border border-uyum-purple/50 text-xs font-body text-white">
          Spor: {getSportLabel(sportFilter)}
          <button
            onClick={onClearSport}
            aria-label={`${getSportLabel(sportFilter)} spor filtresini kaldır`}
            className="ml-1 rounded-full hover:bg-white/20 focus-visible:ring-1 focus-visible:ring-white leading-none p-0.5"
          >
            ×
          </button>
        </span>
      )}

      {/* Reset link */}
      <button
        onClick={onReset}
        aria-label="Tüm filtreleri sıfırla"
        className="text-xs font-body text-white/50 hover:text-white underline focus-visible:ring-2 focus-visible:ring-uyum-purple rounded hc:text-white"
      >
        Filtreyi sıfırla
      </button>
    </div>
  )
}
