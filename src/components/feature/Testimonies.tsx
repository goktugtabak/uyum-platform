import { useState } from 'react'
import type { Testimony, DisabilityType } from '../../types'
import {
  loadTestimonies,
  saveTestimony,
  generateTestimonyId,
} from '../../lib/testimony-store'
import { formatRelative } from '../../lib/live-status'

const DISABILITY_LABELS: Record<DisabilityType, string> = {
  wheelchair: 'Tekerlekli Sandalye',
  upper_limb: 'Üst Ekstremite',
  visual:     'Görme Engelli',
  hearing:    'İşitme Engelli',
}

interface Props {
  facilityId: string
  defaultDisabilityType: DisabilityType
}

export function Testimonies({ facilityId, defaultDisabilityType }: Props) {
  const [testimonies, setTestimonies] = useState<Testimony[]>(() =>
    loadTestimonies(facilityId),
  )
  const [formText, setFormText] = useState('')
  const [anonymous, setAnonymous] = useState(true)
  const [displayName, setDisplayName] = useState('')
  const [issueReport, setIssueReport] = useState('')
  const [validationError, setValidationError] = useState('')

  const isEmpty = testimonies.length === 0

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (formText.trim().length < 10) {
      setValidationError('Tanıklık en az 10 karakter olmalıdır.')
      return
    }
    if (formText.trim().length > 500) {
      setValidationError('Tanıklık en fazla 500 karakter olabilir.')
      return
    }

    setValidationError('')

    const newTestimony: Testimony = {
      id: generateTestimonyId(),
      facilityId,
      timestamp: new Date().toISOString(),
      disabilityType: defaultDisabilityType,
      anonymous,
      displayName: anonymous ? undefined : displayName.trim() || undefined,
      text: formText.trim(),
      issueReport: issueReport.trim() || undefined,
    }

    saveTestimony(newTestimony)
    setTestimonies(prev => [newTestimony, ...prev])
    setFormText('')
    setDisplayName('')
    setIssueReport('')
    setAnonymous(true)

    const liveRegion = document.getElementById('aria-live-region')
    if (liveRegion) liveRegion.textContent = 'Tanıklığınız kaydedildi'
  }

  const form = (
    <form onSubmit={handleSubmit} className="space-y-3 pt-2">
      {!anonymous && (
        <div>
          <label htmlFor="testimony-name" className="block text-sm font-medium text-gray-700 hc:text-white mb-1">
            Görünen ad
          </label>
          <input
            id="testimony-name"
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            maxLength={50}
            placeholder="Kullanıcı adı (opsiyonel)"
            className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-uyum-purple hc:bg-black hc:text-white hc:border-white"
          />
        </div>
      )}
      <div>
        <label htmlFor="testimony-text" className="block text-sm font-medium text-gray-700 hc:text-white mb-1">
          Tanıklık <span className="text-gray-400 font-normal">(min 10, max 500 karakter)</span>
        </label>
        <textarea
          id="testimony-text"
          aria-required="true"
          aria-describedby="testimony-help"
          value={formText}
          onChange={e => setFormText(e.target.value)}
          maxLength={500}
          rows={4}
          placeholder="Bu tesisteki deneyimini paylaş..."
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-uyum-purple hc:bg-black hc:text-white hc:border-white resize-vertical"
        />
        <p id="testimony-help" className="text-xs text-gray-400 mt-0.5">
          {formText.length}/500
        </p>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="testimony-anonymous"
          checked={anonymous}
          onChange={e => setAnonymous(e.target.checked)}
          className="rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-uyum-purple"
        />
        <label htmlFor="testimony-anonymous" className="text-sm text-gray-700 hc:text-white">
          Anonim olarak paylaş
        </label>
      </div>
      <div>
        <label htmlFor="testimony-issue" className="block text-sm font-medium text-gray-700 hc:text-white mb-1">
          İletmek istediğin sorun <span className="text-gray-400 font-normal">(opsiyonel)</span>
        </label>
        <input
          id="testimony-issue"
          type="text"
          value={issueReport}
          onChange={e => setIssueReport(e.target.value)}
          maxLength={200}
          placeholder="Örn: Asansör bozuk, rampa dar..."
          className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-uyum-purple hc:bg-black hc:text-white hc:border-white"
        />
      </div>
      {validationError && (
        <p role="alert" className="text-sm text-red-600 hc:text-white font-medium">
          {validationError}
        </p>
      )}
      <button
        type="submit"
        className="rounded bg-uyum-purple px-4 py-2 text-sm font-medium text-white hover:bg-uyum-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-uyum-purple hc:bg-white hc:text-black transition-colors"
      >
        Tanıklık Gönder
      </button>
    </form>
  )

  return (
    <div className="space-y-4">
      {isEmpty ? (
        <div className="text-center py-6 text-gray-500 hc:text-gray-300">
          <p className="mb-4">Bu tesis için henüz tanıklık paylaşılmamış. İlk paylaşan sen ol.</p>
          {form}
        </div>
      ) : (
        <>
          <ul role="list" className="space-y-3">
            {testimonies.map(t => (
              <li key={t.id} className="rounded-lg border border-gray-200 p-4 space-y-2 hc:border-white">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-gray-800 hc:text-white">
                      {t.anonymous || !t.displayName ? 'Anonim' : t.displayName}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600 hc:bg-black hc:text-gray-300">
                      {DISABILITY_LABELS[t.disabilityType]}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 hc:text-gray-300">
                    {formatRelative(t.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 hc:text-white">{t.text}</p>
                {t.issueReport && (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-red-50 text-red-700 border border-red-200 hc:bg-black hc:text-white hc:border-white">
                    ⚠️ {t.issueReport}
                  </div>
                )}
              </li>
            ))}
          </ul>
          <details className="rounded-lg border border-gray-200 hc:border-white">
            <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-uyum-purple hc:text-white hover:bg-gray-50 hc:hover:bg-gray-900 rounded-lg list-none">
              + Tanıklık ekle
            </summary>
            <div className="px-4 pb-4">{form}</div>
          </details>
        </>
      )}
    </div>
  )
}
