import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

/**
 * BackButton — navigates to the previous history entry.
 * Shows a short black tooltip bar on hover to signal interactivity.
 */
export function BackButton({ className = '' }: { className?: string }) {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      onClick={() => navigate(-1)}
      className={`group relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-foreground/70 ring-1 ring-border/50 transition hover:text-primary hover:ring-primary/30 ${className}`}
      aria-label="Geri git"
    >

      <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" aria-hidden />
      Geri
    </button>
  )
}
