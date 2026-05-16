import { useState, useCallback } from 'react'
import { useAccessibility } from '../contexts/AccessibilityContext'

export function useSpeech() {
  const { prefs } = useAccessibility()
  const [speaking, setSpeaking] = useState(false)

  const speak = useCallback((text: string) => {
    if (!prefs.speechEnabled) return
    if (typeof speechSynthesis === 'undefined') return

    speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'tr-TR'
    utterance.rate = 0.9

    utterance.onstart = () => setSpeaking(true)
    utterance.onend   = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)

    speechSynthesis.speak(utterance)
  }, [prefs.speechEnabled])

  const stop = useCallback(() => {
    if (typeof speechSynthesis !== 'undefined') {
      speechSynthesis.cancel()
    }
    setSpeaking(false)
  }, [])

  return { speak, stop, speaking }
}
