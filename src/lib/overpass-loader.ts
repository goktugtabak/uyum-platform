// Manual facilities are primary; Overpass cache is decorative / future-merge target.
// DoD requires page to render when cache file is missing.
import type { Facility } from '../types'
import manualFacilities from '../data/facilities.json'

export async function loadFacilities(): Promise<Facility[]> {
  // Warm up the Overpass cache in the background for informational purposes only.
  fetch('/data/facilities-overpass-cache.json')
    .then(r => r.json())
    .then((data: unknown[]) => {
      if (import.meta.env.DEV) {
        console.info(`[overpass] cache loaded ${data.length} records`)
      }
    })
    .catch(() => {
      console.warn('[overpass] cache unavailable — using manual facilities only')
    })

  return manualFacilities as Facility[]
}
