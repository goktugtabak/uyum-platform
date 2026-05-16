import { useState } from 'react'
import { AlertTriangle, Plus } from 'lucide-react'
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
  const [testimonies, setTestimonies] = useState<Testimony[]>(() => loadTestimonies(facilityId))
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
          <label htmlFor="testimony-name" className="mb-1 block text-sm font-semibold text-foreground hc:text-black">
            Görünen ad
          </label>
          <input
            id="testimony-name"
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            maxLength={50}
            placeholder="Kullanıcı adı (opsiyonel)"
            className="w-full rounded-xl bg-card px-3 py-2 text-sm ring-1 ring-border/60 outline-none focus:ring-2 focus:ring-primary/30 hc:bg-white hc:ring-black"
          />
        </div>
      )}
      <div>
        <label htmlFor="testimony-text" className="mb-1 block text-sm font-semibold text-foreground hc:text-black">
          Tanıklık <span className="font-normal text-muted-foreground">(min 10, max 500 karakter)</span>
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
          className="w-full resize-y rounded-xl bg-card px-3 py-2 text-sm ring-1 ring-border/60 outline-none focus:ring-2 focus:ring-primary/30 hc:bg-white hc:ring-black"
        />
        <p id="testimony-help" className="mt-0.5 text-xs text-muted-foreground">
          {formText.length}/500
        </p>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="testimony-anonymous"
          checked={anonymous}
          onChange={e => setAnonymous(e.target.checked)}
          className="rounded"
        />
        <label htmlFor="testimony-anonymous" className="text-sm text-foreground hc:text-black">
          Anonim olarak paylaş
        </label>
      </div>
      <div>
        <label htmlFor="testimony-issue" className="mb-1 block text-sm font-semibold text-foreground hc:text-black">
          İletmek istediğin sorun <span className="font-normal text-muted-foreground">(opsiyonel)</span>
        </label>
        <input
          id="testimony-issue"
          type="text"
          value={issueReport}
          onChange={e => setIssueReport(e.target.value)}
          maxLength={200}
          placeholder="Örn: Asansör bozuk, rampa dar..."
          className="w-full rounded-xl bg-card px-3 py-2 text-sm ring-1 ring-border/60 outline-none focus:ring-2 focus:ring-primary/30 hc:bg-white hc:ring-black"
        />
      </div>
      {validationError && (
        <p role="alert" className="text-sm font-semibold text-destructive">
          {validationError}
        </p>
      )}
      <button
        type="submit"
        className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground hover:bg-primary-deep"
      >
        Tanıklık Gönder
      </button>
    </form>
  )

  return (
    <div className="space-y-4">
      {isEmpty ? (
        <div className="rounded-3xl bg-card/85 p-6 ring-1 ring-border/40 hc:bg-white hc:ring-black">
          <p className="mb-4 text-sm text-muted-foreground hc:text-black">
            Bu tesis için henüz tanıklık paylaşılmamış. İlk paylaşan sen ol.
          </p>
          {form}
        </div>
      ) : (
        <>
          <ul role="list" className="space-y-3">
            {testimonies.map(t => (
              <li
                key={t.id}
                className="space-y-2 rounded-2xl bg-card p-4 ring-1 ring-border/40 hc:bg-white hc:ring-black"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground hc:text-black">
                      {t.anonymous || !t.displayName ? 'Anonim' : t.displayName}
                    </span>
                    <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent">
                      {DISABILITY_LABELS[t.disabilityType]}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatRelative(t.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-foreground/85 hc:text-black">{t.text}</p>
                {t.issueReport && (
                  <div className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
                    <AlertTriangle aria-hidden className="size-3" /> {t.issueReport}
                  </div>
                )}
              </li>
            ))}
          </ul>
          <details className="rounded-2xl ring-1 ring-border/40 hc:ring-black">
            <summary className="flex cursor-pointer items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold text-primary hover:bg-primary/5 hc:text-black">
              <Plus aria-hidden className="size-4" /> Tanıklık ekle
            </summary>
            <div className="px-4 pb-4">{form}</div>
          </details>
        </>
      )}
    </div>
  )
}
