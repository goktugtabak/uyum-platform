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
        'border transition-colors ' +
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-uyum-purple ' +
        (active
          ? 'bg-uyum-purple text-white border-uyum-purple hover:bg-uyum-blue'
          : 'bg-white/5 text-white/80 border-white/15 hover:bg-white/10 hover:border-white/30')
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
      <legend className="text-xs uppercase tracking-wider text-white/50 font-heading mr-1">
        {label}:
      </legend>
      {children}
    </fieldset>
  )
}
