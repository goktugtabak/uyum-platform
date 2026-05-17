import { useAccessibility } from '../../contexts/AccessibilityContext'
import type { AccessibilityPrefs } from '../../types'
import { SegmentedControl } from './SegmentedControl'
import { Toggle } from './Toggle'
import { Eye, Contrast, Type, Volume2 } from 'lucide-react'

const COLORBLIND_OPTIONS: { value: AccessibilityPrefs['colorblindMode']; label: string; ariaLabel: string }[] = [
  { value: 'none',         label: 'Kapalı', ariaLabel: 'Renk filtresi kapalı' },
  { value: 'deuteranopia', label: 'Deut.',  ariaLabel: 'Deuteranopia filtresi' },
  { value: 'protanopia',   label: 'Prot.',  ariaLabel: 'Protanopia filtresi' },
  { value: 'tritanopia',   label: 'Trit.',  ariaLabel: 'Tritanopia filtresi' },
]

const FONT_OPTIONS: { value: AccessibilityPrefs['fontSize']; label: string; ariaLabel: string }[] = [
  { value: 'normal', label: 'A',   ariaLabel: 'Normal font boyutu' },
  { value: 'large',  label: 'A+',  ariaLabel: 'Büyük font boyutu' },
  { value: 'xlarge', label: 'A++', ariaLabel: 'Çok büyük font boyutu' },
]

/**
 * Erişilebilirlik Araçları paneli.
 * Faz 12: light-theme kartı; sidebar veya popover içinde kullanılabilir.
 * A1 + A2 + A3 + A6 toggle'ları AccessibilityContext'i günceller.
 */
export function AccessibilityToolbar() {
  const { prefs, setColorblindMode, setHighContrast, setFontSize, setSpeechEnabled } = useAccessibility()

  return (
    <div
      role="toolbar"
      aria-label="Erişilebilirlik ayarları"
      className="rounded-2xl bg-card/85 p-4 ring-1 ring-border/40 backdrop-blur shadow-soft hc:bg-white hc:ring-black"
    >
      <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-primary">
        Erişilebilirlik Araçları
      </h3>

      <ul className="flex flex-col gap-3 text-xs">
        <Row icon={<Eye className="size-3.5" />} label="Renk Körlüğü">
          <SegmentedControl
            value={prefs.colorblindMode}
            options={COLORBLIND_OPTIONS}
            onChange={setColorblindMode}
            groupLabel="Renk körlüğü modu"
          />
        </Row>

        <Row icon={<Contrast className="size-3.5" />} label="Yüksek Kontrast">
          <Toggle
            pressed={prefs.highContrast}
            label="Yüksek kontrast modu"
            onPressedChange={setHighContrast}
          >
            {prefs.highContrast ? 'Açık' : 'Kapalı'}
          </Toggle>
        </Row>

        <Row icon={<Type className="size-3.5" />} label="Yazı Boyutu">
          <SegmentedControl
            value={prefs.fontSize}
            options={FONT_OPTIONS}
            onChange={setFontSize}
            groupLabel="Font büyüklüğü"
          />
        </Row>

        <Row icon={<Volume2 className="size-3.5" />} label="Sesli Okuma">
          <Toggle
            pressed={prefs.speechEnabled}
            label="Sesli okuma"
            onPressedChange={setSpeechEnabled}
          >
            {prefs.speechEnabled ? 'Açık' : 'Kapalı'}
          </Toggle>
        </Row>
      </ul>
    </div>
  )
}

function Row({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <li className="flex flex-col gap-1.5">
      <span className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground/70 hc:text-black">
        <span aria-hidden className="grid size-4 shrink-0 place-items-center text-foreground/50">
          {icon}
        </span>
        {label}
      </span>
      <div className="w-full">{children}</div>
    </li>
  )
}
