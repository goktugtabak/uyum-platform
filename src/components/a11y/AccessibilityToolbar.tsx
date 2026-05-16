import { useAccessibility } from '../../contexts/AccessibilityContext'
import type { AccessibilityPrefs } from '../../types'
import { SegmentedControl } from './SegmentedControl'
import { Toggle } from './Toggle'

const COLORBLIND_OPTIONS: { value: AccessibilityPrefs['colorblindMode']; label: string; ariaLabel: string }[] = [
  { value: 'none',         label: 'Kapalı',       ariaLabel: 'Renk filtresi kapalı' },
  { value: 'deuteranopia', label: 'Deuteranopia',  ariaLabel: 'Deuteranopia filtresi' },
  { value: 'protanopia',   label: 'Protanopia',    ariaLabel: 'Protanopia filtresi' },
  { value: 'tritanopia',   label: 'Tritanopia',    ariaLabel: 'Tritanopia filtresi' },
]

const FONT_OPTIONS: { value: AccessibilityPrefs['fontSize']; label: string; ariaLabel: string }[] = [
  { value: 'normal', label: 'A',   ariaLabel: 'Normal font boyutu' },
  { value: 'large',  label: 'A+',  ariaLabel: 'Büyük font boyutu' },
  { value: 'xlarge', label: 'A++', ariaLabel: 'Çok büyük font boyutu' },
]

export function AccessibilityToolbar() {
  const { prefs, setColorblindMode, setHighContrast, setFontSize, setSpeechEnabled } = useAccessibility()

  return (
    <div
      role="toolbar"
      aria-label="Erişilebilirlik ayarları"
      className="flex flex-wrap items-center gap-4 px-4 py-2 bg-uyum-dark/90 text-white text-sm"
    >
      {/* A1 — Renk Körlüğü */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-white/70 whitespace-nowrap" id="cb-label">Renk Körlüğü</span>
        <SegmentedControl
          value={prefs.colorblindMode}
          options={COLORBLIND_OPTIONS}
          onChange={setColorblindMode}
          groupLabel="Renk körlüğü modu"
        />
      </div>

      {/* A2 — Yüksek Kontrast */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-white/70 whitespace-nowrap">Yüksek Kontrast</span>
        <Toggle
          pressed={prefs.highContrast}
          label="Yüksek kontrast modu"
          onPressedChange={setHighContrast}
        >
          {prefs.highContrast ? 'Açık' : 'Kapalı'}
        </Toggle>
      </div>

      {/* A6 — Font Büyüklüğü */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-white/70 whitespace-nowrap">Yazı Boyutu</span>
        <SegmentedControl
          value={prefs.fontSize}
          options={FONT_OPTIONS}
          onChange={setFontSize}
          groupLabel="Font büyüklüğü"
        />
      </div>

      {/* A3 — Sesli Okuma */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-white/70 whitespace-nowrap">Sesli Okuma</span>
        <Toggle
          pressed={prefs.speechEnabled}
          label="Sesli okuma"
          onPressedChange={setSpeechEnabled}
        >
          {prefs.speechEnabled ? 'Açık' : 'Kapalı'}
        </Toggle>
      </div>
    </div>
  )
}
