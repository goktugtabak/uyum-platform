import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts'
import type { Facility, DisabilityType } from '../../types'
import { useFacilityScore } from '../../hooks/useFacilityScore'
import { DIMENSION_KEYS, getDimensionLabel } from '../../lib/a11y-dimensions'
import { getAccessibilityLabel } from '../../lib/a11y-labels'

interface Props {
  facility: Facility
  disabilityType: DisabilityType
  height?: number
  compact?: boolean
}

export function AccessibilityRadar({ facility, disabilityType, height = 320, compact = false }: Props) {
  const { dimensions } = useFacilityScore(facility, disabilityType)

  const data = DIMENSION_KEYS.map(key => ({
    dimension: getDimensionLabel(key),
    value: getAccessibilityLabel(dimensions[key]).value ?? 0,
  }))

  const ariaLabel =
    'Erişilebilirlik radarı: ' +
    DIMENSION_KEYS.map(
      key =>
        `${getDimensionLabel(key)}: ${getAccessibilityLabel(dimensions[key]).label}`,
    ).join(', ')

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={compact ? 'w-full' : 'w-full max-w-md'}
      key={disabilityType}
    >
      <ResponsiveContainer width="100%" height={height}>
        <RadarChart data={data} outerRadius={compact ? '70%' : '78%'}>
          <PolarGrid stroke="oklch(0.92 0.02 290)" />
          {!compact && (
            <PolarAngleAxis
              dataKey="dimension"
              tick={{ fontSize: 11, fill: 'oklch(0.4 0.05 290)', fontWeight: 700 }}
            />
          )}
          {compact && <PolarAngleAxis dataKey="dimension" tick={false} />}
          <Radar
            dataKey="value"
            stroke="oklch(0.38 0.16 295)"
            fill="oklch(0.68 0.13 270)"
            fillOpacity={0.22}
            animationDuration={compact ? 600 : 1200}
            connectNulls={false}
            dot={{ r: compact ? 2 : 4, fill: 'oklch(0.38 0.16 295)' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
