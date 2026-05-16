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
        className="inline-block w-8 h-8 rounded-full border-2 border-white/20 border-t-uyum-purple animate-spin hc:border-white/40 hc:border-t-white"
      />
      {label && (
        <p className="text-xs font-body text-white/60 hc:text-white">{label}</p>
      )}
    </div>
  )
}
