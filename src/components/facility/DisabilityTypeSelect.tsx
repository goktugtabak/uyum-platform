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
  return (
    <label className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm font-medium text-foreground/85 ring-1 ring-border/60 hover:ring-primary/40 hc:bg-white hc:ring-black">
      <span className="text-[12px] text-muted-foreground hc:text-black">Engel türü:</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value as DisabilityType)}
        aria-label="Engel türü"
        className="bg-transparent text-sm font-semibold outline-none hc:text-black"
      >
        {OPTIONS.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden />
    </label>
  )
}
