type Props = { className?: string; size?: number }

export function UyumLogo({ className = '', size = 36 }: Props) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 36 36" fill="none" aria-hidden>
        <defs>
          <linearGradient id="uyum-logo-gradient" x1="0" y1="0" x2="36" y2="36">
            <stop offset="0" stopColor="oklch(0.38 0.16 295)" />
            <stop offset="1" stopColor="oklch(0.68 0.13 270)" />
          </linearGradient>
        </defs>
        <path
          d="M8 6 C 8 18, 8 24, 18 28 C 28 24, 28 18, 28 6"
          stroke="url(#uyum-logo-gradient)"
          strokeWidth="4.5"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="28" cy="6" r="3" fill="oklch(0.94 0.08 145)" />
        <circle cx="8"  cy="6" r="3" fill="oklch(0.93 0.06 215)" />
      </svg>
      <span className="font-display text-2xl font-bold tracking-tight text-primary-deep">
        UYUM
      </span>
    </div>
  )
}
