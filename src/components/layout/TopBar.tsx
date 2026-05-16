import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import {
  Search, MapPin, ChevronDown, Accessibility, Bell, Menu, X,
  Home, Sparkles, CalendarDays, Dumbbell, Users, GraduationCap, UserCircle2,
} from 'lucide-react'
import { UyumLogo } from '../ui/UyumLogo'
import { AccessibilityToolbar } from '../a11y/AccessibilityToolbar'
import { useProfile } from '../../contexts/ProfileContext'

const DISABILITY_LABELS: Record<string, string> = {
  wheelchair: 'Tekerlekli Sandalye',
  visual:     'Görme',
  hearing:    'İşitme',
  upper_limb: 'Üst Ekstremite',
}

const MOBILE_NAV = [
  { to: '/',           label: 'Ana Sayfa',           icon: Home },
  { to: '/map',        label: 'Tesisleri Keşfet',    icon: MapPin },
  { to: '/match',      label: 'Sporları Keşfet',     icon: Sparkles },
  { to: '/events',     label: 'Etkinlikler',         icon: CalendarDays },
  { to: '/exercises',  label: 'Egzersizler',         icon: Dumbbell },
  { to: '/community',  label: 'Topluluk',            icon: Users },
  { to: '/coaches',    label: 'Koçlar',              icon: GraduationCap },
  { to: '/profile',    label: 'Profilim',            icon: UserCircle2 },
] as const

export function TopBar() {
  const { profile } = useProfile()
  const [showA11y, setShowA11y] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const a11yRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (a11yRef.current && !a11yRef.current.contains(e.target as Node)) {
        setShowA11y(false)
      }
    }
    if (showA11y) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showA11y])

  return (
    <header
      className="sticky top-0 z-30 flex items-center gap-3 border-b border-gray-100 bg-white px-4 py-4 md:px-6 lg:px-12"
      role="banner"
    >
      {/* Mobile menu */}
      <button
        type="button"
        aria-label="Menü"
        aria-expanded={showMenu}
        onClick={() => setShowMenu(v => !v)}
        className="grid size-11 place-items-center rounded-full border border-gray-100 bg-white text-[#320E3B] hover:bg-gray-50 lg:hidden"
      >
        {showMenu ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
      </button>

      <Link to="/" className="flex items-center gap-2 lg:hidden" aria-label="UYUM Ana Sayfa">
        <UyumLogo size={28} />
        <span className="text-lg font-bold text-[#320E3B]">UYUM</span>
      </Link>

      <div className="ml-auto flex items-center gap-2.5 lg:ml-0 lg:flex-1">
        <div className="relative hidden max-w-md flex-1 sm:block">
          <Search
            aria-hidden
            className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-gray-400"
          />
          <input
            type="search"
            placeholder="Tesis, spor, etkinlik ara"
            aria-label="Site içinde ara"
            className="h-11 w-full rounded-full border border-gray-100 bg-white pl-11 pr-4 text-sm text-[#320E3B] outline-none transition focus:border-[#320E3B] hc:bg-white hc:border-black"
          />
        </div>
      </div>

      {profile && (
        <button
          type="button"
          className="hidden h-11 items-center gap-2 rounded-full border border-gray-100 bg-white px-4 text-sm font-medium text-[#320E3B] hover:border-[#320E3B] sm:flex hc:bg-white hc:border-black"
        >
          <MapPin aria-hidden className="size-4 text-[#320E3B]" />
          <span>{profile.city}</span>
          <ChevronDown aria-hidden className="size-3.5 text-gray-400" />
        </button>
      )}

      <div ref={a11yRef} className="relative">
        <button
          type="button"
          aria-label="Erişilebilirlik araçları"
          aria-expanded={showA11y}
          aria-haspopup="dialog"
          onClick={() => setShowA11y(v => !v)}
          className={`grid h-11 w-11 place-items-center rounded-full text-white transition ${
            showA11y ? 'bg-[#4C2A85]' : 'bg-[#320E3B] hover:opacity-90'
          }`}
        >
          <Accessibility className="size-5" aria-hidden />
        </button>
        {showA11y && (
          <div
            role="dialog"
            aria-label="Erişilebilirlik panel"
            className="absolute right-0 top-full z-40 mt-2 w-[min(22rem,calc(100vw-2rem))]"
          >
            <AccessibilityToolbar />
          </div>
        )}
      </div>

      <Link
        to="/profile"
        aria-label="Bildirimler"
        className="relative grid h-11 w-11 place-items-center rounded-full border border-gray-100 bg-white text-[#320E3B] hover:border-[#320E3B] hc:bg-white hc:border-black"
      >
        <Bell aria-hidden className="size-[18px]" />
        <span aria-hidden className="absolute right-3 top-3 size-2 rounded-full bg-red-500 ring-2 ring-white" />
      </Link>

      {profile && (
        <Link
          to="/profile"
          aria-label="Profilim"
          className="hidden h-11 items-center gap-2 rounded-full border border-gray-100 bg-white pl-1 pr-3 hover:border-[#320E3B] sm:flex hc:bg-white hc:border-black"
        >
          <span
            aria-hidden
            className="grid size-9 place-items-center rounded-full bg-[#320E3B] text-sm font-bold text-white"
          >
            {DISABILITY_LABELS[profile.disabilityType]?.[0] ?? 'U'}
          </span>
          <span className="text-sm font-semibold text-[#320E3B]">
            {DISABILITY_LABELS[profile.disabilityType]}
          </span>
          <ChevronDown aria-hidden className="size-3.5 text-gray-400" />
        </Link>
      )}

      {/* Mobile menu drawer */}
      {showMenu && (
        <div
          role="dialog"
          aria-label="Mobil menü"
          className="absolute left-0 right-0 top-full mt-1 mx-3 rounded-3xl border border-gray-100 bg-white p-3 shadow-lg lg:hidden"
        >
          <ul className="flex flex-col gap-0.5">
            {MOBILE_NAV.map(item => {
              const Icon = item.icon
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={() => setShowMenu(false)}
                    className="flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium text-gray-500 hover:bg-[#320E3B] hover:text-white"
                  >
                    <Icon aria-hidden className="size-[18px]" />
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </header>
  )
}
