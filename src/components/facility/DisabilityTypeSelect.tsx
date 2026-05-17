import { ChevronDown } from 'lucide-react'
import type { DisabilityType } from '../../types'

const OPTIONS: { value: DisabilityType; label: string }[] = [
  { value: 'wheelchair', label: 'Tekerlekli Sandalye' },
  { value: 'upper_limb', label: 'Üst Ekstremite' },
  { value: 'visual',     label: 'Görme Engelli' },
  { value: 'hearing',    label: 'İşitme Engelli' },
]

interface Props {
  value: DisabilityType
  onChange: (v: DisabilityType) => void
}

export function DisabilityTypeSelect({ value, onChange }: Props) {
  const selectedLabel = OPTIONS.find(o => o.value === value)?.label ?? value

  return (
    <div className="relative inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 ring-1 ring-border/60 hover:ring-primary/40 hc:bg-white hc:ring-black">
      <span className="pointer-events-none text-[12px] font-medium text-muted-foreground hc:text-black">
        Engel türü:
      </span>
      <span className="pointer-events-none text-sm font-semibold text-foreground hc:text-black">
        {selectedLabel}
      </span>
      <ChevronDown className="pointer-events-none size-3.5 text-muted-foreground" aria-hidden />
      {/* Native select görünmez, tüm alanı kaplar — erişilebilirlik korunur */}
      <select
        value={value}
        onChange={e => onChange(e.target.value as DisabilityType)}
        aria-label="Engel türü seçimi"
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {OPTIONS.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}
