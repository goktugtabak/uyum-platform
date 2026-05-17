import { X } from 'lucide-react'

interface Props {
  label:    string
  onRemove: () => void
}

export function ActiveFilterChip({ label, onRemove }: Props) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`${label} filtresini kaldır`}
        className="rounded-full p-0.5 hover:bg-primary/20"
      >
        <X className="size-3" aria-hidden />
      </button>
    </span>
  )
}
