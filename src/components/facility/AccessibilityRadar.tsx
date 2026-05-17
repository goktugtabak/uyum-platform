import { motion } from 'framer-motion'
import type { Facility, DisabilityType, AccessibilityDimension } from '../../types'
import { useFacilityScore } from '../../hooks/useFacilityScore'
import { DIMENSION_KEYS, getDimensionLabel, type DimensionKey } from '../../lib/a11y-dimensions'
import { getAccessibilityLabel } from '../../lib/a11y-labels'

interface Props {
  facility: Facility
  disabilityType: DisabilityType
  height?: number
  compact?: boolean
  mode?: 'claimed' | 'verified'
  verifiedDimensions?: Record<DimensionKey, AccessibilityDimension>
}

const N = DIMENSION_KEYS.length
const GRID_LEVELS = [0.25, 0.5, 0.75, 1.0]

function polarToCartesian(cx: number, cy: number, r: number, angleRad: number) {
  return {
    x: cx + r * Math.sin(angleRad),
    y: cy - r * Math.cos(angleRad),
  }
}

function buildPoints(values: number[], cx: number, cy: number, radius: number): string {
  return values
    .map((v, i) => {
      const angle = (2 * Math.PI * i) / N
      const pt = polarToCartesian(cx, cy, v * radius, angle)
      return `${pt.x},${pt.y}`
    })
    .join(' ')
}

export function AccessibilityRadar({
  facility,
  disabilityType,
  height = 320,
  compact = false,
  mode = 'claimed',
  verifiedDimensions,
}: Props) {
  const { dimensions: claimedDimensions } = useFacilityScore(facility, disabilityType)

  const activeDimensions = mode === 'verified' && verifiedDimensions
    ? verifiedDimensions
    : claimedDimensions

  const values = DIMENSION_KEYS.map(key => getAccessibilityLabel(activeDimensions[key]).value ?? 0)

  const cx = 50
  const cy = 50
  const radius = compact ? 35 : 38
  const pointsStr = buildPoints(values, cx, cy, radius)

  const strokeColor = mode === 'verified'
    ? 'oklch(0.62 0.16 150)'
    : 'oklch(0.38 0.16 295)'
  const fillColor = mode === 'verified'
    ? 'oklch(0.62 0.16 150)'
    : 'oklch(0.68 0.13 270)'

  const ariaPrefix = mode === 'verified'
    ? 'Erişilebilirlik radarı (topluluk doğrulamasıyla): '
    : 'Erişilebilirlik radarı: '
  const ariaLabel =
    ariaPrefix +
    DIMENSION_KEYS.map(
      key => `${getDimensionLabel(key)}: ${getAccessibilityLabel(activeDimensions[key]).label}`,
    ).join(', ')

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={compact ? 'w-full' : 'w-full max-w-md'}
    >
      <svg
        viewBox="0 0 100 100"
        width="100%"
        height={height}
        aria-hidden
      >
        {/* Grid circles */}
        {GRID_LEVELS.map(level => (
          <circle
            key={level}
            cx={cx}
            cy={cy}
            r={level * radius}
            fill="none"
            stroke="oklch(0.92 0.02 290)"
            strokeWidth="0.4"
          />
        ))}

        {/* Axis spokes */}
        {DIMENSION_KEYS.map((_, i) => {
          const angle = (2 * Math.PI * i) / N
          const tip = polarToCartesian(cx, cy, radius, angle)
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={tip.x}
              y2={tip.y}
              stroke="oklch(0.92 0.02 290)"
              strokeWidth="0.4"
            />
          )
        })}

        {/* Animated data polygon */}
        <motion.polygon
          points={pointsStr}
          fill={fillColor}
          fillOpacity={0.22}
          stroke={strokeColor}
          strokeWidth="1.2"
          strokeLinejoin="round"
          animate={{ points: pointsStr, stroke: strokeColor, fill: fillColor }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />

        {/* Dots at vertices */}
        {values.map((v, i) => {
          const angle = (2 * Math.PI * i) / N
          const pt = polarToCartesian(cx, cy, v * radius, angle)
          return (
            <motion.circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r={compact ? 1.2 : 2}
              fill={strokeColor}
              animate={{ cx: pt.x, cy: pt.y, fill: strokeColor }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            />
          )
        })}

        {/* Axis labels — only in non-compact mode */}
        {!compact && DIMENSION_KEYS.map((key, i) => {
          const angle = (2 * Math.PI * i) / N
          const labelR = radius + 9
          const pt = polarToCartesian(cx, cy, labelR, angle)
          const textAnchor =
            Math.abs(pt.x - cx) < 1 ? 'middle' : pt.x < cx ? 'end' : 'start'
          return (
            <text
              key={key}
              x={pt.x}
              y={pt.y}
              textAnchor={textAnchor}
              dominantBaseline="central"
              fontSize="4.5"
              fontWeight="700"
              fill="oklch(0.4 0.05 290)"
            >
              {getDimensionLabel(key)}
            </text>
          )
        })}
      </svg>
    </div>
  )
}
