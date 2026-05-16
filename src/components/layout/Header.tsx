import { Link } from 'react-router-dom'
import { AccessibilityToolbar } from '../a11y/AccessibilityToolbar'
import { useProfile } from '../../contexts/ProfileContext'

const DISABILITY_LABELS: Record<string, string> = {
  wheelchair:  'Tekerlekli Sandalye',
  visual:      'Görme',
  hearing:     'İşitme',
  upper_limb:  'Üst Ekstremite',
}

export function Header() {
  const { profile } = useProfile()

  return (
    <header className="sticky top-0 z-40 bg-uyum-dark text-white">
      <div className="flex flex-wrap items-center gap-2 px-4 py-2">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <Link
            to="/"
            className="font-heading text-xl font-bold text-white hover:text-uyum-frost-mint transition-colors"
            aria-label="UYUM — Ana sayfaya git"
          >
            UYUM
          </Link>
          {profile && (
            <span className="text-xs text-white/60 hidden sm:inline truncate">
              {DISABILITY_LABELS[profile.disabilityType]} · {profile.city}
            </span>
          )}
        </div>
        <AccessibilityToolbar />
      </div>
    </header>
  )
}
