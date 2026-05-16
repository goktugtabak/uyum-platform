import type { ReactNode } from 'react'

interface FilterChipProps {
  active:   boolean
  onClick:  () => void
  children: ReactNode
  ariaLabel?: string
  role?:    'radio' | 'button'
}

export function FilterChip({
  active,
  onClick,
  children,
  ariaLabel,
  role = 'button',
}: FilterChipProps) {
  const ariaProps = role === 'radio'
    ? { role: 'radio' as const, 'aria-checked': active }
    : { 'aria-pressed': active }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      {...ariaProps}
      className={
        'inline-flex items-center px-3 py-1.5 rounded-full text-xs font-body ' +
        'ring-1 transition-colors ' +
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ' +
        (active
          ? 'bg-primary text-primary-foreground ring-primary hover:bg-primary-deep hc:bg-black hc:text-white hc:ring-black'
          : 'bg-card text-foreground/80 ring-border/60 hover:ring-primary/40 hover:text-primary hc:bg-white hc:text-black hc:ring-black')
      }
    >
      {children}
    </button>
  )
}

interface FilterGroupProps {
  label:    string
  multi?:   boolean
  children: ReactNode
}

export function FilterGroup({ label, multi = false, children }: FilterGroupProps) {
  return (
    <fieldset
      className="flex flex-wrap items-center gap-2"
      role={multi ? 'group' : 'radiogroup'}
      aria-label={label}
    >
      <legend className="text-[11px] uppercase tracking-wider text-muted-foreground font-heading mr-2 hc:text-black">
        {label}:
      </legend>
      {children}
    </fieldset>
  )
}
