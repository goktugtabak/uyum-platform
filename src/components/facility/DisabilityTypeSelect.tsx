import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import type { DisabilityType } from '../../types'

const OPTIONS: { value: DisabilityType; label: string; icon: string; bg: string }[] = [
  { value: 'wheelchair', label: 'Tekerlekli Sandalye', icon: '♿', bg: 'bg-violet-100' },
  { value: 'visual',     label: 'Görme',               icon: '👁',  bg: 'bg-sky-100'    },
  { value: 'hearing',    label: 'İşitme',              icon: '🦻', bg: 'bg-teal-100'   },
  { value: 'upper_limb', label: 'Üst Ekstremite',      icon: '🤚', bg: 'bg-amber-100'  },
]

interface Props {
  value: DisabilityType
  onChange: (v: DisabilityType) => void
}

export function DisabilityTypeSelect({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = OPTIONS.find(o => o.value === value) ?? OPTIONS[0]

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} className="relative inline-block">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Engel türü: ${selected.label}`}
        className="flex items-center gap-1.5 rounded-full border border-border/50 bg-background px-2.5 py-1.5 text-sm text-foreground hover:border-primary/40 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
      >
        <span className={`flex size-5 items-center justify-center rounded-full text-xs ${selected.bg}`}>
          {selected.icon}
        </span>
        <span className="font-medium">{selected.label}</span>
        <ChevronDown className={`size-3 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>

      {/* 2×2 grid */}
      {open && (
        <div
          role="listbox"
          aria-label="Engel türü seçenekleri"
          className="absolute left-full top-0 z-50 ml-2 grid grid-cols-2 gap-2 rounded-2xl bg-white p-2.5 shadow-lg ring-1 ring-border/30 w-52"
        >
          {OPTIONS.map(opt => {
            const sel = opt.value === value
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={sel}
                onClick={() => { onChange(opt.value); setOpen(false) }}
                className={`flex flex-col items-center gap-2 rounded-xl px-2 py-3 text-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${
                  sel ? 'bg-primary/10 ring-1 ring-primary/40' : 'hover:bg-muted/50'
                }`}
              >
                <span className={`flex size-9 items-center justify-center rounded-full text-xl ${opt.bg}`}>
                  {opt.icon}
                </span>
                <span className={`text-xs font-semibold leading-tight ${sel ? 'text-primary' : 'text-foreground'}`}>
                  {opt.label}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
