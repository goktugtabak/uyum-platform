import { Link, useNavigate } from 'react-router-dom'
import {
  Activity, ArrowRight, Calendar, MapPin, Menu, Play, User, Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useProfile } from '../contexts/ProfileContext'

function UyumLogo() {
  return (
    <svg width={40} height={44} viewBox="0 0 40 44" fill="none" aria-hidden>
      <ellipse cx={16} cy={22} rx={10} ry={18} fill="#DDFBD2" transform="rotate(-15 16 22)" />
      <ellipse cx={24} cy={22} rx={10} ry={18} fill="#4C2A85" opacity={0.9} transform="rotate(15 24 22)" />
    </svg>
  )
}

function ArcUnderline({ color = '#4C2A85', width = 200 }: { color?: string; width?: number }) {
  return (
    <svg width={width} height={12} viewBox={`0 0 ${width} 12`} fill="none" aria-hidden>
      <path
        d={`M 4 8 Q ${width / 2} 0 ${width - 4} 8`}
        stroke={color}
        strokeWidth={6}
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

function Navbar({ onPrimary }: { onPrimary: () => void }) {
  const links: Array<{ label: string; to: string }> = [
    { label: 'Tesisler',    to: '/map'      },
    { label: 'Sporlar',     to: '/match'    },
    { label: 'Etkinlikler', to: '/events'   },
    { label: 'Koçlar',      to: '/coaches'  },
    { label: 'Hakkımızda',  to: '#hakkimizda' },
  ]
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2" aria-label="UYUM Ana sayfa">
          <UyumLogo />
          <span className="text-xl font-bold text-[#320E3B]">UYUM</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {links.map(({ label, to }) =>
            to.startsWith('#') ? (
              <a key={label} href={to} className="text-sm text-gray-500 hover:text-[#320E3B] transition-colors">
                {label}
              </a>
            ) : (
              <Link key={label} to={to} className="text-sm text-gray-500 hover:text-[#320E3B] transition-colors">
                {label}
              </Link>
            ),
          )}
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onPrimary}
            className="text-sm text-[#320E3B] hover:opacity-80 transition-opacity"
          >
            Giriş yap
          </button>
          <button
            type="button"
            aria-label="Menü"
            onClick={onPrimary}
            className="w-10 h-10 rounded-full bg-[#320E3B] flex items-center justify-center hover:opacity-90 transition-opacity"
          >
            <Menu className="w-5 h-5 text-white" aria-hidden />
          </button>
        </div>
      </div>
    </nav>
  )
}

function HeroSection({ onPrimary, onSecondary }: { onPrimary: () => void; onSecondary: () => void }) {
  return (
    <div className="bg-[#f8f7f7]">
      <section className="max-w-7xl mx-auto flex items-stretch min-h-[580px]">
        <div className="w-[38%] flex-shrink-0 flex flex-col justify-center py-16 pl-6 pr-10">
          <div className="mb-6">
            <h1 className="text-6xl font-extrabold text-[#320E3B] leading-tight uppercase">
              HAREKET
              <br />
              HERKES İÇİN.
            </h1>
            <h2 className="text-6xl font-extrabold text-[#6B7FD7] leading-tight uppercase mt-1">
              UYUM
              <br />
              SENİN İÇİN.
            </h2>
            <div className="mt-3">
              <ArcUnderline width={260} />
            </div>
          </div>
          <p className="text-base text-gray-500 max-w-sm mb-8 leading-relaxed">
            Engel tanımayan bir spor deneyimi için doğru tesisleri, sporları ve insanları bir araya getiriyoruz.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={onPrimary}
              className="flex items-center gap-2 bg-[#320E3B] text-white rounded-full px-6 py-3 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <ArrowRight className="w-4 h-4" aria-hidden />
              YAKININDAKİ TESİSLERİ KEŞFET
            </button>
            <button
              type="button"
              onClick={onSecondary}
              className="flex items-center gap-2 border border-[#320E3B] text-[#320E3B] rounded-full px-6 py-3 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <Play className="w-4 h-4" aria-hidden />
              NASIL ÇALIŞIR?
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-end">
          <img
            src="/hero-image.png"
            alt="UYUM ile spor yapan adaptif sporcular"
            className="w-full block"
          />
        </div>
      </section>
    </div>
  )
}

type Feature = {
  label: string
  desc: string
  icon: LucideIcon
  iconColor: string
  bgColor: string
  to: string
}

const features: Feature[] = [
  { label: 'Tesisleri keşfet',   desc: 'Erişilebilir tesisleri bul',     icon: MapPin,   iconColor: '#00BCD4', bgColor: '#E0F7FA', to: '/map'       },
  { label: 'Sporları keşfet',    desc: 'Sana uygun sporları keşfet',     icon: Activity, iconColor: '#43A047', bgColor: '#E8F5E9', to: '/match'     },
  { label: 'Etkinliklere katıl', desc: 'Yakındaki etkinliklere katıl',   icon: Calendar, iconColor: '#7B2FBE', bgColor: '#F3E5F5', to: '/events'    },
  { label: 'Koçlarla tanış',     desc: 'Uzman koçlarla çalış',           icon: User,     iconColor: '#FF6B35', bgColor: '#FFF3E0', to: '/coaches'   },
  { label: 'Topluluğa katıl',    desc: 'Spor topluluğuna dahil ol',      icon: Users,    iconColor: '#00897B', bgColor: '#E0F2F1', to: '/community' },
]

function FeaturesSection() {
  return (
    <section id="hakkimizda" className="max-w-7xl mx-auto px-6 py-16">
      <div className="flex gap-16 items-start flex-wrap lg:flex-nowrap">
        <div className="w-64 flex-shrink-0">
          <h2 className="text-3xl font-extrabold text-[#320E3B] max-w-[200px] leading-tight uppercase">
            UYUM İLE NELER YAPABİLİRSİN?
          </h2>
          <div className="mt-3">
            <ArcUnderline color="#4C2A85" width={180} />
          </div>
        </div>
        <div className="flex-1 flex gap-8 flex-wrap">
          {features.map(({ label, desc, icon: Icon, iconColor, bgColor, to }) => (
            <Link
              key={label}
              to={to}
              className="group flex flex-col items-center text-center gap-3 w-28 transition hover:-translate-y-0.5"
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: bgColor }}
              >
                <Icon className="w-7 h-7" style={{ color: iconColor }} aria-hidden />
              </div>
              <div>
                <p className="text-sm font-bold text-[#320E3B]">{label}</p>
                <p className="text-xs text-gray-500 mt-1">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-8 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <UyumLogo />
          <span className="font-bold text-[#320E3B]">UYUM</span>
        </div>
        <p>© 2026 UYUM — METU Sports Tech Hackathon</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-[#320E3B]">KVKK</a>
          <a href="#" className="hover:text-[#320E3B]">Erişilebilirlik</a>
          <a href="#" className="hover:text-[#320E3B]">İletişim</a>
        </div>
      </div>
    </footer>
  )
}

export function Landing() {
  const navigate = useNavigate()
  const { hasProfile } = useProfile()

  const handlePrimary = () => navigate(hasProfile ? '/dashboard' : '/onboarding')
  const handleSecondary = () => navigate('/map')

  return (
    <div className="min-h-screen bg-white">
      <Navbar onPrimary={handlePrimary} />
      <HeroSection onPrimary={handlePrimary} onSecondary={handleSecondary} />
      <FeaturesSection />
      <Footer />
    </div>
  )
}
