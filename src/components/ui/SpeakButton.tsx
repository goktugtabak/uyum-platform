import { useAccessibility } from '../../contexts/AccessibilityContext'
import { useSpeech } from '../../hooks/useSpeech'

interface SpeakButtonProps {
  text: string
  label?: string
  className?: string
}

export function SpeakButton({ text, label, className = '' }: SpeakButtonProps) {
  const { prefs } = useAccessibility()
  const { speak, stop, speaking } = useSpeech()

  if (!prefs.speechEnabled) return null

  const handleClick = () => {
    if (speaking) {
      stop()
    } else {
      speak(text)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={speaking ? 'Sesli okumayı durdur' : (label ? `Sesli oku: ${label}` : 'Sesli oku')}
      aria-pressed={speaking}
      className={
        'inline-flex items-center gap-1 px-2 py-1 rounded text-xs ' +
        'text-gray-500 hc:text-white hover:text-gray-700 hc:hover:text-gray-300 ' +
        'hover:bg-gray-100 hc:hover:bg-gray-800 ' +
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-uyum-purple ' +
        'transition-colors ' +
        className
      }
    >
      <span aria-hidden="true">{speaking ? '⏹' : '🔊'}</span>
      <span>{speaking ? 'Durdur' : 'Sesli Oku'}</span>
    </button>
  )
}
