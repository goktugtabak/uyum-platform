import type { ReactNode } from 'react'

interface ToggleProps {
  pressed: boolean
  label: string
  onPressedChange: (next: boolean) => void
  children?: ReactNode
  disabled?: boolean
}

export function Toggle({ pressed, label, onPressedChange, children, disabled = false }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={pressed}
      aria-label={label}
      disabled={disabled}
      onClick={() => onPressedChange(!pressed)}
      className={[
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-colors ring-1',
        'focus-visible:ring-2 focus-visible:ring-offset-1',
        pressed
          ? 'bg-primary text-primary-foreground ring-primary hc:bg-black hc:text-white hc:ring-black'
          : 'bg-muted/60 text-foreground/75 ring-border/50 hover:bg-card hc:bg-white hc:text-black hc:ring-black',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
      ].join(' ')}
    >
      {children ?? label}
    </button>
  )
}
