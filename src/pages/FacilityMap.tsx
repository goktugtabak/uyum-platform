import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  SlidersHorizontal, ChevronDown, Navigation, Layers, Plus, Minus,
  Accessibility, Waves, ArrowRight, MapPin, ParkingCircle, Dumbbell,
  PersonStanding, Footprints, X,
} from 'lucide-react'
import type { Map as LeafletMap } from 'leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import { useProfile } from '../contexts/ProfileContext'
import { loadFacilities } from '../lib/overpass-loader'
import { pickTopFacilities } from '../lib/facility-rank'
import { useFacilityScore, type ScoreColor } from '../hooks/useFacilityScore'
import { getSportIcon, getSportLabel } from '../lib/sport-icons'
import { Spinner } from '../components/ui/Spinner'
import facilityEryaman from '../assets/facility-eryaman.jpg'
import facilityPool from '../assets/facility-pool.jpg'
import sportSwim from '../assets/sport-swimming.jpg'
import sportBasket from '../assets/sport-basketball.jpg'
import sportTT from '../assets/sport-tabletennis.jpg'
import type { Facility, DisabilityType } from '../types'

const ANKARA_CENTER: [number, number] = [39.9334, 32.8597]

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
const STATUS_GLYPH: Record<ScoreColor, string> = { green: '✓', yellow: '~', red: '✕', gray: '?' }

const FACILITY_THUMBS: string[] = [facilityEryaman, facilityPool, sportBasket, sportTT, sportSwim]

const DISABILITY_OPTIONS: { value: DisabilityType; label: string }[] = [
  { value: 'wheelchair', label: 'Tekerlekli Sandalye' },
  { value: 'visual',     label: 'Görme Engeli' },
  { value: 'hearing',    label: 'İşitme Engeli' },
  { value: 'upper_limb', label: 'Üst Ekstremite' },
]

function getFacilityImage(facility: Facility, fallbackIndex: number): string {
  if (facility.photos?.[0]?.url) return facility.photos[0].url
  if (facility.type === 'havuz') return facilityPool
  const id = facility.id
  if (id.includes('eryaman')) return facilityEryaman
  if (id.includes('havuz') || id.includes('yuzme') || id.includes('olimpik')) return facilityPool
  if (id.includes('basket')) return sportBasket
  if (id.includes('ted') || id.includes('tenis')) return sportTT
  return FACILITY_THUMBS[fallbackIndex % FACILITY_THUMBS.length]
}

function estimatedDistance(facility: Facility): number {
  const lat0 = 39.9208, lng0 = 32.8541
  const dLat = (facility.coordinates.lat - lat0) * 111
  const dLng = (facility.coordinates.lng - lng0) * 95
  const km = Math.sqrt(dLat * dLat + dLng * dLng)
  return Math.round(km * 10) / 10
}

/* -------------------- Leaflet bridge: exposes map instance to overlay buttons -------------------- */

function MapBridge({ onReady }: { onReady: (map: LeafletMap) => void }) {
  const map = useMap()
  useEffect(() => { onReady(map) }, [map, onReady])
  return null
}

/* -------------------- Leaflet teardrop pin (preserves FacilityPin behavior) -------------------- */

function buildDivIcon(color: string, glyph: string, icon: string, isHighlighted: boolean, isDimmed: boolean, ariaLabel: string): L.DivIcon {
  const size = 40
  const opacity = isDimmed ? 0.45 : 1
  const html = `
    <div role="img" aria-label="${ariaLabel.replace(/"/g, '&quot;')}"
      style="position:relative;width:${size}px;height:${size + 12}px;opacity:${opacity};cursor:pointer;
      filter:${isHighlighted ? 'drop-shadow(0 0 0 #4C2A85)' : 'drop-shadow(0 3px 6px rgba(0,0,0,0.18))'};">
      <svg width="${size}" height="${size + 12}" viewBox="0 0 40 52" style="position:absolute;inset:0;">
        <path d="M20 2 C 10 2, 2.5 9.5, 2.5 19 C 2.5 31, 20 50, 20 50 C 20 50, 37.5 31, 37.5 19 C 37.5 9.5, 30 2, 20 2 Z"
          fill="${color}" stroke="${isHighlighted ? '#4C2A85' : 'rgba(255,255,255,0.6)'}" stroke-width="${isHighlighted ? 3 : 2}" />
      </svg>
      <span aria-hidden="true" style="position:absolute;top:8px;left:50%;transform:translateX(-50%);font-size:16px;line-height:1;color:#fff;">${icon}</span>
      <span aria-hidden="true" style="position:absolute;top:-4px;right:-2px;min-width:18px;height:18px;padding:0 4px;border-radius:999px;background:#fff;color:${color};font-size:11px;line-height:18px;text-align:center;font-weight:800;border:2px solid ${color};box-shadow:0 1px 2px rgba(0,0,0,0.15);">${glyph}</span>
    </div>`
  return L.divIcon({ html, className: '', iconSize: [size, size + 12], iconAnchor: [size / 2, size + 12] })
}

function LiveFacilityMarker({
  facility, disabilityType, isHighlighted, isDimmed, onSelect,
}: {
  facility: Facility
  disabilityType: DisabilityType
  isHighlighted: boolean
  isDimmed: boolean
  onSelect: (id: string) => void
}) {
  const { overall } = useFacilityScore(facility, disabilityType)
  const color = COLOR_HEX[overall]
  const glyph = STATUS_GLYPH[overall]
  const sportId = facility.sports[0] ?? ''
  const icon = getSportIcon(sportId)
  const ariaLabel = `${facility.name} — erişilebilirlik: ${COLOR_LABELS[overall]}, ana spor: ${getSportLabel(sportId)}`
  const divIcon = buildDivIcon(color, glyph, icon, isHighlighted, isDimmed, ariaLabel)
  return (
    <Marker
      position={[facility.coordinates.lat, facility.coordinates.lng]}
      icon={divIcon}
      eventHandlers={{ click: () => onSelect(facility.id) }}
    />
  )
}

/* -------------------- Page -------------------- */

export function FacilityMap() {
  const { profile } = useProfile()
  const [searchParams, setSearchParams] = useSearchParams()
  const sportFilter = searchParams.get('sport')

  const [facilities, setFacilities] = useState<Facility[]>([])
  const [loading, setLoading] = useState(true)
  const [disabilityType, setDisabilityType] = useState<DisabilityType>(profile?.disabilityType ?? 'wheelchair')
  const [showSecondary, setShowSecondary] = useState(false)
  const mapRef = useRef<LeafletMap | null>(null)

  useEffect(() => { loadFacilities().then(setFacilities).finally(() => setLoading(false)) }, [])

  const ranked = useMemo(() => {
    if (!profile || facilities.length === 0) return []
    return pickTopFacilities(facilities, profile, facilities.length)
  }, [profile, facilities])

  const handleMapReady = (m: LeafletMap) => { mapRef.current = m }
  const handleZoomIn  = () => mapRef.current?.zoomIn()
  const handleZoomOut = () => mapRef.current?.zoomOut()
  const handleLocate  = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      pos => mapRef.current?.flyTo([pos.coords.latitude, pos.coords.longitude], 14),
      ()  => mapRef.current?.flyTo(ANKARA_CENTER, 13),
      { enableHighAccuracy: false, timeout: 5000 },
    )
  }
  const handleSelectFacility = (id: string) => {
    // Soft scroll the list entry into view; click on the list card itself navigates.
    const el = document.getElementById(`facility-row-${id}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  return (
    <div className="mx-auto max-w-7xl pt-2">
      <header className="mb-6">
        <h1 className="font-display text-[clamp(2rem,3.4vw,2.8rem)] font-extrabold tracking-tight text-primary-deep">
          Tesisleri Keşfet
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Konumuna en uygun, erişilebilir tesisleri haritada keşfet.
        </p>
      </header>

      {/* Filter pills — design row */}
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setShowSecondary(v => !v)}
          aria-expanded={showSecondary}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-glow"
        >
          <SlidersHorizontal className="size-4" aria-hidden /> Filtrele
        </button>
        {['Spor Dalı', 'Erişilebilirlik Özellikleri', 'Diğer Filtreler'].map(f => (
          <button
            key={f}
            type="button"
            onClick={() => setShowSecondary(true)}
            className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-2.5 text-sm font-medium text-foreground/85 ring-1 ring-border/60 hover:ring-primary/40"
          >
            {f} <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden />
          </button>
        ))}
        {sportFilter && (
          <button
            type="button"
            onClick={() => { const sp = new URLSearchParams(searchParams); sp.delete('sport'); setSearchParams(sp) }}
            className="inline-flex items-center gap-2 rounded-full bg-mint/40 px-4 py-2 text-xs font-bold text-mint-foreground hover:bg-mint/60"
          >
            Spor: {getSportLabel(sportFilter)} <X className="size-3.5" aria-hidden />
          </button>
        )}
      </div>

      {/* Working secondary filter strip (real disability dropdown) */}
      {showSecondary && (
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl bg-card px-4 py-3 ring-1 ring-border/40">
          <label className="inline-flex items-center gap-2 text-xs font-semibold text-foreground/75">
            Engel tipi:
            <select
              value={disabilityType}
              onChange={e => setDisabilityType(e.target.value as DisabilityType)}
              className="rounded-full bg-background px-3 py-1.5 text-xs font-medium text-foreground ring-1 ring-border/60 focus:ring-primary"
            >
              {DISABILITY_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => {
              setDisabilityType(profile?.disabilityType ?? 'wheelchair')
              const sp = new URLSearchParams(searchParams); sp.delete('sport'); setSearchParams(sp)
            }}
            className="text-xs font-semibold text-primary hover:text-primary-deep"
          >
            Filtreleri temizle
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner label="Tesisler yükleniyor" />
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
          {/* Map column — real Leaflet inside design's frame */}
          <div>
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.5rem] ring-1 ring-border/30">
              <MapContainer
                center={ANKARA_CENTER}
                zoom={12}
                zoomControl={false}
                scrollWheelZoom
                className="absolute inset-0 h-full w-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapBridge onReady={handleMapReady} />
                {facilities.map(facility => {
                  const isHighlighted = sportFilter ? facility.sports.includes(sportFilter) : false
                  const isDimmed      = sportFilter ? !facility.sports.includes(sportFilter) : false
                  return (
                    <LiveFacilityMarker
                      key={facility.id}
                      facility={facility}
                      disabilityType={disabilityType}
                      isHighlighted={isHighlighted}
                      isDimmed={isDimmed}
                      onSelect={handleSelectFacility}
                    />
                  )
                })}
              </MapContainer>

              {/* Design overlays — sit above tiles, ignore Leaflet drag */}
              <div className="pointer-events-none absolute inset-0 z-[400]">
                {/* Zoom controls */}
                <div className="pointer-events-auto absolute right-4 bottom-20 flex flex-col overflow-hidden rounded-xl bg-white shadow-card ring-1 ring-border/40">
                  <button
                    type="button"
                    onClick={handleZoomIn}
                    aria-label="Yakınlaştır"
                    className="grid size-9 place-items-center border-b border-border/40 text-foreground/80 hover:bg-muted"
                  >
                    <Plus className="size-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={handleZoomOut}
                    aria-label="Uzaklaştır"
                    className="grid size-9 place-items-center text-foreground/80 hover:bg-muted"
                  >
                    <Minus className="size-4" aria-hidden />
                  </button>
                </div>

                {/* Layers button (visual placeholder, matches design) */}
                <button
                  type="button"
                  aria-label="Katmanlar"
                  className="pointer-events-auto absolute right-4 bottom-4 grid size-10 place-items-center rounded-xl bg-white text-foreground/80 shadow-card ring-1 ring-border/40 hover:bg-muted"
                >
                  <Layers className="size-4" aria-hidden />
                </button>

                {/* Konumu Kullan — real geolocation */}
                <button
                  type="button"
                  onClick={handleLocate}
                  className="pointer-events-auto absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-semibold shadow-card ring-1 ring-border/40 hover:bg-muted"
                >
                  <Navigation className="size-3.5 text-primary" aria-hidden /> Konumu Kullan
                </button>
              </div>
            </div>

            {/* Legend + help strip */}
            <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto]">
              <div className="flex flex-col gap-3">
                <span className="text-[12px] font-semibold text-foreground/70">Erişilebilirlik durumu</span>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                  <Legend dot={COLOR_HEX.green}  label="İyi erişilebilir" />
                  <Legend dot={COLOR_HEX.yellow} label="Kısmen erişilebilir" />
                  <Legend dot={COLOR_HEX.red}    label="Erişim engeli var" />
                  <Legend dot={COLOR_HEX.gray}   label="Bilgi yetersiz" />
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-accent/10 px-4 py-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent/15 text-accent">
                  <Waves className="size-4" aria-hidden />
                </span>
                <div className="min-w-0">
                  <div className="text-[12.5px] font-bold text-primary-deep">
                    Erişilebilir bir tesis mi arıyorsun?
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Filtreleri kullanarak ihtiyaçlarına en uygun tesisi bulabilirsin.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right list — real data + design layout */}
          <aside>
            <div className="mb-5 flex items-end justify-between">
              <div>
                <h2 className="font-display text-lg font-extrabold text-primary-deep">
                  Size en uygun tesisler
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {facilities.length} tesis bulundu
                </p>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary"
              >
                <Layers className="size-3.5" aria-hidden /> En Yakın{' '}
                <ChevronDown className="size-3" aria-hidden />
              </button>
            </div>

            <ul className="space-y-5 lg:max-h-[calc(100dvh-16rem)] lg:overflow-y-auto lg:pr-1">
              {ranked.map(({ facility, verifiedCount }, idx) => {
                const scorePct  = Math.round((verifiedCount / 6) * 100)
                const distanceKm = estimatedDistance(facility)
                const isMatched = sportFilter ? facility.sports.includes(sportFilter) : true
                return (
                  <li key={facility.id} id={`facility-row-${facility.id}`} className={isMatched ? '' : 'opacity-40'}>
                    <Link to={`/facility/${facility.id}`} className="group flex gap-3.5">
                      <img
                        src={getFacilityImage(facility, idx)}
                        alt=""
                        className="size-[88px] shrink-0 rounded-2xl object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-[13.5px] font-bold leading-tight text-foreground group-hover:text-primary">
                            {facility.name}
                          </div>
                          <span className="shrink-0 rounded-full bg-mint/55 px-2 py-0.5 text-[10.5px] font-bold text-mint-foreground">
                            {distanceKm} km
                          </span>
                        </div>
                        <span className="mt-1.5 inline-block rounded-md bg-mint/45 px-1.5 py-0.5 text-[10px] font-bold text-mint-foreground">
                          %{scorePct} Uygunluk
                        </span>
                        <div className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                          <MapPin className="size-3" aria-hidden /> {facility.district}
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-1 text-[10.5px] text-muted-foreground">
                          {facility.sports.slice(0, 3).map(id => (
                            <span key={id} className="rounded-full bg-muted px-1.5 py-0.5">
                              {getSportLabel(id)}
                            </span>
                          ))}
                        </div>
                        <div className="mt-2 flex items-center gap-2.5 text-foreground/40">
                          <PersonStanding className="size-3.5" aria-hidden />
                          <ParkingCircle className="size-3.5" aria-hidden />
                          <Dumbbell className="size-3.5" aria-hidden />
                          <Footprints className="size-3.5" aria-hidden />
                          <Accessibility className="size-3.5" aria-hidden />
                        </div>
                      </div>
                    </Link>
                  </li>
                )
              })}
              {ranked.length === 0 && (
                <li className="text-sm text-muted-foreground">
                  Profiline uygun tesis bulunamadı.
                </li>
              )}
            </ul>

            <Link
              to="/map"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 text-sm font-bold text-primary"
            >
              Tüm tesisleri listele <ArrowRight className="size-4" aria-hidden />
            </Link>
          </aside>
        </div>
      )}
    </div>
  )
}

function Legend({ dot, label }: { dot: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] text-foreground/75">
      <span className="size-2.5 rounded-full" style={{ background: dot }} aria-hidden /> {label}
    </span>
  )
}
