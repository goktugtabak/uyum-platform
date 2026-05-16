type DemoBadgeProps = { className?: string; label?: string }

export function DemoBadge({ className = '', label }: DemoBadgeProps) {
  const ariaLabel = label
    ? `Bu içerik demo verisidir, gerçek değildir — ${label}`
    : 'Bu içerik demo verisidir, gerçek değildir'

  return (
    <span
      role="img"
      aria-label={ariaLabel}
      className={
        'inline-flex items-center px-2 py-0.5 rounded-full ' +
        'text-xs font-medium bg-amber-100 text-amber-900 border border-amber-300 ' +
        className
      }
    >
      {label ? `DEMO VERİSİ — ${label}` : 'DEMO VERİSİ'}
    </span>
  )
}
