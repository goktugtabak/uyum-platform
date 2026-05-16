import { Activity, ArrowRight, Calendar, MapPin, Menu, Play, User, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

function UyumLogo() {
  return (
    <svg width="40" height="44" viewBox="0 0 40 44" fill="none">
      {/* Left leaf — frost mint, tilted left */}
      <ellipse cx="16" cy="22" rx="10" ry="18" fill="#DDFBD2" transform="rotate(-15 16 22)" />
      {/* Right leaf — indigo velvet, tilted right */}
      <ellipse cx="24" cy="22" rx="10" ry="18" fill="#4C2A85" opacity="0.9" transform="rotate(15 24 22)" />
    </svg>
  )
}

function ArcUnderline({ color = '#4C2A85', width = 200 }: { color?: string; width?: number }) {
  return (
    <svg width={width} height="12" viewBox={`0 0 ${width} 12`} fill="none">
      <path
        d={`M 4 8 Q ${width / 2} 0 ${width - 4} 8`}
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UyumLogo />
          <span className="text-xl font-bold font-heading text-[#320E3B]">UYUM</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {['Tesisler', 'Sporlar', 'Etkinlikler', 'Koçlar', 'Hakkımızda'].map((link) => (
            <a key={link} href="#" className="text-sm text-gray-500 hover:text-[#320E3B] transition-colors">
              {link}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <a href="#" className="text-sm text-[#320E3B]">
            Giriş yap
          </a>
          <button className="w-10 h-10 rounded-full bg-[#320E3B] flex items-center justify-center">
            <Menu className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </nav>
  )
}

function HeroSection() {
  return (
    <div className="bg-[#f8f7f7]">
    <section className="max-w-7xl mx-auto flex items-stretch min-h-[580px]">
      {/* Left column — 38% width, left-padded to match navbar */}
      <div className="w-[38%] flex-shrink-0 flex flex-col justify-center py-16 pl-6 pr-10">
        <div className="mb-6">
          <h1 className="text-6xl font-heading font-extrabold text-[#320E3B] leading-tight uppercase">
            HAREKET
            <br />
            HERKES İÇİN.
          </h1>
          <h2 className="text-6xl font-heading font-extrabold text-[#6B7FD7] leading-tight uppercase mt-1">
            UYUM
            <br />
            SENİN İÇİN.
          </h2>
          <div className="mt-3">
            <ArcUnderline width={260} />
          </div>
        </div>
        <p className="text-base text-gray-500 font-body max-w-sm mb-8 leading-relaxed">
          Engel tanımayan bir spor deneyimi için doğru tesisleri, sporları ve insanları bir araya getiriyoruz.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <button className="flex items-center gap-2 bg-[#320E3B] text-white rounded-full px-6 py-3 text-sm font-medium hover:opacity-90 transition-opacity">
            <ArrowRight className="w-4 h-4" />
            YAKININDAKİ TESİSLERİ KEŞFET
          </button>
          <button className="flex items-center gap-2 border border-[#320E3B] text-[#320E3B] rounded-full px-6 py-3 text-sm font-medium hover:bg-gray-50 transition-colors">
            <Play className="w-4 h-4" />
            NASIL ÇALIŞIR?
          </button>
        </div>
      </div>

      {/* Right column — 62% width, image bottom-flush with section bottom = features top */}
      <div className="flex-1 flex flex-col justify-end">
        <img
          src="/hero-image.png"
          alt="Sporcular"
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
}

const features: Feature[] = [
  { label: 'Tesisleri keşfet',   desc: 'Erişilebilir tesisleri bul',     icon: MapPin,   iconColor: '#00BCD4', bgColor: '#E0F7FA' },
  { label: 'Sporları keşfet',    desc: 'Sana uygun sporları keşfet',     icon: Activity, iconColor: '#43A047', bgColor: '#E8F5E9' },
  { label: 'Etkinliklere katıl', desc: 'Yakındaki etkinliklere katıl',   icon: Calendar, iconColor: '#7B2FBE', bgColor: '#F3E5F5' },
  { label: 'Koçlarla tanış',     desc: 'Uzman koçlarla çalış',           icon: User,     iconColor: '#FF6B35', bgColor: '#FFF3E0' },
  { label: 'Topluluğa katıl',    desc: 'Spor topluluğuna dahil ol',      icon: Users,    iconColor: '#00897B', bgColor: '#E0F2F1' },
]

function FeaturesSection() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <div className="flex gap-16 items-start">
        {/* Left heading */}
        <div className="w-64 flex-shrink-0">
          <h2 className="text-3xl font-heading font-extrabold text-[#320E3B] max-w-[200px] leading-tight uppercase">
            UYUM İLE NELER YAPABİLİRSİN?
          </h2>
          <div className="mt-3">
            <ArcUnderline color="#4C2A85" width={180} />
          </div>
        </div>
        {/* Right feature cards */}
        <div className="flex-1 flex gap-8 flex-wrap">
          {features.map(({ label, desc, icon: Icon, iconColor, bgColor }) => (
            <div key={label} className="flex flex-col items-center text-center gap-3 w-28">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: bgColor }}
              >
                <Icon className="w-7 h-7" style={{ color: iconColor }} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#320E3B]">{label}</p>
                <p className="text-xs text-gray-500 mt-1">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function UyumLanding() {
  return (
    <div className="min-h-screen bg-white font-body">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
    </div>
  )
}
