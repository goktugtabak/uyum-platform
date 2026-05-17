import { Bookmark } from 'lucide-react'
import { motion } from 'framer-motion'

interface Props {
  isBookmarked: boolean
  onToggle: () => void
  label: string        // e.g. "Eryaman Spor Merkezi"
  className?: string
}

export function BookmarkButton({ isBookmarked, onToggle, label, className = '' }: Props) {
  function handleClick() {
    onToggle()
    const region = document.getElementById('aria-live-region')
    if (region) {
      region.textContent = isBookmarked
        ? `${label} favorilerden kaldırıldı`
        : `${label} favorilere eklendi`
    }
  }

  return (
    <button
      type="button"
      aria-pressed={isBookmarked}
      aria-label={isBookmarked ? `${label} favorilerden kaldır` : `${label} favorilere ekle`}
      onClick={handleClick}
      className={`inline-flex items-center justify-center rounded-full p-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${
        isBookmarked
          ? 'bg-primary/10 text-primary hover:bg-primary/20'
          : 'bg-muted text-foreground/50 hover:bg-muted/80 hover:text-foreground'
      } ${className}`}
    >
      <motion.span
        key={isBookmarked ? 'on' : 'off'}
        initial={{ scale: 0.7 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        aria-hidden
      >
        <Bookmark
          className="size-4"
          fill={isBookmarked ? 'currentColor' : 'none'}
          aria-hidden
        />
      </motion.span>
    </button>
  )
}
