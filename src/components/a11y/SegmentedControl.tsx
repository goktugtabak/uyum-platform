import { useRef } from 'react'

interface Option<T extends string> {
  value: T
  label: string
  ariaLabel?: string
}

interface SegmentedControlProps<T extends string> {
  value: T
  options: Option<T>[]
  onChange: (next: T) => void
  groupLabel: string
}

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  groupLabel,
}: SegmentedControlProps<T>) {
  const groupRef = useRef<HTMLDivElement>(null)

  function handleKeyDown(e: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      next = (index + 1) % options.length
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      next = (index - 1 + options.length) % options.length
    } else {
      return
    }
    onChange(options[next].value)
    const buttons = groupRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]')
    buttons?.[next]?.focus()
  }

  return (
    <div
      ref={groupRef}
      role="radiogroup"
      aria-label={groupLabel}
      className="flex w-full rounded-full overflow-hidden bg-muted/60 ring-1 ring-border/50 hc:ring-black"
    >
      {options.map((opt, i) => {
        const selected = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={opt.ariaLabel ?? opt.label}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(opt.value)}
            onKeyDown={e => handleKeyDown(e, i)}
            className={[
              'flex-1 px-1.5 py-1.5 text-[10px] font-semibold text-center leading-tight transition-colors focus-visible:ring-2 focus-visible:ring-offset-0',
              selected
                ? 'bg-primary text-primary-foreground hc:bg-black hc:text-white'
                : 'text-foreground/75 hover:bg-card hc:text-black',
            ].join(' ')}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
