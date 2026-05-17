import { Link } from 'react-router-dom'
import { MapPin, Mail, Heart, ShieldCheck } from 'lucide-react'
import { UyumLogo } from '../ui/UyumLogo'

const NAV_PLATFORM = [
  { to: '/dashboard', label: 'Anasayfa' },
  { to: '/map',       label: 'Tesisleri Keşfet' },
  { to: '/match',     label: 'Sporları Keşfet' },
  { to: '/events',    label: 'Etkinlikler' },
]

const NAV_KAYNAKLAR = [
  { to: '/exercises', label: 'Egzersizler' },
  { to: '/coaches',   label: 'Koç Dizini' },
  { to: '/community', label: 'Topluluk' },
  { to: '/profile',   label: 'Profilim' },
]

export function Footer() {
  return (
    <footer className="bg-primary-deep text-white" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-10 md:px-6 lg:px-12">

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">

          {/* Marka */}
          <div>
            <div className="flex items-center">
              <UyumLogo size={28} textClassName="text-white" />
            </div>

            <p className="mt-3 max-w-[220px] text-[12.5px] leading-relaxed text-white/50">
              Engelli bireylerin adaptif spor deneyimi için erişilebilir tesisler, sporlar ve topluluk.
            </p>

            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/8 px-3 py-1 text-[10.5px] font-semibold text-white/60">
              <Heart className="size-3 text-[oklch(0.94_0.08_145)]" aria-hidden />
              METU Sports Tech Hackathon 2026
            </div>
          </div>

          {/* Platform */}
          <div>
            <h3 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-white/30">
              Platform
            </h3>
            <ul className="space-y-2.5">
              {NAV_PLATFORM.map(item => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-[13px] text-white/55 transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kaynaklar */}
          <div>
            <h3 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-white/30">
              Kaynaklar
            </h3>
            <ul className="space-y-2.5">
              {NAV_KAYNAKLAR.map(item => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-[13px] text-white/55 transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* İletişim */}
          <div>
            <h3 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-white/30">
              İletişim
            </h3>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-2 text-[13px] text-white/55">
                <MapPin className="size-3.5 shrink-0 text-white/30" aria-hidden />
                Ankara, Türkiye
              </li>
              <li>
                <a
                  href="mailto:hello@uyum.app"
                  className="flex items-center gap-2 text-[13px] text-white/55 transition-colors hover:text-white"
                >
                  <Mail className="size-3.5 shrink-0 text-white/30" aria-hidden />
                  hello@uyum.app
                </a>
              </li>
            </ul>

            <div className="mt-4 rounded-xl bg-white/6 p-3 ring-1 ring-white/8">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-white/70">
                <ShieldCheck className="size-3.5 text-[oklch(0.94_0.08_145)]" aria-hidden />
                Erişilebilirlik Taahhüdü
              </div>
              <p className="mt-1.5 text-[10.5px] leading-relaxed text-white/40">
                WCAG 2.1 AA uyumlu. Renk körü, yüksek kontrast ve sesli okuma desteği standart.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-5 flex flex-wrap items-center justify-between gap-4 text-[11px] text-white/30">
          <p>© 2026 UYUM Platform. Tüm hakları saklıdır.</p>
          <nav aria-label="Yasal bağlantılar">
            <div className="flex flex-wrap gap-5">
              <a href="#" className="transition-colors hover:text-white/60">KVKK</a>
              <a href="#" className="transition-colors hover:text-white/60">Gizlilik</a>
              <a href="#" className="transition-colors hover:text-white/60">Erişilebilirlik</a>
              <a href="#" className="transition-colors hover:text-white/60">Çerezler</a>
            </div>
          </nav>
        </div>
      </div>
    </footer>
  )
}
