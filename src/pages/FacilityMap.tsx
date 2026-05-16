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
      .then(setFacilities)
      .finally(() => setLoading(false))
  }, [])

  function handleDisabilityChange(dt: DisabilityType) { setDisabilityType(dt) }
  function handleClearSport() { setSearchParams({}) }
  function handleReset() {
    setDisabilityType(profile?.disabilityType ?? 'wheelchair')
    setSearchParams({})
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pt-2">
      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-[clamp(1.8rem,3vw,2.5rem)] font-extrabold tracking-tight text-primary-deep">
            Tesisleri Keşfet
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Konumuna en uygun, erişilebilir tesisleri haritada keşfet.
          </p>
        </div>
        <DemoBadge label="Konumlar OpenStreetMap, erişilebilirlik mock" />
      </header>

      {/* Filters */}
      <MapFilterBar
        disabilityType={disabilityType}
        sportFilter={sportFilter}
        onDisabilityChange={handleDisabilityChange}
        onClearSport={handleClearSport}
        onReset={handleReset}
      />

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner label="Tesisler yükleniyor" />
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
          {/* Map column */}
          <div className="relative h-[60vh] min-h-[420px] overflow-hidden rounded-[1.5rem] ring-1 ring-border/30 xl:h-[calc(100dvh-12rem)]">
            <MapView
              facilities={facilities}
              disabilityType={disabilityType}
              sportFilter={sportFilter}
            />
          </div>

          {/* List column */}
          <FacilityList
            facilities={facilities}
            disabilityType={disabilityType}
            sportFilter={sportFilter}
          />
        </div>
      )}
    </div>
  )
}
