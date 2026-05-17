import { Link, useNavigate } from 'react-router-dom'
import {
  PersonStanding, Activity, ArrowRight, ArrowUp,
  BookOpen, Calendar, Contrast, Dumbbell, HeartHandshake, Keyboard,
  MapPin, MapPinned, Menu, Palette, Play, ShieldCheck, SkipForward,
  Sparkles, Type, User, UserCog, Volume2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useProfile } from '../contexts/ProfileContext'
import { Footer } from '../components/layout/Footer'

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
          <span className="text-xl font-bold text-primary-deep">UYUM</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {links.map(({ label, to }) =>
            to.startsWith('#') ? (
              <a key={label} href={to} className="text-sm text-gray-500 hover:text-primary-deep transition-colors">
                {label}
              </a>
            ) : (
              <Link key={label} to={to} className="text-sm text-gray-500 hover:text-primary-deep transition-colors">
                {label}
              </Link>
            ),
          )}
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onPrimary}
            className="text-sm text-primary-deep hover:opacity-80 transition-opacity"
          >
            Giriş yap
          </button>
          <button
            type="button"
            aria-label="Menü"
            onClick={onPrimary}
            className="w-10 h-10 rounded-full bg-primary-deep flex items-center justify-center hover:opacity-90 transition-opacity"
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
    <div className="bg-muted">
      <section className="max-w-7xl mx-auto flex items-stretch min-h-[580px]">
        <div className="w-[38%] flex-shrink-0 flex flex-col justify-center py-16 pl-6 pr-10">
          <div className="mb-6">
            <h1 className="text-6xl font-extrabold text-primary-deep leading-tight uppercase">
              HAREKET
              <br />
              HERKES İÇİN.
            </h1>
            <h2 className="text-6xl font-extrabold text-accent leading-tight uppercase mt-1">
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
              className="flex items-center gap-2 bg-primary-deep text-white rounded-full px-6 py-3 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <ArrowRight className="w-4 h-4" aria-hidden />
              YAKININDAKİ TESİSLERİ KEŞFET
            </button>
            <button
              type="button"
              onClick={onSecondary}
              aria-controls="nasil-calisir"
              className="flex items-center gap-2 border border-primary-deep text-primary-deep rounded-full px-6 py-3 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <Play className="w-4 h-4" aria-hidden />
              NASIL ÇALIŞIR?
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-end">
          <img
            src="/images/hero-image.png"
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
  { label: 'Tesisleri keşfet',   desc: 'Erişilebilir tesisleri bul',     icon: MapPin,   iconColor: 'var(--color-sky-foreground)', bgColor: 'var(--color-sky)', to: '/map'       },
  { label: 'Sporları keşfet',    desc: 'Sana uygun sporları keşfet',     icon: Activity, iconColor: 'var(--color-mint-foreground)', bgColor: 'var(--color-mint)', to: '/match'     },
  { label: 'Etkinliklere katıl', desc: 'Yakındaki etkinliklere katıl',   icon: Calendar, iconColor: 'var(--color-primary)', bgColor: 'var(--color-secondary)', to: '/events'    },
  { label: 'Koçlarla tanış',     desc: 'Uzman koçlarla çalış',           icon: User,     iconColor: 'var(--color-accent)', bgColor: 'rgba(107, 127, 215, 0.15)', to: '/coaches'   },
  { label: 'Egzersiz yap',        desc: 'Adaptif egzersizleri keşfet',    icon: Dumbbell, iconColor: 'var(--color-sky-foreground)', bgColor: 'var(--color-sky)', to: '/exercises' },
]

function FeaturesSection() {
  return (
    <section id="hakkimizda" className="max-w-7xl mx-auto px-6 py-16">
      <div className="flex gap-16 items-start flex-wrap lg:flex-nowrap">
        <div className="w-64 flex-shrink-0">
          <h2 className="text-3xl font-extrabold text-primary-deep max-w-[200px] leading-tight uppercase">
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
                <p className="text-sm font-bold text-primary-deep">{label}</p>
                <p className="text-xs text-gray-500 mt-1">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}


type Step = {
  num: string
  icon: LucideIcon
  iconColor: string
  diskColor: string
  title: string
  desc: string
}

const steps: Step[] = [
  { num: '01', icon: UserCog,        iconColor: '#7B2FBE', diskColor: '#F3E5F5', title: 'Profilini oluştur',        desc: 'Engel türünü, mobilite düzeyini ve spor hedefini belirt. Tüm veriler yalnızca tarayıcında saklanır.' },
  { num: '02', icon: Sparkles,       iconColor: '#43A047', diskColor: '#E8F5E9', title: 'Sana uygun sporu bul',     desc: 'Profil tabanlı algoritma 3 adaptif spor önerir — her birini neden önerdiğini de açıklar.' },
  { num: '03', icon: MapPinned,      iconColor: '#00BCD4', diskColor: '#E0F7FA', title: 'Tesisleri haritada gör',   desc: "Ankara'daki erişilebilir tesisleri renk + simge kodlu pin'lerle haritada keşfet, listele, filtrele." },
  { num: '04', icon: PersonStanding,  iconColor: '#FF6B35', diskColor: '#FFF3E0', title: 'Erişilebilirliği incele',  desc: '6 boyutlu radar grafiği, canlı kapasite durumu ve diğer kullanıcıların tanıklıkları.' },
  { num: '05', icon: BookOpen,       iconColor: '#00897B', diskColor: '#E0F2F1', title: 'İlk ziyaret rehberini al', desc: 'AI destekli kişiye özel rehber — sesli dinle veya PDF olarak kaydet.' },
  { num: '06', icon: HeartHandshake, iconColor: '#6B7FD7', diskColor: '#EEEEFB', title: 'Topluluğa katıl',          desc: 'Etkinliklere bak, koçlarla tanış, deneyimlerini paylaş.' },
]

type A11yPill = { label: string; icon: LucideIcon }

const a11yPills: A11yPill[] = [
  { label: 'Renk körü filtreler',    icon: Palette },
  { label: 'Yüksek kontrast modu',   icon: Contrast },
  { label: 'Font büyütme A/A+/A++',  icon: Type },
  { label: 'Sesli okuma (TR)',        icon: Volume2 },
  { label: 'Klavye odak halkası',    icon: Keyboard },
  { label: 'Ana içeriğe atla',       icon: SkipForward },
  { label: 'Renk-tek-bilgi yok',     icon: ShieldCheck },
]



function HowItWorksSection({ onPrimary, hasProfile }: { onPrimary: () => void; hasProfile: boolean }) {
  return (
    <section
      id="nasil-calisir"
      aria-labelledby="nasil-calisir-baslik"
      className="bg-muted"
      style={{ scrollMarginTop: 88 }}
    >
      <div className="max-w-7xl mx-auto px-6 py-20">

        {/* Başlık + persona */}
        <div className="flex gap-16 items-start flex-wrap lg:flex-nowrap mb-12">
          <div className="w-64 flex-shrink-0">
            <h2 id="nasil-calisir-baslik" className="text-3xl font-extrabold text-primary-deep max-w-[200px] leading-tight uppercase">
              UYUM NASIL ÇALIŞIR?
            </h2>
            <div className="mt-3">
              <ArcUnderline color="#4C2A85" width={180} />
            </div>
            <p className="mt-4 text-sm text-gray-500 leading-relaxed max-w-[200px]">
              Ali'nin gözünden 6 adımda UYUM deneyimi.
            </p>
          </div>

          <div className="flex-1">
            <div className="inline-flex items-center gap-4 rounded-2xl bg-white border border-gray-100 px-5 py-4 shadow-sm">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
                style={{ backgroundColor: 'var(--color-primary)' }}
                aria-hidden
              >
                A
              </div>
              <div>
                <p className="text-sm font-bold text-primary-deep">Ali, 28</p>
                <p className="text-xs text-gray-500 mt-0.5">Tekerlekli sandalye kullanıcısı · Ankara</p>
                <p className="text-xs text-gray-400 mt-1">"İlk kez adaptif yüzme denemek istiyorum."</p>
              </div>
            </div>
          </div>
        </div>

        {/* 6 Adım */}
        <ol className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12" aria-label="UYUM kullanım adımları">
          {steps.map(({ num, icon: Icon, iconColor, diskColor, title, desc }) => (
            <li
              key={num}
              className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5 hover:shadow-md transition-shadow"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-extrabold"
                style={{ backgroundColor: diskColor, color: iconColor }}
                aria-hidden
              >
                {num}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-4 h-4 flex-shrink-0" style={{ color: iconColor }} aria-hidden />
                  <p className="text-sm font-bold text-primary-deep">{title}</p>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            </li>
          ))}
        </ol>

        {/* Erişilebilirlik pill'leri */}
        <div className="mb-8">
          <h3 className="text-base font-bold text-primary-deep mb-3">
            Erişilebilirlik standart, opsiyon değil.
          </h3>
          <div className="flex flex-wrap gap-2" role="list" aria-label="Erişilebilirlik özellikleri">
            {a11yPills.map(({ label, icon: Icon }) => (
              <div
                key={label}
                role="listitem"
                className="inline-flex items-center gap-1.5 rounded-full bg-white border border-gray-200 px-3 py-1.5 text-xs text-gray-700"
              >
                <Icon className="w-3.5 h-3.5 text-primary" aria-hidden />
                {label}
              </div>
            ))}
          </div>
        </div>


        {/* CTA çifti */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onPrimary}
            className="flex items-center gap-2 bg-primary-deep text-white rounded-full px-6 py-3 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <ArrowRight className="w-4 h-4" aria-hidden />
            {hasProfile ? 'PANELE GİT' : 'HEMEN BAŞLA'}
          </button>
          <a
            href="#hakkimizda"
            className="flex items-center gap-2 border border-primary-deep text-primary-deep rounded-full px-6 py-3 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <ArrowUp className="w-4 h-4" aria-hidden />
            ÖNCE NELER YAPABİLECEĞİMİ GÖSTER
          </a>
        </div>

      </div>
    </section>
  )
}

export function Landing() {
  const navigate = useNavigate()
  const { hasProfile } = useProfile()

  const handlePrimary = () => navigate(hasProfile ? '/dashboard' : '/onboarding')
  const handleSecondary = () => {
    const el = document.getElementById('nasil-calisir')
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar onPrimary={handlePrimary} />
      <HeroSection onPrimary={handlePrimary} onSecondary={handleSecondary} />
      <FeaturesSection />
      <HowItWorksSection onPrimary={handlePrimary} hasProfile={hasProfile} />
      <Footer />
    </div>
  )
}
