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
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
        'focus-visible:ring-2 focus-visible:ring-offset-1',
        pressed
          ? 'bg-uyum-purple text-white'
          : 'bg-white/10 text-current hover:bg-white/20',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
      ].join(' ')}
    >
      {children ?? label}
    </button>
  )
}
