import { useState, useRef } from 'react'
import type { Facility, UserProfile } from '../../types'
import { fetchF3Guide } from '../../lib/f3-service'
import type { F3GuideResult } from '../../lib/f3-service'
import { SpeakButton } from '../ui/SpeakButton'

interface Props {
  facility: Facility
  profile: UserProfile
}

type GuideState = 'idle' | 'loading' | 'success' | 'red-flag'

const DISCLAIMER = 'Bu rehber yapay zeka destekli araçlar kullanılarak oluşturulmuştur ve profesyonel sağlık tavsiyesi değildir.'

export function F3Guide({ facility, profile }: Props) {
  const [state, setState] = useState<GuideState>('idle')
  const [result, setResult] = useState<F3GuideResult | null>(null)
  const [showOverlay, setShowOverlay] = useState(false)
  const overlayTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const guideRef = useRef<HTMLDivElement>(null)

  async function handleGenerate() {
    setState('loading')
    setShowOverlay(false)

    // Show "Rehber hazırlanıyor..." overlay after 2s
    overlayTimer.current = setTimeout(() => setShowOverlay(true), 2000)

    try {
      const data = await fetchF3Guide(profile, facility)

      clearTimeout(overlayTimer.current ?? undefined)
      setShowOverlay(false)

      if (data.redFlag) {
        setState('red-flag')
        return
      }

      setResult(data)
      setState('success')
    } catch {
      clearTimeout(overlayTimer.current ?? undefined)
      setShowOverlay(false)
      // fetchF3Guide never throws — catches internally and returns fallback
      // This path should not be reachable, but guard just in case
      setState('idle')
    }
  }

  async function handleDownloadPdf() {
    if (!guideRef.current) return

    try {
      const { default: html2canvas } = await import('html2canvas')
      const { jsPDF } = await import('jspdf')

      const canvas = await html2canvas(guideRef.current, { scale: 2, useCORS: true })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

      const pageWidth = pdf.internal.pageSize.getWidth()
      const imgWidth = pageWidth - 20
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight)

      const safeName = facility.name
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9\-çğışöüÇĞİŞÖÜ]/g, '')
        .slice(0, 50)

      pdf.save(`UYUM-${safeName}-ziyaret-rehberi.pdf`)
    } catch (err) {
      console.warn('[F3] PDF generation failed', err)
    }
  }

  // IDLE STATE
  if (state === 'idle') {
    return (
      <div className="border border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center gap-3 text-center">
        <span className="text-3xl" aria-hidden="true">🗺️</span>
        <p className="text-sm text-gray-600 hc:text-gray-200 max-w-sm">
          Profiline ve bu tesisin erişilebilirlik verilerine göre kişiselleştirilmiş bir ziyaret rehberi oluşturabiliriz.
        </p>
        <button
          type="button"
          onClick={handleGenerate}
          className="mt-1 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-uyum-purple text-white text-sm font-heading font-semibold hover:bg-uyum-blue transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-uyum-purple focus-visible:outline-offset-2"
        >
          <span aria-hidden="true">✨</span>
          İlk Ziyaret Rehberi Oluştur
        </button>
        <p className="text-xs text-gray-400 hc:text-gray-400">
          Yapay zeka destekli — Türkçe, kişiselleştirilmiş
        </p>
      </div>
    )
  }

  // LOADING STATE
  if (state === 'loading') {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-label="Rehber yükleniyor"
        className="border rounded-xl p-6 space-y-4 relative"
      >
        {/* Skeleton lines */}
        <div className="space-y-2">
          {[100, 80, 90, 70, 85].map((w, i) => (
            <div
              key={i}
              className="h-4 bg-gray-200 rounded animate-pulse"
              style={{ width: `${w}%` }}
              aria-hidden="true"
            />
          ))}
        </div>
        <div className="space-y-2">
          {[75, 88, 60].map((w, i) => (
            <div
              key={i}
              className="h-4 bg-gray-200 rounded animate-pulse"
              style={{ width: `${w}%` }}
              aria-hidden="true"
            />
          ))}
        </div>
        {showOverlay && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl"
            aria-hidden="true"
          >
            <p className="text-sm font-body text-uyum-purple animate-pulse">
              Rehber hazırlanıyor...
            </p>
          </div>
        )}
      </div>
    )
  }

  // RED FLAG STATE
  if (state === 'red-flag') {
    return (
      <div
        role="alert"
        className="border border-red-300 bg-red-50 rounded-xl p-6 space-y-3 hc:bg-black hc:border-white"
      >
        <p className="text-base font-heading font-semibold text-red-800 hc:text-white">
          ⚠️ Lütfen bir sağlık profesyoneline danışın
        </p>
        <p className="text-sm text-red-700 hc:text-gray-200">
          Fiziksel semptomlar yaşıyorsanız ziyaretinizi ertelemenizi öneririz.
          Acil bir durumda <strong>112</strong>'yi arayın.
        </p>
        <button
          type="button"
          onClick={() => setState('idle')}
          className="text-sm text-red-600 hc:text-white underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500"
        >
          Geri dön
        </button>
      </div>
    )
  }

  // SUCCESS STATE (also covers fallback — looks identical to user)
  if (state === 'success' && result) {
    const paragraphs = result.guide
      .split(/\n{2,}/)
      .map(p => p.trim())
      .filter(Boolean)

    return (
      <div className="border rounded-xl overflow-hidden">
        <div className="bg-uyum-purple/5 px-5 py-3 flex items-center justify-between gap-3 flex-wrap border-b border-gray-100">
          <span className="text-sm font-heading font-semibold text-gray-800 hc:text-white">
            🗺️ İlk Ziyaret Rehberi
          </span>
          <div className="flex items-center gap-2">
            <SpeakButton text={result.guide} label="ziyaret rehberini oku" />
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-heading font-semibold text-white bg-uyum-purple hover:bg-uyum-blue transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-uyum-purple"
              aria-label="Rehberi PDF olarak indir"
            >
              <span aria-hidden="true">📄</span>
              PDF İndir
            </button>
          </div>
        </div>

        <div ref={guideRef} className="px-5 py-4 space-y-4">
          {paragraphs.map((para, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <p className="text-sm text-gray-700 hc:text-gray-100 leading-relaxed flex-1">
                {para}
              </p>
              <SpeakButton text={para} className="flex-shrink-0 self-start mt-0.5" />
            </div>
          ))}
        </div>

        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 hc:bg-gray-900">
          <p className="text-xs text-gray-500 hc:text-gray-300 italic">
            {result.disclaimer ?? DISCLAIMER}
          </p>
        </div>
      </div>
    )
  }

  return null
}
