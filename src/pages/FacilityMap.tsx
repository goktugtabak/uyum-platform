import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useProfile } from '../contexts/ProfileContext'
import { loadFacilities } from '../lib/overpass-loader'
import { MapView } from '../components/map/MapView'
import { FacilityList } from '../components/map/FacilityList'
import { MapFilterBar } from '../components/map/MapFilterBar'
import { DemoBadge } from '../components/ui/DemoBadge'
import { Spinner } from '../components/ui/Spinner'
import type { Facility, DisabilityType } from '../types'

export function FacilityMap() {
  const { profile } = useProfile()
  const [searchParams, setSearchParams] = useSearchParams()
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [loading, setLoading] = useState(true)

  const sportFilter = searchParams.get('sport')
  const [disabilityType, setDisabilityType] = useState<DisabilityType>(
    profile?.disabilityType ?? 'wheelchair',
  )

  useEffect(() => {
    loadFacilities()
      .then(data => setFacilities(data))
      .finally(() => setLoading(false))
  }, [])

  function handleDisabilityChange(dt: DisabilityType) {
    setDisabilityType(dt)
  }

  function handleClearSport() {
    setSearchParams({})
  }

  function handleReset() {
    setDisabilityType(profile?.disabilityType ?? 'wheelchair')
    setSearchParams({})
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner label="Tesisler yükleniyor" />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-[calc(100dvh-3.5rem)] md:h-[calc(100dvh-4rem)]">
      {/* Top bar: filter + demo badge */}
      <div className="flex items-center justify-between flex-wrap gap-2 pr-2 md:pr-4">
        <div className="flex-1 min-w-0">
          <MapFilterBar
            disabilityType={disabilityType}
            sportFilter={sportFilter}
            onDisabilityChange={handleDisabilityChange}
            onClearSport={handleClearSport}
            onReset={handleReset}
          />
        </div>
        <div className="px-2 md:px-4 py-2 md:py-3">
          <DemoBadge label="Konumlar OpenStreetMap, erişilebilirlik verileri mock" />
        </div>
      </div>

      {/* Main content: list + map */}
      <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">
        <FacilityList
          facilities={facilities}
          disabilityType={disabilityType}
          sportFilter={sportFilter}
        />
        <div className="flex-1 min-h-[60vh] md:min-h-0 overflow-hidden">
          <MapView
            facilities={facilities}
            disabilityType={disabilityType}
            sportFilter={sportFilter}
          />
        </div>
      </div>
    </div>
  )
}
