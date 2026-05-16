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

// Status glyph as a small badge on each pin so color is never the only signal.
const STATUS_GLYPH: Record<ScoreColor, string> = {
  green:  '✓',
  yellow: '~',
  red:    '✕',
  gray:   '?',
}

function buildDivIcon(
  color: string,
  glyph: string,
  icon: string,
  isHighlighted: boolean,
  isDimmed: boolean,
  ariaLabel: string,
): L.DivIcon {
  const size = 40
  const opacity = isDimmed ? 0.45 : 1

  // Teardrop pin (matches design/2026_uyum/tesisler.tsx style) — sport icon centered, status glyph as badge.
  const html = `
    <div
      role="img"
      aria-label="${ariaLabel.replace(/"/g, '&quot;')}"
      style="
        position: relative;
        width: ${size}px;
        height: ${size + 12}px;
        opacity: ${opacity};
        cursor: pointer;
        filter: ${isHighlighted ? 'drop-shadow(0 0 0 #4C2A85)' : 'drop-shadow(0 3px 6px rgba(0,0,0,0.18))'};
      "
    >
      <svg width="${size}" height="${size + 12}" viewBox="0 0 40 52" style="position:absolute;inset:0;">
        <path
          d="M20 2 C 10 2, 2.5 9.5, 2.5 19 C 2.5 31, 20 50, 20 50 C 20 50, 37.5 31, 37.5 19 C 37.5 9.5, 30 2, 20 2 Z"
          fill="${color}"
          stroke="${isHighlighted ? '#4C2A85' : 'rgba(255,255,255,0.6)'}"
          stroke-width="${isHighlighted ? 3 : 2}"
        />
      </svg>
      <span
        aria-hidden="true"
        style="
          position: absolute;
          top: 8px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 16px;
          line-height: 1;
          color: #fff;
        "
      >${icon}</span>
      <span
        aria-hidden="true"
        style="
          position: absolute;
          top: -4px;
          right: -2px;
          min-width: 18px;
          height: 18px;
          padding: 0 4px;
          border-radius: 999px;
          background: #fff;
          color: ${color};
          font-size: 11px;
          line-height: 18px;
          text-align: center;
          font-weight: 800;
          border: 2px solid ${color};
          box-shadow: 0 1px 2px rgba(0,0,0,0.15);
        "
      >${glyph}</span>
    </div>
  `

  return L.divIcon({
    html,
    className: '',
    iconSize:   [size, size + 12],
    iconAnchor: [size / 2, size + 12],
  })
}

export function FacilityPin({ facility, disabilityType, isHighlighted, isDimmed }: FacilityPinProps) {
  const navigate = useNavigate()
  const { overall } = useFacilityScore(facility, disabilityType)
  const color    = COLOR_HEX[overall]
  const glyph    = STATUS_GLYPH[overall]
  const sportId  = facility.sports[0] ?? ''
  const icon     = getSportIcon(sportId)
  const sportLabel = getSportLabel(sportId)
  const ariaLabel  = `${facility.name} — erişilebilirlik: ${COLOR_LABELS[overall]}, ana spor: ${sportLabel}`

  const divIcon = buildDivIcon(color, glyph, icon, isHighlighted, isDimmed, ariaLabel)

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
