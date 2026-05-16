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

export function AccessibilityRadar({ facility, disabilityType, height = 300, compact = false }: Props) {
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
      className={compact ? 'w-full' : 'w-full max-w-md mx-auto'}
      key={disabilityType}
    >
      <ResponsiveContainer width="100%" height={height}>
        <RadarChart data={data} outerRadius={compact ? '70%' : '80%'}>
          <PolarGrid />
          {!compact && (
            <PolarAngleAxis
              dataKey="dimension"
              tick={{ fontSize: 12, fill: 'currentColor' }}
            />
          )}
          {compact && <PolarAngleAxis dataKey="dimension" tick={false} />}
          <Radar
            dataKey="value"
            stroke="#16A34A"
            fill="#16A34A"
            fillOpacity={0.3}
            animationDuration={compact ? 600 : 1500}
            connectNulls={false}
            dot={{ r: compact ? 2 : 4, fill: '#16A34A' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
