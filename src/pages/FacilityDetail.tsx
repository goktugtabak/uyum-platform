import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import type { Facility, DisabilityType } from '../types'
import { useProfile } from '../contexts/ProfileContext'
import { loadFacilities } from '../lib/overpass-loader'
import { getSportIcon, getSportLabel } from '../lib/sport-icons'
import { useFacilityScore } from '../hooks/useFacilityScore'
import { DemoBadge } from '../components/ui/DemoBadge'
import { DisabilityTypeSelect } from '../components/facility/DisabilityTypeSelect'
import { AccessibilityRadar } from '../components/facility/AccessibilityRadar'
import { AccessibilityLabelList } from '../components/facility/AccessibilityLabelList'
import { LiveStatus } from '../components/facility/LiveStatus'
import { Testimonies } from '../components/feature/Testimonies'
import { F3Guide } from '../components/feature/F3Guide'

function FacilityDetailInner({ facility, disabilityType, onDisabilityChange, profile }: {
  facility: Facility
  disabilityType: DisabilityType
  onDisabilityChange: (v: DisabilityType) => void
  profile: NonNullable<ReturnType<typeof useProfile>['profile']>
}) {
  const { dimensions } = useFacilityScore(facility, disabilityType)

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
      {/* Hero block */}
      <section aria-labelledby="facility-heading">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1
              id="facility-heading"
              className="text-2xl font-heading font-bold text-gray-900 hc:text-white"
            >
              {facility.name}
            </h1>
            <p className="text-sm text-gray-500 hc:text-gray-300 mt-1">
              {facility.district}
              {facility.contact.address && ` · ${facility.contact.address}`}
            </p>
            <div className="flex flex-wrap gap-2 mt-3" aria-label="Spor dalları">
              {facility.sports.map(sportId => (
                <span
                  key={sportId}
                  title={getSportLabel(sportId)}
                  className="text-xl"
                  aria-label={getSportLabel(sportId)}
                >
                  {getSportIcon(sportId)}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <DisabilityTypeSelect value={disabilityType} onChange={onDisabilityChange} />
            <DemoBadge label="Erişilebilirlik verileri mock" />
          </div>
        </div>
      </section>

      {/* F1 — Erişilebilirlik Parmak İzi */}
      <section aria-labelledby="f1-heading">
        <h2
          id="f1-heading"
          className="text-lg font-heading font-semibold text-gray-800 hc:text-white mb-4"
        >
          Erişilebilirlik Parmak İzi
        </h2>
        <AccessibilityRadar facility={facility} disabilityType={disabilityType} />
        <AccessibilityLabelList dimensions={dimensions} />
      </section>

      {/* F4 — Canlı Durum */}
      <section aria-labelledby="f4-heading">
        <h2
          id="f4-heading"
          className="text-lg font-heading font-semibold text-gray-800 hc:text-white mb-4"
        >
          Canlı Durum
        </h2>
        <LiveStatus facility={facility} />
      </section>

      {/* Tanıklıklar */}
      <section aria-labelledby="testimonies-heading">
        <h2
          id="testimonies-heading"
          className="text-lg font-heading font-semibold text-gray-800 hc:text-white mb-4"
        >
          Topluluk Tanıklıkları
        </h2>
        <Testimonies facilityId={facility.id} defaultDisabilityType={disabilityType} />
      </section>

      {/* F3 — İlk Ziyaret Rehberi */}
      <section aria-labelledby="f3-heading">
        <h2
          id="f3-heading"
          className="text-lg font-heading font-semibold text-gray-800 hc:text-white mb-4"
        >
          İlk Ziyaret Rehberi
        </h2>
        <F3Guide facility={facility} profile={profile} />
      </section>

      {/* Coaches at this facility — Faz 9 link */}
      {facility.coaches.length > 0 && (
        <section
          aria-labelledby="coaches-link-heading"
          className="rounded-xl border border-gray-200 bg-gray-50 hc:bg-white/5 hc:border-white/10 p-4"
        >
          <h2
            id="coaches-link-heading"
            className="text-sm font-heading font-semibold text-gray-800 hc:text-white mb-2"
          >
            Bu tesiste çalışan koçlar
          </h2>
          <p className="text-sm text-gray-600 hc:text-white/70 font-body mb-3">
            {facility.coaches.length} koç bu tesisle çalışıyor. Engel tipine uyumlu olanlar
            koç dizininde listenin başında.
          </p>
          <Link
            to={`/coaches?facility=${facility.id}`}
            className="
              inline-flex items-center gap-1 text-sm font-heading font-semibold
              text-uyum-purple underline hover:text-uyum-blue
              focus-visible:outline focus-visible:outline-2 focus-visible:outline-uyum-purple rounded
            "
          >
            Koçları gör →
          </Link>
        </section>
      )}

      <div className="pt-4 border-t border-gray-100">
        <Link
          to="/"
          className="text-sm text-uyum-purple underline hover:text-uyum-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-uyum-purple"
        >
          ← Ana sayfaya dön
        </Link>
      </div>
    </div>
  )
}

export function FacilityDetail() {
  const { id } = useParams<{ id: string }>()
  const { profile } = useProfile()
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [loading, setLoading] = useState(true)
  const [disabilityType, setDisabilityType] = useState<DisabilityType>(
    profile?.disabilityType ?? 'wheelchair',
  )

  useEffect(() => {
    loadFacilities().then(data => {
      setFacilities(data)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Yükleniyor...</div>
  }

  const facility = facilities.find(f => f.id === id)

  if (!facility) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center space-y-4">
        <p className="text-lg font-heading text-gray-700 hc:text-white">
          Tesis bulunamadı.
        </p>
        <Link
          to="/"
          className="text-uyum-purple underline hover:text-uyum-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-uyum-purple"
        >
          Ana sayfaya dön
        </Link>
      </div>
    )
  }

  return (
    <FacilityDetailInner
      facility={facility}
      disabilityType={disabilityType}
      onDisabilityChange={setDisabilityType}
      profile={profile!}
    />
  )
}
