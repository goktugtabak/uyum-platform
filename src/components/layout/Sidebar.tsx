import { Link, useLocation } from 'react-router-dom'
import {
  Home, MapPin, Sparkles, CalendarDays, Dumbbell, GraduationCap,
  UserCircle2, Headphones,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { UyumLogo } from '../ui/UyumLogo'

const NAV = [
  { to: '/',           label: 'Ana Sayfa',            icon: Home },
  { to: '/map',        label: 'Tesisleri Keşfet',     icon: MapPin },
  { to: '/match',      label: 'Sporları Keşfet',      icon: Sparkles },
  { to: '/events',     label: 'Etkinlikler',           icon: CalendarDays },
  { to: '/exercises',  label: 'Egzersizler',           icon: Dumbbell },
  { to: '/coaches',    label: 'Koçlar & Antrenörler',  icon: GraduationCap },
  { to: '/profile',    label: 'Profilim',              icon: UserCircle2 },
] as const

export function Sidebar() {
  const { pathname } = useLocation()

  return (
    <aside
      aria-label="Ana navigasyon"
      className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-gray-100 bg-white px-5 py-7 lg:flex"
    >
      <Link to="/" className="px-1 shrink-0" aria-label="UYUM Ana sayfa">
        <UyumLogo />
      </Link>

      <nav className="mt-7 flex flex-col gap-1">
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
              className={`group relative flex items-center gap-3 rounded-full px-4 py-2.5 text-sm transition-colors hc:text-black ${
                active
                  ? 'font-semibold text-white hc:text-white'
                  : 'font-medium text-gray-500 hover:bg-gray-50 hover:text-primary-deep'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active-indicator"
                  className="absolute inset-0 rounded-full bg-primary-deep hc:bg-black"
                  transition={{ type: 'spring', stiffness: 380, damping: 36 }}
                  aria-hidden
                />
              )}
              <Icon className="relative z-10 size-[18px]" strokeWidth={active ? 2.4 : 1.8} aria-hidden />
              <span className="relative z-10">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-4 pt-4">
        <div className="flex items-center gap-3 rounded-2xl bg-sky/30 px-4 py-3 hc:bg-black/10">
          <span
            aria-hidden
            className="grid size-9 shrink-0 place-items-center rounded-full bg-sky-foreground text-white"
          >
            <Headphones className="size-4" />
          </span>
          <div className="text-xs">
            <div className="font-semibold text-primary-deep">Yardıma mı ihtiyacın var?</div>
            <a
              href="mailto:hello@uyum.app"
              className="text-primary-deep/80 underline-offset-2 hover:underline"
            >
              Bize ulaş
            </a>
          </div>
        </div>
      </div>
    </aside>
  )
}
