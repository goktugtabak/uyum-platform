import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer } from 'react-leaflet'
import { FacilityPin } from './FacilityPin'
import { MapLegend } from './MapLegend'
import type { Facility, DisabilityType } from '../../types'

interface MapViewProps {
  facilities:     Facility[]
  disabilityType: DisabilityType
  sportFilter:    string | null
}

const ANKARA_CENTER: [number, number] = [39.9334, 32.8597]

export function MapView({ facilities, disabilityType, sportFilter }: MapViewProps) {
  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={ANKARA_CENTER}
        zoom={12}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {facilities.map(facility => {
          const isHighlighted = sportFilter ? facility.sports.includes(sportFilter) : false
          const isDimmed      = sportFilter ? !facility.sports.includes(sportFilter) : false
          return (
            <FacilityPin
              key={facility.id}
              facility={facility}
              disabilityType={disabilityType}
              isHighlighted={isHighlighted}
              isDimmed={isDimmed}
            />
          )
        })}
      </MapContainer>
      <MapLegend />
    </div>
  )
}
