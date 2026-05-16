import { Link, useLocation } from 'react-router-dom'
import {
  Home, MapPin, Sparkles, CalendarDays, Dumbbell, Users, GraduationCap,
  UserCircle2, Headphones,
} from 'lucide-react'
import { UyumLogo } from '../ui/UyumLogo'
import { AccessibilityToolbar } from '../a11y/AccessibilityToolbar'

const NAV = [
  { to: '/',           label: 'Ana Sayfa',           icon: Home },
  { to: '/map',        label: 'Tesisleri Keşfet',    icon: MapPin },
  { to: '/match',      label: 'Sporları Keşfet',     icon: Sparkles },
  { to: '/events',     label: 'Etkinlikler',         icon: CalendarDays },
  { to: '/exercises',  label: 'Egzersizler',         icon: Dumbbell },
  { to: '/community',  label: 'Topluluk',            icon: Users },
  { to: '/coaches',    label: 'Koçlar & Antrenörler', icon: GraduationCap },
  { to: '/profile',    label: 'Profilim',            icon: UserCircle2 },
] as const

export function Sidebar() {
  const { pathname } = useLocation()

  return (
    <aside
      aria-label="Ana navigasyon"
      className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-7 px-5 py-7 lg:flex"
    >
      <Link to="/" className="px-1" aria-label="UYUM Ana sayfa">
        <UyumLogo />
      </Link>

      <nav className="flex flex-col gap-1">
        {NAV.map(item => {
          const Icon = item.icon
          const active =
            pathname === item.to ||
            (item.to !== '/' && pathname.startsWith(item.to))
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={active ? 'page' : undefined}
              className={`group relative flex items-center gap-3 rounded-full px-4 py-2.5 text-sm transition-all hc:text-black ${
                active
                  ? 'bg-gradient-to-r from-primary/15 via-primary/8 to-transparent font-semibold text-primary hc:bg-black/10'
                  : 'font-medium text-foreground/65 hover:text-primary'
              }`}
            >
              {active && (
                <span
                  aria-hidden
                  className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-full bg-primary"
                />
              )}
              <Icon className="size-[18px]" strokeWidth={active ? 2.4 : 1.8} aria-hidden />
              <span>{item.label}</span>
              {active && (
                <span aria-hidden className="ml-auto size-1.5 rounded-full bg-primary" />
              )}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-4">
        <AccessibilityToolbar />
        <div className="flex items-center gap-3 rounded-2xl bg-mint/40 px-4 py-3 hc:bg-black/10">
          <span
            aria-hidden
            className="grid size-9 place-items-center rounded-full bg-mint text-mint-foreground"
          >
            <Headphones className="size-4" />
          </span>
          <div className="text-xs">
            <div className="font-semibold text-foreground">Yardıma mı ihtiyacın var?</div>
            <a
              href="mailto:hello@uyum.app"
              className="text-mint-foreground/90 underline-offset-2 hover:underline"
            >
              Bize ulaş
            </a>
          </div>
        </div>
      </div>
    </aside>
  )
}
