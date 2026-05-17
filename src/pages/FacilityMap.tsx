import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  SlidersHorizontal, ChevronDown, Navigation, Layers, Plus, Minus,
  Accessibility, Waves, MapPin, ParkingCircle, Dumbbell,
  PersonStanding, Footprints, X, LayoutList, Map as MapIcon,
} from 'lucide-react'
import type { Map as LeafletMap } from 'leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { useProfile } from '../contexts/ProfileContext'
import { loadFacilities } from '../lib/overpass-loader'
import { pickTopFacilities } from '../lib/facility-rank'
import { useFacilityScore, type ScoreColor } from '../hooks/useFacilityScore'
import { SCORE_LABEL, SCORE_GLYPH, scoreColorFromCount } from '../lib/a11y-labels'
import { ScoreBadge } from '../components/ui/ScoreBadge'
import { getSportLabel } from '../lib/sport-icons'
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
const FACILITY_THUMBS: string[] = [facilityEryaman, facilityPool, sportBasket, sportTT, sportSwim]

const DISABILITY_OPTIONS: { value: DisabilityType; label: string }[] = [
  { value: 'wheelchair', label: 'Tekerlekli Sandalye' },
  { value: 'visual',     label: 'Görme Engeli' },
  { value: 'hearing',    label: 'İşitme Engeli' },
  { value: 'upper_limb', label: 'Üst Ekstremite' },
]


function getFacilityImage(facilityId: string, fallbackIndex: number): string {
  if (facilityId.includes('eryaman')) return facilityEryaman
  if (facilityId.includes('havuz') || facilityId.includes('yuzme') || facilityId.includes('olimpik')) return facilityPool
  if (facilityId.includes('basket')) return sportBasket
  if (facilityId.includes('ted') || facilityId.includes('tenis')) return sportTT
  return FACILITY_THUMBS[fallbackIndex % FACILITY_THUMBS.length]
}

function estimatedDistance(facility: Facility): number {
  const lat0 = 39.9208, lng0 = 32.8541
  const dLat = (facility.coordinates.lat - lat0) * 111
  const dLng = (facility.coordinates.lng - lng0) * 95
  const km = Math.sqrt(dLat * dLat + dLng * dLng)
  return Math.round(km * 10) / 10
}

/* -------------------- Leaflet bridge -------------------- */

function MapBridge({ onReady }: { onReady: (map: LeafletMap) => void }) {
  const map = useMap()
  useEffect(() => { onReady(map) }, [map, onReady])
  return null
}

/* -------------------- Photo thumbnail marker + hover popup -------------------- */

function buildPhotoIcon(imageUrl: string, color: string, isDimmed: boolean, isHighlighted: boolean): L.DivIcon {
  const ring = isHighlighted ? '#4C2A85' : color
  const opacity = isDimmed ? 0.4 : 1
  const shadow = isHighlighted
    ? '0 0 0 3px #4C2A85, 0 4px 12px rgba(76,42,133,0.35)'
    : '0 3px 10px rgba(0,0,0,0.22)'
  const html = `
    <div style="width:52px;height:52px;position:relative;opacity:${opacity};">
      <div style="
        width:52px;height:52px;border-radius:50%;
        border:3px solid ${ring};
        box-shadow:${shadow};
        overflow:hidden;
        background:#e5e7eb;
        cursor:pointer;
        transition:transform 0.15s;
      ">
        <img src="${imageUrl}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;" />
      </div>
      <span style="
        position:absolute;bottom:-4px;right:-4px;
        width:18px;height:18px;border-radius:50%;
        background:${color};border:2px solid #fff;
        box-shadow:0 1px 3px rgba(0,0,0,0.2);
      "></span>
    </div>`
  return L.divIcon({ html, className: '', iconSize: [52, 56], iconAnchor: [26, 56] })
}

function LiveFacilityMarker({
  facility, imageUrl, disabilityType, isHighlighted, isDimmed,
}: {
  facility: Facility
  imageUrl: string
  disabilityType: DisabilityType
  isHighlighted: boolean
  isDimmed: boolean
}) {
  const { overall } = useFacilityScore(facility, disabilityType)
  const color = COLOR_HEX[overall]
  const distanceKm = estimatedDistance(facility)
  const divIcon = buildPhotoIcon(imageUrl, color, isDimmed, isHighlighted)
  const ariaLabel = `${facility.name} — erişilebilirlik: ${SCORE_LABEL[overall]}`

  return (
    <Marker
      position={[facility.coordinates.lat, facility.coordinates.lng]}
      icon={divIcon}
      aria-label={ariaLabel}
    >
      <Popup
        offset={[0, -48]}
        closeButton={false}
        className="facility-photo-popup"
      >
        <Link
          to={`/facility/${facility.id}`}
          style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
        >
          <div style={{
            width: 220,
            borderRadius: 16,
            overflow: 'hidden',
            background: '#fff',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            fontFamily: 'inherit',
          }}>
            <div style={{ position: 'relative', height: 110 }}>
              <img
                src={imageUrl}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <span style={{
                position: 'absolute', bottom: 8, left: 8,
                background: color, color: '#fff',
                fontSize: 10, fontWeight: 700, borderRadius: 99,
                padding: '2px 8px', letterSpacing: 0.3,
              }}>
                <span aria-hidden="true">{SCORE_GLYPH[overall]}</span>{' '}{SCORE_LABEL[overall]}
              </span>
            </div>
            <div style={{ padding: '10px 12px 12px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#320E3B', lineHeight: 1.25, marginBottom: 4 }}>
                {facility.name}
              </div>
              <div style={{ fontSize: 11, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                {facility.district} · {distanceKm} km
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {facility.sports.slice(0, 3).map(id => (
                  <span key={id} style={{
                    fontSize: 10, background: '#f3f4f6', color: '#374151',
                    borderRadius: 99, padding: '2px 7px', fontWeight: 500,
                  }}>
                    {getSportLabel(id)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Link>
      </Popup>
    </Marker>
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
  const [listMode, setListMode] = useState(false)
  const mapRef = useRef<LeafletMap | null>(null)

  useEffect(() => { loadFacilities().then(setFacilities).finally(() => setLoading(false)) }, [])

  const ranked = useMemo(() => {
    if (!profile || facilities.length === 0) return []
    return pickTopFacilities(facilities, profile, facilities.length)
  }, [profile, facilities])

  const handleMapReady = useCallback((m: LeafletMap) => { mapRef.current = m }, [])
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

  return (
    <div className="mx-auto max-w-7xl pt-2">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[clamp(2rem,3.4vw,2.8rem)] font-extrabold tracking-tight text-primary-deep">
            Tesisleri Keşfet
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Konumuna en uygun, erişilebilir tesisleri haritada keşfet.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setListMode(v => !v)}
          className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-4 py-2 text-sm font-semibold text-foreground/80 shadow-sm hover:border-primary/40 hover:text-primary"
        >
          {listMode
            ? <><MapIcon className="size-4" aria-hidden /> Haritaya dön</>
            : <><LayoutList className="size-4" aria-hidden /> Tüm tesisleri listele</>
          }
        </button>
      </header>

      {/* Filter pills */}
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
      ) : listMode ? (
        /* ---- LIST MODE: full-width grid ---- */
        <div>
          <p className="mb-5 text-sm text-muted-foreground">
            {ranked.length} tesis listeleniyor
          </p>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ranked.map(({ facility, verifiedCount }, idx) => {
              const distanceKm = estimatedDistance(facility)
              const imageUrl   = getFacilityImage(facility.id, idx)
              const isMatched  = sportFilter ? facility.sports.includes(sportFilter) : true
              return (
                <li key={facility.id} className={isMatched ? '' : 'opacity-40'}>
                  <Link
                    to={`/facility/${facility.id}`}
                    className="group block overflow-hidden rounded-2xl bg-card ring-1 ring-border/40 transition hover:ring-primary/40 hover:shadow-md"
                  >
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={imageUrl}
                        alt=""
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                      <span className="absolute bottom-3 left-3 backdrop-blur-sm">
                        <ScoreBadge color={scoreColorFromCount(verifiedCount)} size="sm" />
                      </span>
                      <span className="absolute bottom-3 right-3 rounded-full bg-mint/80 px-2.5 py-1 text-[11px] font-bold text-mint-foreground backdrop-blur-sm">
                        {distanceKm} km
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="text-[14px] font-bold leading-tight text-foreground group-hover:text-primary">
                        {facility.name}
                      </h3>
                      <div className="mt-1.5 flex items-center gap-1 text-[11.5px] text-muted-foreground">
                        <MapPin className="size-3" aria-hidden /> {facility.district}
                      </div>
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {facility.sports.slice(0, 3).map(id => (
                          <span key={id} className="rounded-full bg-muted px-2 py-0.5 text-[10.5px] text-muted-foreground">
                            {getSportLabel(id)}
                          </span>
                        ))}
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-foreground/35">
                        <PersonStanding className="size-3.5" aria-hidden />
                        <ParkingCircle  className="size-3.5" aria-hidden />
                        <Dumbbell       className="size-3.5" aria-hidden />
                        <Footprints     className="size-3.5" aria-hidden />
                        <Accessibility  className="size-3.5" aria-hidden />
                      </div>
                    </div>
                  </Link>
                </li>
              )
            })}
            {ranked.length === 0 && (
              <li className="col-span-full text-sm text-muted-foreground">
                Profiline uygun tesis bulunamadı.
              </li>
            )}
          </ul>
        </div>
      ) : (
        /* ---- MAP MODE: harita + sağ liste ---- */
        <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
          {/* Map column */}
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
                {facilities.map((facility, idx) => {
                  const isHighlighted = sportFilter ? facility.sports.includes(sportFilter) : false
                  const isDimmed      = sportFilter ? !facility.sports.includes(sportFilter) : false
                  return (
                    <LiveFacilityMarker
                      key={facility.id}
                      facility={facility}
                      imageUrl={getFacilityImage(facility.id, idx)}
                      disabilityType={disabilityType}
                      isHighlighted={isHighlighted}
                      isDimmed={isDimmed}
                    />
                  )
                })}
              </MapContainer>

              {/* Map overlays */}
              <div className="pointer-events-none absolute inset-0 z-[400]">
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

                <button
                  type="button"
                  aria-label="Katmanlar"
                  className="pointer-events-auto absolute right-4 bottom-4 grid size-10 place-items-center rounded-xl bg-white text-foreground/80 shadow-card ring-1 ring-border/40 hover:bg-muted"
                >
                  <Layers className="size-4" aria-hidden />
                </button>

                <button
                  type="button"
                  onClick={handleLocate}
                  className="pointer-events-auto absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-semibold shadow-card ring-1 ring-border/40 hover:bg-muted"
                >
                  <Navigation className="size-3.5 text-primary" aria-hidden /> Konumu Kullan
                </button>
              </div>
            </div>

            {/* Legend */}
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

          {/* Right list panel */}
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
                const distanceKm = estimatedDistance(facility)
                const isMatched  = sportFilter ? facility.sports.includes(sportFilter) : true
                return (
                  <li key={facility.id} id={`facility-row-${facility.id}`} className={isMatched ? '' : 'opacity-40'}>
                    <Link to={`/facility/${facility.id}`} className="group flex gap-3.5">
                      <img
                        src={getFacilityImage(facility.id, idx)}
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
                        <span className="mt-1.5 inline-block">
                          <ScoreBadge color={scoreColorFromCount(verifiedCount)} size="sm" />
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
                          <ParkingCircle  className="size-3.5" aria-hidden />
                          <Dumbbell       className="size-3.5" aria-hidden />
                          <Footprints     className="size-3.5" aria-hidden />
                          <Accessibility  className="size-3.5" aria-hidden />
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

            <button
              type="button"
              onClick={() => setListMode(true)}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full border border-border/60 py-2.5 text-sm font-bold text-primary transition hover:bg-primary/5"
            >
              <LayoutList className="size-4" aria-hidden />
              Tüm tesisleri listele
            </button>
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
