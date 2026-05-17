interface FacilityPhotoAttributionProps {
  text: string
  className?: string
}

export function FacilityPhotoAttribution({ text, className = '' }: FacilityPhotoAttributionProps) {
  return (
    <small
      className={`block text-[11px] text-muted-foreground/70 leading-none ${className}`}
    >
      {text}
    </small>
  )
}
