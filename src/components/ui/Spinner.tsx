interface Props {
  label?: string
  className?: string
}

export function Spinner({ label, className = '' }: Props) {
  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <span
        role="status"
        aria-label={label ?? 'Yükleniyor'}
        className="inline-block w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin hc:border-black/30 hc:border-t-black"
      />
      {label && (
        <p className="text-xs font-body text-muted-foreground hc:text-black">{label}</p>
      )}
    </div>
  )
}
