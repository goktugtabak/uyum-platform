import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight, Play, MapPin, Activity, Calendar, GraduationCap, Users, Menu,
  Footprints, ShoppingBag, Waves,
} from 'lucide-react'
import { UyumLogo } from '../components/ui/UyumLogo'
import { useProfile } from '../contexts/ProfileContext'
import heroAthletes from '../assets/hero-athletes.png'

export function Landing() {
  const navigate = useNavigate()
  const { hasProfile } = useProfile()

  function handlePrimary() {
    navigate(hasProfile ? '/dashboard' : '/onboarding')
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Ambient pastel lights */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 right-1/4 h-[40rem] w-[40rem] rounded-full bg-accent/15 blur-[160px]" />
        <div className="absolute top-1/3 -right-32 h-[34rem] w-[34rem] rounded-full bg-mint/40 blur-[150px]" />
        <div className="absolute top-1/2 -left-32 h-[30rem] w-[30rem] rounded-full bg-sky/40 blur-[140px]" />
      </div>

      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-4 py-6 md:px-6 md:py-7 lg:px-10">
        <UyumLogo />
        <nav aria-label="Bölümler" className="hidden items-center gap-9 text-[15px] font-medium text-foreground/75 md:flex">
          <Link to="/map" className="hover:text-primary">Tesisler</Link>
          <Link to="/match" className="hover:text-primary">Sporlar</Link>
          <Link to="/events" className="hover:text-primary">Etkinlikler</Link>
          <Link to="/coaches" className="hover:text-primary">Koçlar</Link>
          <a href="#hakkimizda" className="hover:text-primary">Hakkımızda</a>
        </nav>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePrimary}
            className="hidden text-[15px] font-medium text-foreground hover:text-primary md:inline"
          >
            {hasProfile ? 'Panele git' : 'Giriş yap'}
          </button>
          <button
            type="button"
            aria-label="Menü"
            className="grid size-11 place-items-center rounded-full bg-primary-deep text-primary-foreground"
            onClick={handlePrimary}
          >
            <Menu className="size-5" aria-hidden />
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 pb-24 pt-12 md:px-6 md:pt-16 lg:grid-cols-12 lg:px-10">
          <div className="lg:col-span-6">
            <h1 className="font-display text-[clamp(2.4rem,6vw,4.8rem)] font-extrabold leading-[1.02] tracking-tight text-primary-deep">
              HAREKET
              <br />
              HERKES İÇİN.
              <br />
              <span style={{ color: 'oklch(0.72 0.10 270)' }}>UYUM SENİN İÇİN.</span>
            </h1>
            <svg
              className="-mt-1 ml-1 h-3 w-72"
              viewBox="0 0 320 14"
              fill="none"
              aria-hidden
            >
              <path
                d="M3 9 C 60 3, 120 12, 180 6 S 300 10, 317 5"
                stroke="oklch(0.38 0.16 295)"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            <p className="mt-9 max-w-md text-[17px] leading-relaxed text-foreground/70">
              Engel tanımayan bir spor deneyimi için doğru tesisleri, sporları ve insanları
              bir araya getiriyoruz.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={handlePrimary}
                className="group inline-flex items-center gap-3 rounded-full bg-primary-deep px-7 py-4 text-[13px] font-bold uppercase tracking-wider text-primary-foreground transition hover:-translate-y-px"
              >
                <ArrowRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden />
                {hasProfile ? 'Tesisleri Keşfet' : 'Yakınındaki tesisleri keşfet'}
              </button>
              <a
                href="#hakkimizda"
                className="inline-flex items-center gap-2.5 rounded-full px-5 py-3.5 text-[13px] font-bold uppercase tracking-wider text-primary-deep transition hover:bg-primary-deep/5"
              >
                <Play className="size-4" aria-hidden /> Nasıl çalışır?
              </a>
            </div>
          </div>

          {/* Illustration cluster */}
          <div className="relative lg:col-span-6">
            <svg
              className="pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-40"
              viewBox="0 0 600 500"
              fill="none"
              aria-hidden
            >
              <path d="M40 80 C 180 60, 260 180, 420 140 S 580 240, 560 360" stroke="oklch(0.55 0.04 290)" strokeWidth="1" strokeDasharray="2 6" fill="none" />
              <path d="M20 280 C 160 240, 320 360, 480 300 S 590 200, 580 100" stroke="oklch(0.55 0.04 290)" strokeWidth="1" strokeDasharray="2 6" fill="none" />
              <path d="M60 420 C 200 380, 340 460, 500 420" stroke="oklch(0.55 0.04 290)" strokeWidth="1" strokeDasharray="2 6" fill="none" />
            </svg>

            <div aria-hidden className="absolute inset-0 -z-10">
              <svg viewBox="0 0 600 500" className="absolute inset-0 h-full w-full">
                <path
                  d="M180,80 C 320,60 460,140 470,260 C 480,380 380,440 260,430 C 140,420 80,320 100,220 C 110,140 130,100 180,80 Z"
                  fill="oklch(0.78 0.10 290 / 0.45)"
                />
                <path
                  d="M260,140 C 380,130 460,200 440,300 C 420,400 320,440 230,420 C 150,400 130,300 160,230 C 180,180 220,150 260,140 Z"
                  fill="oklch(0.93 0.06 215 / 0.55)"
                />
                <path
                  d="M340,170 C 420,180 470,260 440,340 C 410,420 320,430 250,400 C 200,380 200,300 240,240 C 270,200 310,170 340,170 Z"
                  fill="oklch(0.94 0.08 145 / 0.5)"
                />
              </svg>
            </div>

            <img
              src={heroAthletes}
              alt="UYUM ile spor yapan adaptif sporcular"
              width={1280}
              height={1024}
              className="relative w-full max-w-2xl object-contain"
            />

            <FloatingIcon top="38%" left="-2%" icon={<Footprints className="size-5" />} tint="violet" />
            <FloatingIcon top="62%" right="-2%" icon={<ShoppingBag className="size-5" />} tint="mint" />
            <FloatingIcon top="84%" right="14%" icon={<Waves className="size-5" />} tint="sky" />

            <MapDrop top="22%" left="34%" />
            <MapDrop top="14%" right="22%" />
            <MapDrop bottom="22%" left="6%" />
            <MapDrop bottom="6%" left="46%" />
          </div>
        </div>
      </section>

      {/* Features row */}
      <section id="hakkimizda" className="relative">
        <div className="mx-auto max-w-7xl px-4 pb-24 pt-8 md:px-6 lg:px-10">
          <div className="grid items-start gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <h2 className="font-display text-[clamp(2rem,3.5vw,3rem)] font-extrabold leading-[1.05] text-primary-deep">
                UYUM İLE
                <br />NELER<br />YAPABİLİRSİN?
              </h2>
              <svg className="mt-3 h-3 w-44" viewBox="0 0 200 14" fill="none" aria-hidden>
                <path
                  d="M3 9 C 50 3, 100 12, 150 6 S 195 9, 197 7"
                  stroke="oklch(0.38 0.16 295)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </div>

            <div className="lg:col-span-8">
              <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
                {[
                  { i: MapPin,         t: 'Tesisleri keşfet',   d: 'Erişilebilir tesisleri bul',    c: 'sky'      as const, to: '/map'      as const },
                  { i: Activity,       t: 'Sporları keşfet',    d: 'Sana uygun sporları keşfet',    c: 'mint'     as const, to: '/match'    as const },
                  { i: Calendar,       t: 'Etkinliklere katıl', d: 'Yakındaki etkinliklere katıl',  c: 'lavender' as const, to: '/events'   as const },
                  { i: GraduationCap,  t: 'Koçlarla tanış',     d: 'Uzman koçlarla çalış',           c: 'peach'    as const, to: '/coaches'  as const },
                  { i: Users,          t: 'Topluluğa katıl',    d: 'Spor topluluğuna dahil ol',      c: 'violet'   as const, to: '/community' as const },
                ].map(({ i: I, t, d, c, to }) => (
                  <Link
                    key={t}
                    to={to}
                    className="group flex flex-col items-center text-center"
                  >
                    <div
                      className={`mb-5 grid size-16 place-items-center rounded-full transition group-hover:-translate-y-1 ${tintBg(c)}`}
                    >
                      <I className={`size-7 ${tintFg(c)}`} strokeWidth={1.8} aria-hidden />
                    </div>
                    <div className="text-[15px] font-bold text-primary-deep">{t}</div>
                    <div className="mt-1.5 max-w-[14ch] text-[12.5px] leading-snug text-muted-foreground">
                      {d}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-7xl px-4 py-10 md:px-6 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/40 pt-8 text-sm text-muted-foreground">
          <UyumLogo size={28} />
          <p>© 2026 UYUM — METU Sports Tech Hackathon</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary">KVKK</a>
            <a href="#" className="hover:text-primary">Erişilebilirlik</a>
            <a href="#" className="hover:text-primary">İletişim</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

type Tint = 'sky' | 'mint' | 'lavender' | 'peach' | 'violet'

function tintBg(c: Tint) {
  return c === 'sky'      ? 'bg-sky/70'
    : c === 'mint'        ? 'bg-mint/70'
    : c === 'lavender'    ? 'bg-accent/20'
    : c === 'peach'       ? 'bg-[oklch(0.92_0.07_60)]'
    :                       'bg-primary/15'
}
function tintFg(c: Tint) {
  return c === 'sky'      ? 'text-sky-foreground'
    : c === 'mint'        ? 'text-mint-foreground'
    : c === 'lavender'    ? 'text-accent'
    : c === 'peach'       ? 'text-[oklch(0.55_0.16_50)]'
    :                       'text-primary'
}

function FloatingIcon({
  icon,
  tint,
  ...pos
}: {
  icon: React.ReactNode
  tint: 'violet' | 'mint' | 'sky'
  top?: string
  left?: string
  right?: string
  bottom?: string
}) {
  const cls =
    tint === 'violet' ? 'bg-card text-accent ring-accent/20'
    : tint === 'mint' ? 'bg-card text-mint-foreground ring-mint/40'
    :                   'bg-card text-sky-foreground ring-sky/40'
  return (
    <div
      aria-hidden
      className={`absolute grid size-14 place-items-center rounded-full ring-2 ${cls}`}
      style={pos}
    >
      {icon}
    </div>
  )
}

function MapDrop({ ...pos }: { top?: string; left?: string; right?: string; bottom?: string }) {
  return (
    <svg
      aria-hidden
      className="absolute size-6 text-primary-deep/70"
      viewBox="0 0 24 24"
      fill="currentColor"
      style={pos}
    >
      <path d="M12 2 C 7 2, 4 5.5, 4 9.5 C 4 15, 12 22, 12 22 C 12 22, 20 15, 20 9.5 C 20 5.5, 17 2, 12 2 Z" />
      <circle cx="12" cy="9.5" r="2.8" fill="white" />
    </svg>
  )
}
