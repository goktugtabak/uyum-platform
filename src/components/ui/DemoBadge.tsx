type DemoBadgeProps = { className?: string }

export function DemoBadge({ className = '' }: DemoBadgeProps) {
  return (
    <span
      role="img"
      aria-label="Bu içerik demo verisidir, gerçek değildir"
      className={
        'inline-flex items-center px-2 py-0.5 rounded-full ' +
        'text-xs font-medium bg-amber-100 text-amber-900 border border-amber-300 ' +
        className
      }
    >
      DEMO VERİSİ
    </span>
  )
}
