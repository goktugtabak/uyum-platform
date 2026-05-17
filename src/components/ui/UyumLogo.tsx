type Props = { className?: string; size?: number; textClassName?: string; iconClassName?: string }

export function UyumLogo({ className = '', size = 36, textClassName = 'text-primary-deep', iconClassName = '' }: Props) {
  return (
    <div className={`flex items-center gap-0 ${className}`}>
      <img 
        src="/images/uyumlogo.svg" 
        alt="Uyum Logo" 
        style={{ width: size * 3.4, height: size * 3.4, marginLeft: -size * 0.3, marginRight: -size * 1.1 }}
        className={`shrink-0 object-contain ${iconClassName}`}
        aria-hidden="true"
      />
      <span 
        className={`font-extrabold tracking-tight translate-y-[1px] ${textClassName}`}
        style={{ fontSize: Math.max(20, size * 0.9) }}
      >
        UYUM
      </span>
    </div>
  )
}
