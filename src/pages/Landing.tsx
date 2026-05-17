import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  PersonStanding, Activity, ArrowRight, ArrowUp,
  BookOpen, Calendar, Contrast, Dumbbell, HeartHandshake, Keyboard,
  MapPin, MapPinned, Menu, Palette, Play, ShieldCheck, SkipForward,
  Sparkles, Type, User, UserCog, Volume2,
  X, Eye, AlignJustify, Link2, Focus, MousePointer2, Move, RotateCcw, Zap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useProfile } from '../contexts/ProfileContext'
import { useAccessibility } from '../contexts/AccessibilityContext'
import { Footer } from '../components/layout/Footer'
import { UyumLogo } from '../components/ui/UyumLogo'

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

/* ---------- A11y panel helpers (shared with TopBar) ---------- */

const EXTRA_KEY = 'uyum:a11y-extra'

interface ExtraPrefs {
  lineHeight:     'normal' | 'relaxed' | 'loose'
  dyslexicFont:   boolean
  highlightLinks: boolean
  reducedMotion:  boolean
  bigFocus:       boolean
  bigCursor:      boolean
}

const EXTRA_DEFAULTS: ExtraPrefs = {
  lineHeight: 'normal', dyslexicFont: false, highlightLinks: false,
  reducedMotion: false, bigFocus: false, bigCursor: false,
}

function loadExtra(): ExtraPrefs {
  try {
    const raw = localStorage.getItem(EXTRA_KEY)
    return raw ? { ...EXTRA_DEFAULTS, ...(JSON.parse(raw) as Partial<ExtraPrefs>) } : { ...EXTRA_DEFAULTS }
  } catch { return { ...EXTRA_DEFAULTS } }
}

function applyExtra(e: ExtraPrefs) {
  const html = document.documentElement
  const body = document.body
  const lhMap = { normal: '1.5', relaxed: '1.75', loose: '2' }
  html.style.setProperty('--line-height-base', lhMap[e.lineHeight])
  body.classList.toggle('a11y-dyslexic-font',   e.dyslexicFont)
  body.classList.toggle('a11y-highlight-links',  e.highlightLinks)
  body.classList.toggle('a11y-reduced-motion',   e.reducedMotion)
  body.classList.toggle('a11y-big-focus',        e.bigFocus)
  body.classList.toggle('a11y-big-cursor',       e.bigCursor)
}

const COLORBLIND_OPTIONS = [
  { value: 'none'         as const, label: 'Kapalı' },
  { value: 'deuteranopia' as const, label: 'Yeşil' },
  { value: 'protanopia'   as const, label: 'Kırmızı' },
  { value: 'tritanopia'   as const, label: 'Mavi' },
]

const FONT_SIZE_OPTIONS = [
  { value: 'normal' as const, label: 'A' },
  { value: 'large'  as const, label: 'A+' },
  { value: 'xlarge' as const, label: 'A++' },
]

function LandingToggleRow({
  icon, label, desc, checked, onChange,
}: { icon: React.ReactNode; label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  const id = `lt-${label.replace(/\s+/g, '-').toLowerCase()}`
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-gray-50 bg-gray-50/60 px-3.5 py-3">
      <label htmlFor={id} className="flex min-w-0 flex-1 cursor-pointer items-start gap-2.5">
        <span aria-hidden className="mt-0.5 shrink-0 text-gray-400">{icon}</span>
        <span>
          <span className="block text-[12.5px] font-semibold text-primary-deep">{label}</span>
          <span className="block text-[11px] text-gray-400">{desc}</span>
        </span>
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${checked ? 'bg-primary-deep' : 'bg-gray-200'}`}
      >
        <span
          aria-hidden
          className={`absolute top-1 size-4 rounded-full bg-white shadow transition-all ${checked ? 'right-1' : 'left-1'}`}
        />
        <span className="sr-only">{label}</span>
      </button>
    </div>
  )
}

/* ---------- Navbar ---------- */

function Navbar({ onPrimary }: { onPrimary: () => void }) {
  const { prefs, setColorblindMode, setHighContrast, setFontSize, setSpeechEnabled, reset } = useAccessibility()
  const [showA11y, setShowA11y] = useState(false)
  const [extra, setExtra]       = useState<ExtraPrefs>(loadExtra)

  useEffect(() => {
    localStorage.setItem(EXTRA_KEY, JSON.stringify(extra))
    applyExtra(extra)
  }, [extra])

  useEffect(() => { applyExtra(extra) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!showA11y) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowA11y(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [showA11y])

  function patchExtra(patch: Partial<ExtraPrefs>) {
    setExtra(prev => ({ ...prev, ...patch }))
  }

  function resetAll() {
    reset()
    setExtra(EXTRA_DEFAULTS)
  }

  const links: Array<{ label: string; to: string }> = [
    { label: 'Tesisler',    to: '/map'        },
    { label: 'Sporlar',     to: '/match'      },
    { label: 'Etkinlikler', to: '/events'     },
    { label: 'Koçlar',      to: '/coaches'    },
    { label: 'Hakkımızda',  to: '#hakkimizda' },
  ]

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center" aria-label="UYUM Ana sayfa">
            <UyumLogo size={36} />
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
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onPrimary}
              className="text-sm text-primary-deep hover:opacity-80 transition-opacity"
            >
              Giriş yap
            </button>

            {/* Erişilebilirlik butonu */}
            <button
              type="button"
              aria-label="Erişilebilirlik araçları"
              aria-expanded={showA11y}
              aria-haspopup="dialog"
              onClick={() => setShowA11y(v => !v)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
                showA11y ? 'bg-primary text-white' : 'border border-gray-200 text-primary-deep hover:bg-gray-50'
              }`}
            >
              <PersonStanding className="w-5 h-5" aria-hidden />
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

      {/* Overlay */}
      {showA11y && (
        <div
          className="fixed inset-0 z-40 bg-black/30"
          aria-hidden
          onClick={() => setShowA11y(false)}
        />
      )}

      {/* Sağ panel */}
      <aside
        role="dialog"
        aria-label="Erişilebilirlik ayarları"
        aria-hidden={!showA11y}
        className={`fixed right-0 top-0 z-50 flex h-full w-[min(400px,100vw)] flex-col bg-white shadow-2xl transition-transform duration-300 ${
          showA11y ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-full bg-primary-deep text-white">
              <PersonStanding className="size-4" aria-hidden />
            </span>
            <h2 className="text-base font-bold text-primary-deep">Erişilebilirlik</h2>
          </div>
          <button
            type="button"
            aria-label="Paneli kapat"
            onClick={() => setShowA11y(false)}
            className="grid size-9 place-items-center rounded-full border border-gray-100 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* Hızlı Profil */}
          <section>
            <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Hızlı Profil</h3>
            <div className="grid grid-cols-2 gap-2">
              {([
                { label: 'Az görüyorum',       Icon: Eye,      activeKey: 'highContrast' as const,   preset: { highContrast: true, fontSize: 'xlarge', highlightLinks: true, bigCursor: true } },
                { label: 'Disleksim var',       Icon: Type,     activeKey: 'dyslexicFont' as const,   preset: { dyslexicFont: true, lineHeight: 'loose', highlightLinks: true } },
                { label: 'Klavye kullanıyorum', Icon: Keyboard, activeKey: 'bigFocus' as const,       preset: { bigFocus: true, highlightLinks: true, fontSize: 'large' } },
                { label: 'Hareketi azalt',      Icon: Zap,      activeKey: 'reducedMotion' as const,  preset: { reducedMotion: true } },
              ] as const).map(({ label, Icon, activeKey, preset }) => {
                const isActive = activeKey === 'highContrast' ? prefs.highContrast : extra[activeKey as keyof ExtraPrefs] === true
                return (
                  <button
                    key={label}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => {
                      if (isActive) {
                        const off: Partial<ExtraPrefs> = {}
                        if ('dyslexicFont'    in preset) off.dyslexicFont   = false
                        if ('lineHeight'      in preset) off.lineHeight     = 'normal'
                        if ('highlightLinks'  in preset) off.highlightLinks = false
                        if ('bigFocus'        in preset) off.bigFocus       = false
                        if ('bigCursor'       in preset) off.bigCursor      = false
                        if ('reducedMotion'   in preset) off.reducedMotion  = false
                        if (Object.keys(off).length) patchExtra(off)
                        if ('highContrast' in preset) setHighContrast(false)
                        if ('fontSize'     in preset) setFontSize('normal')
                      } else {
                        const ep: Partial<ExtraPrefs> = {}
                        if ('dyslexicFont'   in preset) ep.dyslexicFont   = preset.dyslexicFont as boolean
                        if ('lineHeight'     in preset) ep.lineHeight     = preset.lineHeight as ExtraPrefs['lineHeight']
                        if ('highlightLinks' in preset) ep.highlightLinks = preset.highlightLinks as boolean
                        if ('bigFocus'       in preset) ep.bigFocus       = preset.bigFocus as boolean
                        if ('bigCursor'      in preset) ep.bigCursor      = preset.bigCursor as boolean
                        if ('reducedMotion'  in preset) ep.reducedMotion  = preset.reducedMotion as boolean
                        if (Object.keys(ep).length) patchExtra(ep)
                        if ('highContrast' in preset) setHighContrast(preset.highContrast as boolean)
                        if ('fontSize'     in preset) setFontSize(preset.fontSize as 'normal' | 'large' | 'xlarge')
                      }
                    }}
                    className={`flex items-center gap-2.5 rounded-2xl border px-3 py-3 text-left text-[12.5px] font-semibold transition ${
                      isActive
                        ? 'border-primary-deep/40 bg-primary-deep/10 text-primary-deep'
                        : 'border-gray-100 bg-gray-50 text-primary-deep hover:border-primary-deep/30 hover:bg-primary-deep/5'
                    }`}
                  >
                    <Icon aria-hidden className={`size-4 shrink-0 ${isActive ? 'text-primary-deep' : 'text-primary-deep/60'}`} />
                    <span className="leading-tight">{label}</span>
                  </button>
                )
              })}
            </div>
          </section>

          {/* Metin */}
          <section>
            <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Metin</h3>
            <div className="space-y-4">
              <div>
                <div className="mb-2 flex items-center gap-2 text-[12.5px] font-semibold text-gray-600">
                  <Type className="size-3.5" aria-hidden /> Yazı Boyutu
                </div>
                <div className="flex gap-2" role="group" aria-label="Yazı boyutu">
                  {FONT_SIZE_OPTIONS.map(o => (
                    <button
                      key={o.value}
                      type="button"
                      aria-pressed={prefs.fontSize === o.value}
                      onClick={() => setFontSize(o.value)}
                      className={`flex-1 rounded-xl py-2 text-sm font-bold transition ${
                        prefs.fontSize === o.value
                          ? 'bg-primary-deep text-white'
                          : 'border border-gray-100 bg-white text-gray-600 hover:border-primary-deep/30'
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center gap-2 text-[12.5px] font-semibold text-gray-600">
                  <AlignJustify className="size-3.5" aria-hidden /> Satır Aralığı
                </div>
                <div className="flex gap-2" role="group" aria-label="Satır aralığı">
                  {([
                    { value: 'normal' as const, label: 'Sıkı' },
                    { value: 'relaxed' as const, label: 'Normal' },
                    { value: 'loose' as const, label: 'Geniş' },
                  ]).map(o => (
                    <button
                      key={o.value}
                      type="button"
                      aria-pressed={extra.lineHeight === o.value}
                      onClick={() => patchExtra({ lineHeight: o.value })}
                      className={`flex-1 rounded-xl py-2 text-sm font-bold transition ${
                        extra.lineHeight === o.value
                          ? 'bg-primary-deep text-white'
                          : 'border border-gray-100 bg-white text-gray-600 hover:border-primary-deep/30'
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
              <LandingToggleRow
                icon={<Type className="size-3.5" />}
                label="Disleksi dostu yazı tipi"
                desc="OpenDyslexic / Atkinson yazı tipi"
                checked={extra.dyslexicFont}
                onChange={v => patchExtra({ dyslexicFont: v })}
              />
            </div>
          </section>

          {/* Görsel */}
          <section>
            <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Görsel</h3>
            <div className="space-y-2">
              <LandingToggleRow
                icon={<Contrast className="size-3.5" />}
                label="Yüksek Kontrast"
                desc="Siyah zemin, sarı metin"
                checked={prefs.highContrast}
                onChange={setHighContrast}
              />
              <LandingToggleRow
                icon={<Link2 className="size-3.5" />}
                label="Linkleri Vurgula"
                desc="Tüm linkler kalın ve altı çizili"
                checked={extra.highlightLinks}
                onChange={v => patchExtra({ highlightLinks: v })}
              />
              <div className="pt-1">
                <div className="mb-2 flex items-center gap-2 text-[12.5px] font-semibold text-gray-600">
                  <Eye className="size-3.5" aria-hidden /> Renk Körlüğü Modu
                </div>
                <div className="flex gap-2" role="group" aria-label="Renk körlüğü modu">
                  {COLORBLIND_OPTIONS.map(o => (
                    <button
                      key={o.value}
                      type="button"
                      aria-pressed={prefs.colorblindMode === o.value}
                      onClick={() => setColorblindMode(o.value)}
                      className={`flex-1 rounded-xl py-2 text-[11px] font-bold transition ${
                        prefs.colorblindMode === o.value
                          ? 'bg-primary-deep text-white'
                          : 'border border-gray-100 bg-white text-gray-600 hover:border-primary-deep/30'
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Etkileşim */}
          <section>
            <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Etkileşim</h3>
            <div className="space-y-2">
              <LandingToggleRow icon={<Move className="size-3.5" />}         label="Animasyonları Azalt"      desc="Tüm geçiş ve hareketler kapatılır"  checked={extra.reducedMotion}  onChange={v => patchExtra({ reducedMotion: v })} />
              <LandingToggleRow icon={<Focus className="size-3.5" />}        label="Belirgin Klavye Odağı"   desc="Tab ile gezerken kalın sarı çerçeve" checked={extra.bigFocus}       onChange={v => patchExtra({ bigFocus: v })} />
              <LandingToggleRow icon={<MousePointer2 className="size-3.5" />} label="Büyük İmleç"            desc="Fare imlecini büyütür"               checked={extra.bigCursor}      onChange={v => patchExtra({ bigCursor: v })} />
              <LandingToggleRow icon={<Volume2 className="size-3.5" />}      label="Sesli Okuma"             desc="Metin okuma özelliğini etkinleştirir" checked={prefs.speechEnabled} onChange={setSpeechEnabled} />
            </div>
          </section>
        </div>

        <div className="border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={resetAll}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-100 py-2.5 text-sm font-semibold text-gray-500 transition hover:border-red-200 hover:text-red-500"
          >
            <RotateCcw className="size-3.5" aria-hidden /> Tüm ayarları sıfırla
          </button>
        </div>
      </aside>

      <style>{`
        body.a11y-dyslexic-font { font-family: 'Atkinson Hyperlegible', Verdana, sans-serif !important; }
        body.a11y-highlight-links a { text-decoration: underline !important; font-weight: 700 !important; }
        body.a11y-reduced-motion *, body.a11y-reduced-motion *::before, body.a11y-reduced-motion *::after {
          animation-duration: 0.001s !important; transition-duration: 0.001s !important;
        }
        body.a11y-big-focus *:focus-visible { outline: 4px solid #facc15 !important; outline-offset: 3px !important; }
        body.a11y-big-cursor, body.a11y-big-cursor * { cursor: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'><path d='M6 4L6 32L14 24L19 36L24 33L19 21L30 21Z' fill='%23320E3B' stroke='white' stroke-width='1.5'/></svg>") 3 3, auto !important; }
      `}</style>
    </>
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
    <section id="hakkimizda" className="max-w-7xl mx-auto px-6 py-16" style={{ scrollMarginTop: 88 }}>
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


type Sponsor = {
  name: string
  short: string
  tone: 'state' | 'corp' | 'ngo' | 'edu'
}

const sponsors: Sponsor[] = [
  { name: 'Gençlik ve Spor Bakanlığı', short: 'GSB',  tone: 'state' },
  { name: 'Aile ve Sosyal Hizmetler Bakanlığı', short: 'ASHB', tone: 'state' },
  { name: 'Türkiye Bedensel Engelliler Spor Federasyonu', short: 'TBESF', tone: 'ngo' },
  { name: 'Spastik Çocuklar Vakfı', short: 'SÇV',   tone: 'ngo'   },
  { name: 'Ankara Büyükşehir Belediyesi', short: 'ABB',  tone: 'state' },
  { name: 'ODTÜ Sports Tech', short: 'ODTÜ',  tone: 'edu'   },
  { name: 'Decathlon Türkiye', short: 'DTL',   tone: 'corp'  },
  { name: 'Türkiye İş Bankası', short: 'TİB',   tone: 'corp'  },
  { name: 'Vodafone Vakfı', short: 'VDF',   tone: 'corp'  },
  { name: 'Turkcell', short: 'TCL',   tone: 'corp'  },
  { name: 'Koç Holding', short: 'KOÇ',   tone: 'corp'  },
  { name: 'Engelsiz Yaşam Derneği', short: 'EYD',   tone: 'ngo'   },
]

const sponsorToneClasses: Record<Sponsor['tone'], { ring: string; text: string; bg: string }> = {
  state: { ring: 'ring-primary-deep/15', text: 'text-primary-deep', bg: 'bg-primary-deep/[0.04]' },
  corp:  { ring: 'ring-accent/20',       text: 'text-accent',       bg: 'bg-accent/[0.05]'       },
  ngo:   { ring: 'ring-[#43A047]/20',    text: 'text-[#2E7D32]',    bg: 'bg-[#43A047]/[0.05]'    },
  edu:   { ring: 'ring-[#00897B]/20',    text: 'text-[#00695C]',    bg: 'bg-[#00897B]/[0.05]'    },
}

const toneLabel: Record<Sponsor['tone'], string> = {
  state: 'Kamu',
  corp:  'Kurumsal',
  ngo:   'STK',
  edu:   'Akademi',
}

function SponsorChip({ name, short, tone }: Sponsor) {
  const c = sponsorToneClasses[tone]
  return (
    <div className="flex flex-col items-center text-center gap-3 w-44 shrink-0">
      <div
        className={`flex items-center justify-center w-24 h-24 rounded-2xl ${c.bg} ring-1 ${c.ring} transition hover:ring-2`}
        aria-hidden
      >
        <span className={`text-2xl font-extrabold tracking-tight ${c.text}`}>{short}</span>
      </div>
      <div className="flex flex-col leading-tight">
        <span className={`text-[9px] uppercase tracking-[0.2em] font-semibold ${c.text} mb-1`}>
          {toneLabel[tone]}
        </span>
        <span className="text-[13px] font-semibold text-gray-700 leading-snug">
          {name}
        </span>
      </div>
    </div>
  )
}

function SponsorsSection() {
  // Çift kopya — sonsuz akış için (translateX -50%)
  const loop = [...sponsors, ...sponsors]
  return (
    <section
      aria-labelledby="sponsorlar-baslik"
      className="relative bg-white py-20 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 mb-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase mb-3">
              Birlikte daha güçlüyüz
            </p>
            <h2
              id="sponsorlar-baslik"
              className="text-3xl md:text-4xl font-extrabold text-primary-deep leading-[1.1] tracking-tight"
            >
              Sponsorlarımız ve <span className="text-accent">destekçilerimiz</span>
            </h2>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed max-w-sm">
            Kamu kurumları, sivil toplum örgütleri ve özel sektör paydaşları UYUM'u erişilebilir spor için destekliyor.
          </p>
        </div>
      </div>

      {/* Akıcı şerit */}
      <div
        className="relative"
        style={{
          maskImage:        'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
          WebkitMaskImage:  'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
        }}
      >
        <div
          className="flex w-max gap-10 animate-marquee motion-reduce:animate-none hover:[animation-play-state:paused] py-2"
          aria-hidden
        >
          {loop.map((s, i) => (
            <SponsorChip key={`${s.short}-${i}`} {...s} />
          ))}
        </div>

        {/* Ekran okuyucu için statik liste */}
        <ul className="sr-only">
          {sponsors.map(s => (
            <li key={s.short}>{s.name}</li>
          ))}
        </ul>
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



function HowItWorksSection({
  onPrimary,
  hasProfile,
  onFeatures,
}: { onPrimary: () => void; hasProfile: boolean; onFeatures: () => void }) {
  return (
    <section
      id="nasil-calisir"
      aria-labelledby="nasil-calisir-baslik"
      className="relative bg-white"
      style={{ scrollMarginTop: 88 }}
    >
      {/* Üst ayraç — ince çizgi + nokta */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-24">

        {/* Başlık bloğu — ortalanmış, sade tipografi */}
        <div className="max-w-2xl mb-16">
          <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase mb-3">
            Nasıl çalışır
          </p>
          <h2
            id="nasil-calisir-baslik"
            className="text-4xl md:text-5xl font-extrabold text-primary-deep leading-[1.1] tracking-tight"
          >
            Altı adımda
            <br />
            <span className="text-accent">sana uygun</span> spor.
          </h2>
          <p className="mt-5 text-base text-gray-500 leading-relaxed max-w-lg">
            UYUM, profiline göre tesisleri ve sporları eşleştirir. Sıfırdan başlasan da
            deneyimli olsan da yolculuğun aynı şekilde sade kalır.
          </p>
        </div>

        {/* Persona şeridi — kart değil, satır */}
        <div className="mb-16 flex items-center gap-5 pb-8 border-b border-gray-100">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0 ring-4 ring-white"
            style={{
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
            }}
            aria-hidden
          >
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-primary-deep">Ali, 28</p>
            <p className="text-xs text-gray-500">Tekerlekli sandalye kullanıcısı · Ankara</p>
          </div>
          <p className="hidden md:block text-sm text-gray-400 italic max-w-xs">
            "İlk kez adaptif yüzme denemek istiyorum."
          </p>
        </div>

        {/* 6 Adım — dikey timeline, hafif çizgili kart */}
        <ol
          className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12 mb-20"
          aria-label="UYUM kullanım adımları"
        >
          {steps.map(({ num, icon: Icon, iconColor, title, desc }, idx) => (
            <li key={num} className="group relative">
              {/* Bağlantı çizgisi — son kart hariç */}
              {idx < steps.length - 1 && (
                <span
                  aria-hidden
                  className="hidden lg:block absolute top-7 left-[3.25rem] w-[calc(100%-3rem)] h-px bg-gradient-to-r from-gray-200 to-transparent"
                />
              )}

              <div className="flex items-start gap-5">
                {/* Numara + ikon kompozisyonu */}
                <div className="relative flex-shrink-0">
                  <div className="w-14 h-14 rounded-2xl border border-gray-150 bg-white flex items-center justify-center transition-all group-hover:border-gray-200 group-hover:shadow-sm">
                    <Icon className="w-5 h-5" style={{ color: iconColor }} aria-hidden strokeWidth={1.75} />
                  </div>
                  <span
                    className="absolute -top-2 -right-2 text-[10px] font-bold tracking-wider text-gray-400 bg-white px-1.5 py-0.5 rounded"
                    aria-hidden
                  >
                    {num}
                  </span>
                </div>

                <div className="flex-1 pt-1">
                  <p className="text-base font-bold text-primary-deep mb-1.5">{title}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>

        {/* Erişilebilirlik bölümü — yatay split */}
        <div className="grid md:grid-cols-12 gap-10 items-start pt-16 border-t border-gray-100">
          <div className="md:col-span-4">
            <h3 className="text-2xl font-extrabold text-primary-deep leading-tight">
              Erişilebilirlik
              <br />
              <span className="text-gray-400 font-normal italic">standart, opsiyon değil.</span>
            </h3>
            <p className="mt-3 text-sm text-gray-500 leading-relaxed">
              Her ekran, her bileşen WCAG 2.1 AA hedefiyle tasarlandı.
            </p>
          </div>

          <div className="md:col-span-8">
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4" role="list">
              {a11yPills.map(({ label, icon: Icon }) => (
                <li key={label} className="flex items-center gap-3 py-2 border-b border-gray-100/80 last:border-0">
                  <Icon className="w-4 h-4 text-primary flex-shrink-0" aria-hidden strokeWidth={1.75} />
                  <span className="text-sm text-gray-700">{label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA çifti — daha hafif */}
        <div className="mt-20 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={onPrimary}
            className="group flex items-center gap-2 bg-primary-deep text-white rounded-full px-7 py-3.5 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {hasProfile ? 'Panele git' : 'Hemen başla'}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={onFeatures}
            className="flex items-center gap-2 text-primary-deep text-sm font-medium hover:gap-3 transition-all"
          >
            <ArrowUp className="w-4 h-4" aria-hidden />
            Önce neler yapabileceğimi gör
          </button>
        </div>

      </div>
    </section>
  )
}

export function Landing() {
  const navigate = useNavigate()
  const { hasProfile } = useProfile()

  const handlePrimary = () => navigate(hasProfile ? '/dashboard' : '/onboarding')
  const scrollToId = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  }
  const handleSecondary = () => scrollToId('nasil-calisir')
  const handleFeatures  = () => scrollToId('hakkimizda')

  return (
    <div className="min-h-screen bg-white">
      <Navbar onPrimary={handlePrimary} />
      <HeroSection onPrimary={handlePrimary} onSecondary={handleSecondary} />
      <FeaturesSection />
      <SponsorsSection />
      <HowItWorksSection onPrimary={handlePrimary} hasProfile={hasProfile} onFeatures={handleFeatures} />
      <Footer />
    </div>
  )
}
