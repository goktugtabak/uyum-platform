import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { AccessibilityPrefs } from '../types'

const STORAGE_KEY = 'uyum:a11y'

const DEFAULTS: AccessibilityPrefs = {
  colorblindMode: 'none',
  highContrast:   false,
  fontSize:       'normal',
  speechEnabled:  false,
}

const FONT_SIZE_MAP: Record<AccessibilityPrefs['fontSize'], string> = {
  normal: '16px',
  large:  '18px',
  xlarge: '20px',
}

function loadPrefs(): AccessibilityPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULTS
    return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<AccessibilityPrefs>) }
  } catch {
    return DEFAULTS
  }
}

function savePrefs(prefs: AccessibilityPrefs): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
  } catch {
    // quota exceeded — silently ignore
  }
}

function applyToDOM(prefs: AccessibilityPrefs): void {
  const html = document.documentElement

  // A1 — colorblind filter classes
  html.classList.remove('cb-deuteranopia', 'cb-protanopia', 'cb-tritanopia')
  if (prefs.colorblindMode !== 'none') {
    html.classList.add(`cb-${prefs.colorblindMode}`)
  }

  // A2 — high contrast
  html.classList.toggle('high-contrast', prefs.highContrast)

  // A6 — font size via inline style (rem-based, scales entire app)
  html.style.fontSize = FONT_SIZE_MAP[prefs.fontSize]
}

interface AccessibilityContextValue {
  prefs: AccessibilityPrefs
  setColorblindMode: (mode: AccessibilityPrefs['colorblindMode']) => void
  setHighContrast:   (on: boolean) => void
  setFontSize:       (size: AccessibilityPrefs['fontSize']) => void
  setSpeechEnabled:  (on: boolean) => void
  reset:             () => void
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null)

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<AccessibilityPrefs>(loadPrefs)

  useEffect(() => {
    applyToDOM(prefs)
    savePrefs(prefs)
  }, [prefs])

  function update(patch: Partial<AccessibilityPrefs>) {
    setPrefs(prev => ({ ...prev, ...patch }))
  }

  const value: AccessibilityContextValue = {
    prefs,
    setColorblindMode: mode  => update({ colorblindMode: mode }),
    setHighContrast:   on    => update({ highContrast: on }),
    setFontSize:       size  => update({ fontSize: size }),
    setSpeechEnabled:  on    => update({ speechEnabled: on }),
    reset:             ()    => setPrefs(DEFAULTS),
  }

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility(): AccessibilityContextValue {
  const ctx = useContext(AccessibilityContext)
  if (!ctx) throw new Error('useAccessibility must be used inside AccessibilityProvider')
  return ctx
}
