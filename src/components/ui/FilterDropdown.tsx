import { useEffect, useRef } from 'react'
import { ChevronDown } from 'lucide-react'

export interface DropdownOption { value: string; label: string }

interface Props {
  label:    string
  value:    string
  options:  DropdownOption[]
  onChange: (next: string) => void
  open:     boolean
  onToggle: () => void
}

export function FilterDropdown({
  label, value, options, onChange, open, onToggle,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onToggle()
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open, onToggle])

  const current = options.find(o => o.value === value)?.label ?? 'Tümü'

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={onToggle}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded-xl bg-card px-2 py-1.5 text-left ring-1 ring-border/50 hover:ring-primary/30"
      >
        <span>
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
          <span className="block text-xs font-bold text-foreground">{current}</span>
        </span>
        <ChevronDown
          className={`size-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label={label}
          className="absolute left-0 right-0 top-full z-30 mt-1 max-h-64 overflow-y-auto rounded-xl bg-card p-1 shadow-card ring-1 ring-border/40"
        >
          {options.map(o => {
            const active = o.value === value
            return (
              <li key={o.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => { onChange(o.value); onToggle() }}
                  className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs transition ${
                    active ? 'bg-primary text-primary-foreground font-bold' : 'text-foreground hover:bg-muted'
                  }`}
                >
                  {o.label}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
