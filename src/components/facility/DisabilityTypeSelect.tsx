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
    <div className="flex items-center gap-2">
      <label
        htmlFor="disability-type"
        className="text-sm font-medium text-gray-700 hc:text-white whitespace-nowrap"
      >
        Engel türü:
      </label>
      <select
        id="disability-type"
        value={value}
        onChange={e => onChange(e.target.value as DisabilityType)}
        className={
          'rounded border border-gray-300 bg-white px-2 py-1 text-sm ' +
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-uyum-purple ' +
          'hc:border-white hc:bg-black hc:text-white'
        }
      >
        {OPTIONS.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
