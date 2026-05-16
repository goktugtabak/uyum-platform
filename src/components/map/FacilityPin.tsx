import { useNavigate } from 'react-router-dom'
import { Marker } from 'react-leaflet'
import L from 'leaflet'
import { useFacilityScore, type ScoreColor } from '../../hooks/useFacilityScore'
import { getSportIcon, getSportLabel } from '../../lib/sport-icons'
import type { Facility, DisabilityType } from '../../types'

interface FacilityPinProps {
  facility:       Facility
  disabilityType: DisabilityType
  isHighlighted:  boolean
  isDimmed:       boolean
}

const COLOR_HEX: Record<ScoreColor, string> = {
  green:  '#16a34a',
  yellow: '#eab308',
  red:    '#dc2626',
  gray:   '#6b7280',
}

const COLOR_LABELS: Record<ScoreColor, string> = {
  green:  'iyi erişilebilir',
  yellow: 'kısmen erişilebilir',
  red:    'erişim engeli var',
  gray:   'bilgi yetersiz',
}

function buildDivIcon(
  color: string,
  icon: string,
  isHighlighted: boolean,
  isDimmed: boolean,
  ariaLabel: string,
): L.DivIcon {
  const size = 40
  const opacity = isDimmed ? 0.45 : 1
  const ringStyle = isHighlighted
    ? `box-shadow: 0 0 0 3px #4C2A85, 0 0 0 5px rgba(76,42,133,0.4);`
    : ''

  const html = `
    <div
      role="img"
      aria-label="${ariaLabel.replace(/"/g, '&quot;')}"
      style="
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 4px solid ${color};
        background: #1a1a2e;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        opacity: ${opacity};
        cursor: pointer;
        ${ringStyle}
        box-shadow: ${isHighlighted ? `0 0 0 3px #4C2A85, 0 0 0 5px rgba(76,42,133,0.4)` : '0 2px 6px rgba(0,0,0,0.4)'};
      "
    >${icon}</div>
  `

  return L.divIcon({
    html,
    className: '',
    iconSize:  [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

export function FacilityPin({ facility, disabilityType, isHighlighted, isDimmed }: FacilityPinProps) {
  const navigate = useNavigate()
  const { overall } = useFacilityScore(facility, disabilityType)
  const color    = COLOR_HEX[overall]
  const sportId  = facility.sports[0] ?? ''
  const icon     = getSportIcon(sportId)
  const sportLabel = getSportLabel(sportId)
  const ariaLabel  = `${facility.name} — erişilebilirlik: ${COLOR_LABELS[overall]}, ana spor: ${sportLabel}`

  const divIcon = buildDivIcon(color, icon, isHighlighted, isDimmed, ariaLabel)

  return (
    <Marker
      position={[facility.coordinates.lat, facility.coordinates.lng]}
      icon={divIcon}
      eventHandlers={{
        click: () => navigate(`/facility/${facility.id}`),
        keypress: (e) => {
          if ((e.originalEvent as KeyboardEvent).key === 'Enter') {
            navigate(`/facility/${facility.id}`)
          }
        },
      }}
    />
  )
}
