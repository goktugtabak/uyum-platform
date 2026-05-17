type MatchLevel = 'high' | 'medium' | 'low'

const MATCH_LABEL: Record<MatchLevel, string> = {
  high:   'Sana Uygun',
  medium: 'Kısmen Uygun',
  low:    'Az Uygun',
}
const MATCH_GLYPH: Record<MatchLevel, string> = {
  high:   '★',
  medium: '◐',
  low:    '○',
}
const MATCH_TONE: Record<MatchLevel, string> = {
  high:   'bg-primary/10 text-primary',
  medium: 'bg-accent/15 text-accent',
  low:    'bg-muted text-foreground/60',
}

interface Props {
  level: MatchLevel
}

export function MatchBadge({ level }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${MATCH_TONE[level]}`}
    >
      <span aria-hidden="true">{MATCH_GLYPH[level]}</span>
      {MATCH_LABEL[level]}
    </span>
  )
}
