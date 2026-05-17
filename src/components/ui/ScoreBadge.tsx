import { SCORE_LABEL, SCORE_GLYPH, SCORE_TONE } from '../../lib/a11y-labels'
import type { ScoreColor } from '../../hooks/useFacilityScore'

interface Props {
  color: ScoreColor
  size?: 'sm' | 'md' | 'lg'
}

export function ScoreBadge({ color, size = 'md' }: Props) {
  const sizeClass = size === 'sm'
    ? 'px-1.5 py-0.5 text-[10px]'
    : size === 'lg'
      ? 'px-3 py-1 text-sm font-semibold'
      : 'px-2 py-0.5 text-xs'
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${SCORE_TONE[color]} ${sizeClass}`}>
      <span aria-hidden="true">{SCORE_GLYPH[color]}</span>
      {SCORE_LABEL[color]}
    </span>
  )
}
