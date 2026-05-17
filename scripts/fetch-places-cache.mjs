// Google Places API (New) — build-time tesis verisi çekme scripti
// Ankara'daki spor/fitness tesislerini Places'tan çekip
// public/data/facilities-places-cache.json'a yazar ve
// fotoğrafları public/places-photos/<placeId>-<n>.jpg olarak indirir.
//
// Çalıştır: node scripts/fetch-places-cache.mjs
// Gereksinim: GOOGLE_PLACES_API_KEY env var (ya .env.local ya da shell'de)
//
// API key yoksa "no key, skipping" diyerek exit 0 — CI/Vercel kırılmaz.
// Çıktı dosyaları commit'lenir → demo'da runtime API çağrısı yapılmaz.

import { writeFileSync, mkdirSync, createWriteStream } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pipeline } from 'node:stream/promises'

const __dirname = dirname(fileURLToPath(import.meta.url))

// --- paths ---
const CACHE_PATH  = resolve(__dirname, '../public/data/facilities-places-cache.json')
const PHOTOS_DIR  = resolve(__dirname, '../public/places-photos')

// --- Places API (New) endpoints ---
const BASE = 'https://places.googleapis.com/v1'

const API_KEY = process.env.GOOGLE_PLACES_API_KEY

if (!API_KEY) {
  console.log('[places] GOOGLE_PLACES_API_KEY bulunamadı — script atlanıyor (exit 0).')
  process.exit(0)
}

// Ankara'da aranacak sorgular — 4-5 ilçeye dağıtım
const QUERIES = [
  'spor salonu Çankaya Ankara',
  'fitness merkezi Yenimahalle Ankara',
  'yüzme havuzu Etimesgut Ankara',
  'engelli spor merkezi Ankara',
  'spor kompleksi Keçiören Ankara',
  'spor salonu Gölbaşı Ankara',
]

// Places API (New) kullanılan field'lar — FieldMask
const DETAIL_FIELDS = [
  'id',
  'displayName',
  'formattedAddress',
  'location',
  'nationalPhoneNumber',
  'websiteUri',
  'regularOpeningHours',
  'editorialSummary',
  'rating',
  'userRatingCount',
  'photos',
  'accessibilityOptions',
  'types',
].join(',')

async function textSearch(query) {
  const res = await fetch(`${BASE}/places:searchText`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': API_KEY,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.location',
    },
    body: JSON.stringify({
      textQuery: query,
      languageCode: 'tr',
      locationBias: {
        rectangle: {
          low:  { latitude: 39.7, longitude: 32.5 },
          high: { latitude: 40.05, longitude: 33.05 },
        },
      },
      maxResultCount: 5,
    }),
  })
  if (!res.ok) throw new Error(`textSearch failed: ${res.status} ${await res.text()}`)
  const json = await res.json()
  return json.places ?? []
}

async function getDetails(placeId) {
  const res = await fetch(`${BASE}/places/${placeId}`, {
    headers: {
      'X-Goog-Api-Key': API_KEY,
      'X-Goog-FieldMask': DETAIL_FIELDS,
    },
  })
  if (!res.ok) throw new Error(`getDetails failed for ${placeId}: ${res.status}`)
  return res.json()
}

async function downloadPhoto(photoName, placeId, index) {
  // Places API (New): GET /v1/{name}/media?maxHeightPx=…&key=…
  const url = `${BASE}/${photoName}/media?maxHeightPx=800&maxWidthPx=1200&key=${API_KEY}`
  const res = await fetch(url)
  if (!res.ok) {
    console.warn(`[places] foto indirilemedi (${res.status}): ${photoName}`)
    return null
  }
  mkdirSync(PHOTOS_DIR, { recursive: true })
  const filePath = resolve(PHOTOS_DIR, `${placeId}-${index}.jpg`)
  const fileStream = createWriteStream(filePath)
  await pipeline(res.body, fileStream)
  return `/places-photos/${placeId}-${index}.jpg`
}

function inferType(types) {
  if (!types) return 'spor_salonu'
  const t = types.join('|')
  if (t.includes('swimming_pool')) return 'havuz'
  if (t.includes('stadium'))       return 'atletizm'
  if (t.includes('park'))          return 'açık_alan'
  return 'spor_salonu'
}

function inferSports(types) {
  if (!types) return ['genel-fitness']
  const t = types.join('|')
  const sports = []
  if (t.includes('swimming_pool'))    sports.push('yüzme')
  if (t.includes('gym') || t.includes('fitness_centre') || t.includes('sports_complex')) sports.push('fitness')
  if (t.includes('tennis'))           sports.push('tenis')
  if (t.includes('basketball'))       sports.push('basketbol')
  if (t.includes('stadium'))          sports.push('atletizm')
  return sports.length ? sports : ['genel-fitness']
}

async function main() {
  console.log('[places] Ankara spor tesisleri çekiliyor...')

  // 1. Text Search — tüm sorgular
  const seen = new Set()
  const candidates = []
  for (const query of QUERIES) {
    console.log(`[places] sorgu: "${query}"`)
    try {
      const results = await textSearch(query)
      for (const p of results) {
        if (!seen.has(p.id)) {
          seen.add(p.id)
          candidates.push(p)
        }
      }
    } catch (err) {
      console.warn(`[places] sorgu hatası (${query}): ${err.message}`)
    }
    // Rate limit için kısa bekleme
    await new Promise(r => setTimeout(r, 200))
  }

  console.log(`[places] ${candidates.length} unique tesis bulundu, detay çekiliyor...`)

  // 2. Place Details — top 25
  const top = candidates.slice(0, 25)
  const enriched = []

  for (const c of top) {
    console.log(`[places] detay: ${c.displayName?.text ?? c.id}`)
    try {
      const detail = await getDetails(c.id)

      // 3. Foto indirme — max 2 foto per tesis
      const photos = []
      if (detail.photos && detail.photos.length > 0) {
        for (let i = 0; i < Math.min(2, detail.photos.length); i++) {
          const photoName = detail.photos[i].name
          const authorAttribution = detail.photos[i].authorAttributions?.[0]?.displayName ?? 'Google Maps'
          const localPath = await downloadPhoto(photoName, c.id, i)
          if (localPath) {
            photos.push({
              url: localPath,
              alt: `${detail.displayName?.text ?? 'Tesis'} fotoğrafı`,
              attribution: `Photo: ${authorAttribution}`,
              sourceRef: photoName,
            })
          }
          await new Promise(r => setTimeout(r, 150))
        }
      }

      enriched.push({
        placeId: c.id,
        name: detail.displayName?.text ?? 'İsimsiz Tesis',
        formattedAddress: detail.formattedAddress ?? '',
        location: detail.location ?? { latitude: 0, longitude: 0 },
        phone: detail.nationalPhoneNumber ?? null,
        website: detail.websiteUri ?? null,
        openingHours: detail.regularOpeningHours?.weekdayDescriptions ?? [],
        description: detail.editorialSummary?.text ?? null,
        rating: detail.rating ?? null,
        userRatingsTotal: detail.userRatingCount ?? null,
        wheelchairAccessible: detail.accessibilityOptions?.wheelchairAccessibleEntrance ?? null,
        types: detail.types ?? [],
        photos,
        fetchedAt: new Date().toISOString(),
      })
    } catch (err) {
      console.warn(`[places] detay hatası (${c.id}): ${err.message}`)
    }
    await new Promise(r => setTimeout(r, 250))
  }

  // 4. Cache'e yaz
  mkdirSync(dirname(CACHE_PATH), { recursive: true })
  writeFileSync(
    CACHE_PATH,
    JSON.stringify(
      { fetchedAt: new Date().toISOString(), count: enriched.length, places: enriched },
      null,
      2,
    ),
  )

  console.log(`[places] ✓ ${enriched.length} tesis yazıldı: ${CACHE_PATH}`)
  console.log(`[places] ✓ Fotoğraflar: ${PHOTOS_DIR}`)

  if (enriched.length < 10) {
    console.warn('[places] UYARI: 10\'dan az tesis bulundu. API key ve sorguları kontrol et.')
  }
}

main().catch(err => {
  console.error('[places] HATA:', err.message)
  process.exit(1)
})
