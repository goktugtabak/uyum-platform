import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import {
  Search, MapPin, Bell, Menu, X,
  Home, Sparkles, CalendarDays, Dumbbell, GraduationCap, UserCircle2,
  Heart, Accessibility, Eye, Contrast, Type, Volume2, ChevronDown,
  AlignJustify, Link2, Focus, MousePointer2,
  Move, RotateCcw, Keyboard, Zap,
} from 'lucide-react'
import { UyumLogo } from '../ui/UyumLogo'
import { useProfile } from '../../contexts/ProfileContext'
import { useAccessibility } from '../../contexts/AccessibilityContext'
import { MOCK_NOTIFICATIONS } from '../../lib/notifications-data'
import type { Notification } from '../../lib/notifications-data'

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
  { to: '/coaches',    label: 'Koçlar',              icon: GraduationCap },
  { to: '/profile',    label: 'Profilim',            icon: UserCircle2 },
] as const

const NOTIF_TYPE_COLOR: Record<Notification['type'], string> = {
  facility:  'bg-mint/60 text-mint-foreground',
  event:     'bg-accent/15 text-accent',
  match:     'bg-[oklch(0.92_0.07_60)] text-[oklch(0.55_0.16_60)]',
  community: 'bg-red-50 text-red-500',
}
const NOTIF_TYPE_ICON: Record<Notification['type'], typeof Bell> = {
  facility:  MapPin,
  event:     CalendarDays,
  match:     Sparkles,
  community: Heart,
}

const COLORBLIND_OPTIONS = [
  { value: 'none'         as const, label: 'Kapalı' },
  { value: 'deuteranopia' as const, label: 'Yeşil' },
  { value: 'protanopia'   as const, label: 'Kırmızı' },
  { value: 'tritanopia'   as const, label: 'Mavi' },
]

const FONT_OPTIONS = [
  { value: 'normal' as const, label: 'A' },
  { value: 'large'  as const, label: 'A+' },
  { value: 'xlarge' as const, label: 'A++' },
]

const EXTRA_KEY = 'uyum:a11y-extra'

interface ExtraPrefs {
  lineHeight:    'normal' | 'relaxed' | 'loose'
  dyslexicFont:  boolean
  highlightLinks: boolean
  reducedMotion: boolean
  bigFocus:      boolean
  bigCursor:     boolean
}

const EXTRA_DEFAULTS: ExtraPrefs = {
  lineHeight:    'normal',
  dyslexicFont:  false,
  highlightLinks: false,
  reducedMotion: false,
  bigFocus:      false,
  bigCursor:     false,
}

function loadExtra(): ExtraPrefs {
  try {
    const raw = localStorage.getItem(EXTRA_KEY)
    return raw ? { ...EXTRA_DEFAULTS, ...(JSON.parse(raw) as Partial<ExtraPrefs>) } : { ...EXTRA_DEFAULTS }
  } catch {
    return { ...EXTRA_DEFAULTS }
  }
}

function applyExtra(extra: ExtraPrefs) {
  const html = document.documentElement
  const body = document.body

  const lineHeightMap = { normal: '1.5', relaxed: '1.75', loose: '2' }
  html.style.setProperty('--line-height-base', lineHeightMap[extra.lineHeight])

  body.classList.toggle('a11y-dyslexic-font', extra.dyslexicFont)
  body.classList.toggle('a11y-highlight-links', extra.highlightLinks)
  body.classList.toggle('a11y-reduced-motion', extra.reducedMotion)
  body.classList.toggle('a11y-big-focus', extra.bigFocus)
  body.classList.toggle('a11y-big-cursor', extra.bigCursor)
}

export function TopBar() {
  const { profile } = useProfile()
  const { prefs, setColorblindMode, setHighContrast, setFontSize, setSpeechEnabled, reset } = useAccessibility()
  const navigate = useNavigate()
  const [showA11y, setShowA11y]     = useState(false)
  const [showMenu, setShowMenu]     = useState(false)
  const [showNotif, setShowNotif]   = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [extra, setExtra]           = useState<ExtraPrefs>(loadExtra)
  const notifRef  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    localStorage.setItem(EXTRA_KEY, JSON.stringify(extra))
    applyExtra(extra)
  }, [extra])

  useEffect(() => {
    applyExtra(extra)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotif(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (showA11y) {
      function onKey(e: KeyboardEvent) {
        if (e.key === 'Escape') setShowA11y(false)
      }
      document.addEventListener('keydown', onKey)
      return () => document.removeEventListener('keydown', onKey)
    }
  }, [showA11y])

  function patchExtra(patch: Partial<ExtraPrefs>) {
    setExtra(prev => ({ ...prev, ...patch }))
  }

  function resetAll() {
    reset()
    setExtra(EXTRA_DEFAULTS)
  }

  const unreadCount = MOCK_NOTIFICATIONS.filter(n => !n.read).length
  const previewNotifs = MOCK_NOTIFICATIONS.slice(0, 4)

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = searchQuery.trim()
    if (!q) return
    const lower = q.toLowerCase()
    if (lower.includes('tesis') || lower.includes('havuz') || lower.includes('saha') || lower.includes('salon')) {
      navigate('/map')
    } else if (lower.includes('etkinlik') || lower.includes('kurs') || lower.includes('antrenman')) {
      navigate('/events')
    } else if (lower.includes('spor') || lower.includes('yüzme') || lower.includes('basketbol') || lower.includes('masa tenisi')) {
      navigate('/match')
    } else if (lower.includes('koç') || lower.includes('antrenör')) {
      navigate('/coaches')
    } else if (lower.includes('egzersiz') || lower.includes('video')) {
      navigate('/exercises')
    } else {
      navigate('/map')
    }
    setSearchQuery('')
  }

  return (
    <>
      <header
        className="sticky top-0 z-30 flex items-center gap-3 border-b border-gray-100 bg-white px-4 py-4 md:px-6 lg:px-12"
        role="banner"
      >
        {/* Mobile menu toggle */}
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
        </Link>

        {/* Search */}
        <div className="ml-auto flex items-center gap-2.5 lg:ml-0 lg:flex-1">
          <form
            onSubmit={handleSearchSubmit}
            role="search"
            className="relative hidden max-w-md flex-1 sm:block"
          >
            <Search
              aria-hidden
              className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-gray-400"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tesis, spor, etkinlik ara…"
              aria-label="Site içinde ara"
              className="h-11 w-full rounded-full border border-gray-100 bg-white pl-11 pr-4 text-sm text-[#320E3B] outline-none transition focus:border-[#320E3B] hc:bg-white hc:border-black"
            />
          </form>
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

        {/* Accessibility button — opens right-side panel */}
        <button
          type="button"
          aria-label="Erişilebilirlik araçları"
          aria-expanded={showA11y}
          aria-haspopup="dialog"
          onClick={() => { setShowA11y(v => !v); setShowNotif(false) }}
          className={`grid h-11 w-11 place-items-center rounded-full text-white transition ${
            showA11y ? 'bg-[#4C2A85]' : 'bg-[#320E3B] hover:opacity-90'
          }`}
        >
          <Accessibility className="size-5" aria-hidden />
        </button>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            type="button"
            aria-label={`Bildirimler${unreadCount > 0 ? `, ${unreadCount} okunmamış` : ''}`}
            aria-expanded={showNotif}
            aria-haspopup="dialog"
            onClick={() => { setShowNotif(v => !v); setShowA11y(false) }}
            className="relative grid h-11 w-11 place-items-center rounded-full border border-gray-100 bg-white text-[#320E3B] hover:border-[#320E3B] hc:bg-white hc:border-black"
          >
            <Bell aria-hidden className="size-[18px]" />
            {unreadCount > 0 && (
              <span aria-hidden className="absolute right-2.5 top-2.5 flex size-[9px] items-center justify-center rounded-full bg-red-500 ring-2 ring-white" />
            )}
          </button>

          {showNotif && (
            <div
              role="dialog"
              aria-label="Bildirim önizlemesi"
              className="absolute right-0 top-full z-40 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-lg"
            >
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <span className="text-sm font-bold text-[#320E3B]">Bildirimler</span>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                    {unreadCount} yeni
                  </span>
                )}
              </div>

              <ul className="divide-y divide-gray-50">
                {previewNotifs.map(n => {
                  const Icon = NOTIF_TYPE_ICON[n.type]
                  return (
                    <li key={n.id}>
                      <Link
                        to={n.to}
                        onClick={() => setShowNotif(false)}
                        className={`flex items-start gap-3 px-4 py-3 transition hover:bg-gray-50 ${
                          !n.read ? 'bg-primary/[0.03]' : ''
                        }`}
                      >
                        <span className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-full ${NOTIF_TYPE_COLOR[n.type]}`}>
                          <Icon className="size-3.5" aria-hidden />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-1.5">
                            <span className={`text-[13px] font-semibold leading-tight ${!n.read ? 'text-[#320E3B]' : 'text-gray-700'}`}>
                              {n.title}
                            </span>
                            {!n.read && (
                              <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" aria-label="Okunmadı" />
                            )}
                          </div>
                          <p className="mt-0.5 line-clamp-1 text-[11.5px] text-gray-500">{n.body}</p>
                          <span className="text-[10.5px] text-gray-400">{n.time}</span>
                        </div>
                      </Link>
                    </li>
                  )
                })}
              </ul>

              <div className="border-t border-gray-100 px-4 py-3">
                <Link
                  to="/notifications"
                  onClick={() => setShowNotif(false)}
                  className="flex w-full items-center justify-center rounded-full bg-primary/8 py-2.5 text-[13px] font-semibold text-primary transition hover:bg-primary/15"
                >
                  Tüm bildirimleri gör
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Profile avatar */}
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

      {/* Accessibility panel overlay */}
      {showA11y && (
        <div
          className="fixed inset-0 z-40 bg-black/30"
          aria-hidden
          onClick={() => setShowA11y(false)}
        />
      )}

      {/* Accessibility panel — right-side drawer */}
      <aside
        role="dialog"
        aria-label="Erişilebilirlik ayarları"
        aria-hidden={!showA11y}
        className={`fixed right-0 top-0 z-50 flex h-full w-[min(400px,100vw)] flex-col bg-white shadow-2xl transition-transform duration-300 ${
          showA11y ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-full bg-[#320E3B] text-white">
              <Accessibility className="size-4" aria-hidden />
            </span>
            <h2 className="text-base font-bold text-[#320E3B]">Erişilebilirlik</h2>
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

        {/* Panel content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* Quick presets */}
          <section>
            <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Hızlı Profil</h3>
            <div className="grid grid-cols-2 gap-2">
              {([
                { label: 'Az görüyorum',       Icon: Eye,      preset: { highContrast: true, fontSize: 'xlarge', highlightLinks: true, bigCursor: true } },
                { label: 'Disleksim var',       Icon: Type,     preset: { dyslexicFont: true, lineHeight: 'loose', highlightLinks: true } },
                { label: 'Klavye kullanıyorum', Icon: Keyboard, preset: { bigFocus: true, highlightLinks: true, fontSize: 'large' } },
                { label: 'Hareketi azalt',      Icon: Zap,      preset: { reducedMotion: true } },
              ] as const).map(({ label, Icon, preset }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    const extraPatch: Partial<ExtraPrefs> = {}
                    const corePreset: { highContrast?: boolean; fontSize?: 'normal' | 'large' | 'xlarge' } = {}
                    if ('highContrast'  in preset) corePreset.highContrast  = preset.highContrast as boolean
                    if ('fontSize'      in preset) corePreset.fontSize      = preset.fontSize as 'normal' | 'large' | 'xlarge'
                    if ('dyslexicFont'  in preset) extraPatch.dyslexicFont  = preset.dyslexicFont as boolean
                    if ('lineHeight'    in preset) extraPatch.lineHeight    = preset.lineHeight as ExtraPrefs['lineHeight']
                    if ('highlightLinks'in preset) extraPatch.highlightLinks = preset.highlightLinks as boolean
                    if ('bigFocus'      in preset) extraPatch.bigFocus      = preset.bigFocus as boolean
                    if ('bigCursor'     in preset) extraPatch.bigCursor     = preset.bigCursor as boolean
                    if ('reducedMotion' in preset) extraPatch.reducedMotion = preset.reducedMotion as boolean
                    if (Object.keys(corePreset).length) {
                      if ('highContrast' in corePreset) setHighContrast(corePreset.highContrast!)
                      if ('fontSize'     in corePreset) setFontSize(corePreset.fontSize!)
                    }
                    if (Object.keys(extraPatch).length) patchExtra(extraPatch)
                  }}
                  className="flex items-center gap-2.5 rounded-2xl border border-gray-100 bg-gray-50 px-3 py-3 text-left text-[12.5px] font-semibold text-[#320E3B] transition hover:border-[#320E3B]/30 hover:bg-[#320E3B]/5"
                >
                  <Icon aria-hidden className="size-4 shrink-0 text-[#320E3B]/60" />
                  <span className="leading-tight">{label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Text settings */}
          <section>
            <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Metin</h3>
            <div className="space-y-4">
              {/* Font size */}
              <div>
                <div className="mb-2 flex items-center gap-2 text-[12.5px] font-semibold text-gray-600">
                  <Type className="size-3.5" aria-hidden /> Yazı Boyutu
                </div>
                <div className="flex gap-2" role="group" aria-label="Yazı boyutu">
                  {FONT_OPTIONS.map(o => (
                    <button
                      key={o.value}
                      type="button"
                      aria-pressed={prefs.fontSize === o.value}
                      onClick={() => setFontSize(o.value)}
                      className={`flex-1 rounded-xl py-2 text-sm font-bold transition ${
                        prefs.fontSize === o.value
                          ? 'bg-[#320E3B] text-white'
                          : 'border border-gray-100 bg-white text-gray-600 hover:border-[#320E3B]/30'
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Line height */}
              <div>
                <div className="mb-2 flex items-center gap-2 text-[12.5px] font-semibold text-gray-600">
                  <AlignJustify className="size-3.5" aria-hidden /> Satır Aralığı
                </div>
                <div className="flex gap-2" role="group" aria-label="Satır aralığı">
                  {([
                    { value: 'normal'  as const, label: 'Sıkı' },
                    { value: 'relaxed' as const, label: 'Normal' },
                    { value: 'loose'   as const, label: 'Geniş' },
                  ]).map(o => (
                    <button
                      key={o.value}
                      type="button"
                      aria-pressed={extra.lineHeight === o.value}
                      onClick={() => patchExtra({ lineHeight: o.value })}
                      className={`flex-1 rounded-xl py-2 text-sm font-bold transition ${
                        extra.lineHeight === o.value
                          ? 'bg-[#320E3B] text-white'
                          : 'border border-gray-100 bg-white text-gray-600 hover:border-[#320E3B]/30'
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dyslexic font toggle */}
              <ToggleRow
                icon={<Type className="size-3.5" />}
                label="Disleksi dostu yazı tipi"
                desc="OpenDyslexic / Atkinson yazı tipi"
                checked={extra.dyslexicFont}
                onChange={v => patchExtra({ dyslexicFont: v })}
              />
            </div>
          </section>

          {/* Visual settings */}
          <section>
            <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Görsel</h3>
            <div className="space-y-2">
              <ToggleRow
                icon={<Contrast className="size-3.5" />}
                label="Yüksek Kontrast"
                desc="Siyah zemin, sarı metin"
                checked={prefs.highContrast}
                onChange={setHighContrast}
              />
              <ToggleRow
                icon={<Link2 className="size-3.5" />}
                label="Linkleri Vurgula"
                desc="Tüm linkler kalın ve altı çizili"
                checked={extra.highlightLinks}
                onChange={v => patchExtra({ highlightLinks: v })}
              />
              {/* Color blind mode */}
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
                          ? 'bg-[#320E3B] text-white'
                          : 'border border-gray-100 bg-white text-gray-600 hover:border-[#320E3B]/30'
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Interaction settings */}
          <section>
            <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Etkileşim</h3>
            <div className="space-y-2">
              <ToggleRow
                icon={<Move className="size-3.5" />}
                label="Animasyonları Azalt"
                desc="Tüm geçiş ve hareketler kapatılır"
                checked={extra.reducedMotion}
                onChange={v => patchExtra({ reducedMotion: v })}
              />
              <ToggleRow
                icon={<Focus className="size-3.5" />}
                label="Belirgin Klavye Odağı"
                desc="Tab ile gezerken kalın sarı çerçeve"
                checked={extra.bigFocus}
                onChange={v => patchExtra({ bigFocus: v })}
              />
              <ToggleRow
                icon={<MousePointer2 className="size-3.5" />}
                label="Büyük İmleç"
                desc="Fare imlecini büyütür"
                checked={extra.bigCursor}
                onChange={v => patchExtra({ bigCursor: v })}
              />
              <ToggleRow
                icon={<Volume2 className="size-3.5" />}
                label="Sesli Okuma"
                desc="Metin okuma özelliğini etkinleştirir"
                checked={prefs.speechEnabled}
                onChange={setSpeechEnabled}
              />
            </div>
          </section>
        </div>

        {/* Panel footer */}
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

      {/* Extra A11y CSS */}
      <style>{`
        body.a11y-dyslexic-font { font-family: 'Atkinson Hyperlegible', Verdana, sans-serif !important; }
        body.a11y-highlight-links a { text-decoration: underline !important; font-weight: 700 !important; }
        body.a11y-reduced-motion *, body.a11y-reduced-motion *::before, body.a11y-reduced-motion *::after {
          animation-duration: 0.001s !important; transition-duration: 0.001s !important;
        }
        body.a11y-big-focus *:focus-visible {
          outline: 4px solid #facc15 !important; outline-offset: 3px !important;
        }
        body.a11y-big-cursor, body.a11y-big-cursor * { cursor: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'><path d='M6 4L6 32L14 24L19 36L24 33L19 21L30 21Z' fill='%23320E3B' stroke='white' stroke-width='1.5'/></svg>") 3 3, auto !important; }
      `}</style>
    </>
  )
}

function ToggleRow({
  icon, label, desc, checked, onChange,
}: {
  icon: React.ReactNode
  label: string
  desc: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  const id = `toggle-${label.replace(/\s+/g, '-').toLowerCase()}`
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-gray-50 bg-gray-50/60 px-3.5 py-3">
      <label htmlFor={id} className="flex min-w-0 flex-1 cursor-pointer items-start gap-2.5">
        <span aria-hidden className="mt-0.5 shrink-0 text-gray-400">{icon}</span>
        <span>
          <span className="block text-[12.5px] font-semibold text-[#320E3B]">{label}</span>
          <span className="block text-[11px] text-gray-400">{desc}</span>
        </span>
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-[#320E3B]' : 'bg-gray-200'
        }`}
      >
        <span
          aria-hidden
          className={`absolute top-1 size-4 rounded-full bg-white shadow transition-all ${
            checked ? 'right-1' : 'left-1'
          }`}
        />
        <span className="sr-only">{label}</span>
      </button>
    </div>
  )
}

