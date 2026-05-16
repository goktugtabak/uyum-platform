// Ankara bbox: 39.7 / 32.5 / 40.05 / 33.05
// Overpass API'den spor tesisi verisi cekip public/data/facilities-overpass-cache.json'a yazar.
// Bu script DEMO ONCESI bir kere calistirilir, cikti commit edilir.
// Build asamasinda CALISMAZ — sadece veri toplama icin.

import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outPath = resolve(__dirname, '../public/data/facilities-overpass-cache.json')

const BBOX = { south: 39.7, west: 32.5, north: 40.05, east: 33.05 }
const BBOX_STR = `${BBOX.south},${BBOX.west},${BBOX.north},${BBOX.east}`

const query = `
[out:json][timeout:30];
(
  node["leisure"~"sports_centre|fitness_centre|swimming_pool|stadium|pitch"](${BBOX_STR});
  way ["leisure"~"sports_centre|fitness_centre|swimming_pool|stadium|pitch"](${BBOX_STR});
);
out center tags;
`.trim()

async function main() {
  console.log('[overpass] sorgu gonderiliyor...')
  const ENDPOINTS = [
    'https://overpass.kumi.systems/api/interpreter',
    'https://overpass.openstreetmap.ru/api/interpreter',
    'https://overpass-api.de/api/interpreter',
  ]

  let res = null
  let lastErr = ''
  for (const endpoint of ENDPOINTS) {
    console.log(`[overpass] deneniyor: ${endpoint}`)
    const url = endpoint + '?data=' + encodeURIComponent(query)
    try {
      res = await fetch(url, { headers: { 'Accept': 'application/json' } })
      if (res.ok) break
      lastErr = `HTTP ${res.status} from ${endpoint}`
      res = null
    } catch (e) {
      lastErr = String(e)
      res = null
    }
  }
  if (!res) throw new Error(`Tum endpoint'ler basarisiz. Son hata: ${lastErr}`)

  const json = await res.json()
  const elements = json.elements ?? []

  const facilities = elements
    .map((el, i) => ({
      id: `overpass-${el.id ?? i}`,
      osmType: el.type,
      name: el.tags?.name ?? null,
      leisure: el.tags?.leisure ?? 'unknown',
      sport: el.tags?.sport ?? null,
      lat: el.lat ?? el.center?.lat ?? null,
      lng: el.lon ?? el.center?.lon ?? null,
      addr: el.tags?.['addr:full'] ?? el.tags?.['addr:street'] ?? null,
      website: el.tags?.website ?? null,
      phone: el.tags?.phone ?? null,
      wheelchair: el.tags?.wheelchair ?? null,
      tags: el.tags ?? {},
    }))
    .filter(f => f.lat != null && f.lng != null && f.name != null)

  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(
    outPath,
    JSON.stringify(
      {
        fetchedAt: new Date().toISOString(),
        bbox: BBOX,
        count: facilities.length,
        facilities,
      },
      null,
      2,
    ),
  )

  console.log(`[overpass] ${facilities.length} tesis yazildi: ${outPath}`)

  if (facilities.length < 20) {
    console.warn(`[overpass] UYARI: ${facilities.length} tesis bulundu, beklenen en az 20.`)
    console.warn('[overpass] bbox genisletmeyi ya da leisure filtresini gevsetmeyi dene.')
  }
}

main().catch(err => {
  console.error('[overpass] HATA:', err.message)
  process.exit(1)
})
