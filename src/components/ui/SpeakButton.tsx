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
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ' +
        'text-primary bg-primary/10 hover:bg-primary/20 hc:bg-black hc:text-white ' +
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ' +
        'transition-colors ' +
        className
      }
    >
      <span aria-hidden="true">{speaking ? '⏹' : ''}</span>
      <span>{speaking ? 'Durdur' : 'Sesli Oku'}</span>
    </button>
  )
}
