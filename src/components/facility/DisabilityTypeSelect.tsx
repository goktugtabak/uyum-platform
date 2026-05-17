import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import type { DisabilityType } from '../../types'

type DropdownPlacement = 'top' | 'bottom'

const OPTIONS: { value: DisabilityType; label: string; icon: string; bg: string }[] = [
  { value: 'wheelchair', label: 'Tekerlekli Sandalye', icon: '♿', bg: 'bg-violet-100' },
  { value: 'visual',     label: 'Görme',               icon: '👁',  bg: 'bg-sky-100'   },
  { value: 'hearing',    label: 'İşitme',              icon: '🦻', bg: 'bg-teal-100'  },
  { value: 'upper_limb', label: 'Üst Ekstremite',      icon: '🤚', bg: 'bg-amber-100' },
]

const MAX_VISIBLE_OPTIONS = 6

interface Props {
  value: DisabilityType
  onChange: (v: DisabilityType) => void
}

export function DisabilityTypeSelect({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [placement, setPlacement] = useState<DropdownPlacement>('bottom')
  const [listMaxHeight, setListMaxHeight] = useState('14.6rem')
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

  useEffect(() => {
    if (!open) return

    function updateMenuBounds() {
      if (!ref.current) return

      const viewportPadding = 12
      const menuGap = 6
      const optionHeight = 37.6
      const maxByCount = MAX_VISIBLE_OPTIONS * optionHeight + 8
      const rect = ref.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom - viewportPadding - menuGap
      const spaceAbove = rect.top - viewportPadding - menuGap
      const nextPlacement = spaceBelow >= Math.min(maxByCount, 160) || spaceBelow >= spaceAbove
        ? 'bottom'
        : 'top'
      const availableSpace = Math.max(1, nextPlacement === 'bottom' ? spaceBelow : spaceAbove)

      setPlacement(nextPlacement)
      setListMaxHeight(`${Math.min(maxByCount, availableSpace)}px`)
    }

    updateMenuBounds()
    window.addEventListener('resize', updateMenuBounds)
    window.addEventListener('scroll', updateMenuBounds, true)

    return () => {
      window.removeEventListener('resize', updateMenuBounds)
      window.removeEventListener('scroll', updateMenuBounds, true)
    }
  }, [open])

  return (
    <div ref={ref} className="relative inline-block">
      {/* Trigger — pill, FilterDropdown ile birebir aynı stil */}
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Engel türü: ${selected.label}`}
        className="flex items-center gap-1.5 rounded-full border border-border/50 bg-background px-3 py-1.5 text-sm text-foreground transition-colors hover:border-primary/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary hc:border-black hc:bg-white"
      >
        <span className={`flex size-5 items-center justify-center rounded-full text-xs ${selected.bg}`} aria-hidden>
          {selected.icon}
        </span>
        <span className="min-w-0 flex-1 text-left">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground leading-none mb-0.5 hc:text-black">
            Engel türü
          </span>
          <span className="block truncate text-[13px] font-medium text-foreground hc:text-black">
            {selected.label}
          </span>
        </span>
        <ChevronDown
          className={`size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      {/* Aşağı/yukarı açılan liste; scrollbar panel yüksekliğine oturur */}
      {open && (
        <div
          className={`absolute left-0 z-40 min-w-full overflow-hidden rounded-2xl bg-background shadow-lg ring-1 ring-border/40 hc:ring-black ${
            placement === 'top' ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          }`}
        >
          <ul
            role="listbox"
            aria-label="Engel türü seçenekleri"
            className="overflow-y-auto overscroll-contain [scrollbar-gutter:stable]"
            style={{ maxHeight: listMaxHeight }}
          >
            {OPTIONS.map(opt => {
              const sel = opt.value === value
              return (
                <li key={opt.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={sel}
                    onClick={() => { onChange(opt.value); setOpen(false) }}
                    className={`flex w-full items-center gap-3 px-4 py-2 text-left text-[13px] transition-colors ${
                      sel
                        ? 'bg-primary/8 font-semibold text-primary'
                        : 'text-foreground hover:bg-muted'
                    } hc:text-black`}
                  >
                    <span className={`flex size-6 shrink-0 items-center justify-center rounded-full text-sm ${opt.bg}`} aria-hidden>
                      {opt.icon}
                    </span>
                    <span className="flex-1 truncate">{opt.label}</span>
                    {sel && <Check className="size-3.5 shrink-0 text-primary" aria-hidden />}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
