import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'

export interface DropdownOption { value: string; label: string }

type DropdownPlacement = 'top' | 'bottom'

interface Props {
  label:    string
  value:    string
  options:  DropdownOption[]
  onChange: (next: string) => void
  open:     boolean
  onToggle: () => void
  maxVisibleOptions?: number
  /** Pill genişliğini dışarıdan sabitleme (ör. 'w-40') */
  className?: string
}

export function FilterDropdown({
  label, value, options, onChange, open, onToggle, maxVisibleOptions = 6, className = '',
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [placement, setPlacement] = useState<DropdownPlacement>('bottom')
  const [listMaxHeight, setListMaxHeight] = useState('14.6rem')

  useEffect(() => {
    if (!open) return
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onToggle()
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open, onToggle])

  useEffect(() => {
    if (!open) return

    function updateMenuBounds() {
      if (!ref.current) return

      const viewportPadding = 12
      const menuGap = 6
      const optionHeight = 37.6
      const maxByCount = Math.max(1, maxVisibleOptions) * optionHeight + 8
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
  }, [open, maxVisibleOptions])

  const current = options.find(o => o.value === value)?.label ?? options[0]?.label ?? '—'

  return (
    <div className={`relative inline-block ${className}`} ref={ref}>
      {/* Trigger — pill, referans DisabilityTypeSelect ile birebir aynı stil */}
      <button
        type="button"
        onClick={onToggle}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center gap-1.5 rounded-full border border-border/50 bg-background px-3 py-1.5 text-sm text-foreground transition-colors hover:border-primary/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary hc:border-black hc:bg-white"
      >
        <span className="min-w-0 flex-1 text-left">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground leading-none mb-0.5 hc:text-black">
            {label}
          </span>
          <span className="block truncate text-[13px] font-medium text-foreground hc:text-black">
            {current}
          </span>
        </span>
        <ChevronDown
          className={`size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      {/* Dropdown listesi — viewport içinde kalır; scrollbar panel yüksekliğine oturur */}
      {open && (
        <div
          className={`absolute left-0 z-40 min-w-full overflow-hidden rounded-2xl bg-background shadow-lg ring-1 ring-border/40 hc:ring-black ${
            placement === 'top' ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          }`}
        >
          <ul
            role="listbox"
            aria-label={label}
            className="overflow-y-auto overscroll-contain [scrollbar-gutter:stable]"
            style={{ maxHeight: listMaxHeight }}
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
                    className={`flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-[13px] transition-colors ${
                      active
                        ? 'bg-primary/8 font-semibold text-primary'
                        : 'text-foreground hover:bg-muted'
                    } hc:text-black`}
                  >
                    <span className="truncate">{o.label}</span>
                    {active && <Check className="size-3.5 shrink-0 text-primary" aria-hidden />}
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
