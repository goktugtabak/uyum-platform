import { useState, useRef } from 'react'
import { FileSpreadsheet, Sparkles, FileDown, AlertTriangle, ArrowLeft } from 'lucide-react'
import type { Facility, UserProfile } from '../../types'
import { fetchF3Guide } from '../../lib/f3-service'
import type { F3GuideResult } from '../../lib/f3-service'
import { SpeakButton } from '../ui/SpeakButton'

interface Props {
  facility: Facility
  profile: UserProfile
}

type GuideState = 'idle' | 'loading' | 'success' | 'red-flag'

const DISCLAIMER =
  'Bu rehber yapay zeka destekli araçlar kullanılarak oluşturulmuştur ve profesyonel sağlık tavsiyesi değildir.'

export function F3Guide({ facility, profile }: Props) {
  const [state, setState] = useState<GuideState>('idle')
  const [result, setResult] = useState<F3GuideResult | null>(null)
  const [showOverlay, setShowOverlay] = useState(false)
  const overlayTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const guideRef = useRef<HTMLDivElement>(null)

  async function handleGenerate() {
    setState('loading')
    setShowOverlay(false)
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

  if (state === 'idle') {
    return (
      <div className="relative overflow-hidden rounded-3xl bg-primary-deep p-6 text-primary-foreground">
        <div aria-hidden className="absolute -right-8 -top-8 size-40 rounded-full bg-mint/25 blur-2xl" />
        <FileSpreadsheet className="size-7 opacity-90" aria-hidden />
        <h3 className="mt-3  text-lg font-extrabold">
          İlk ziyaret rehberini oluştur
        </h3>
        <p className="mt-1 max-w-md text-[12.5px] text-primary-foreground/80">
          Profiline ve bu tesisin erişilebilirlik verilerine göre kişiselleştirilmiş bir ziyaret rehberi oluşturalım.
        </p>
        <button
          type="button"
          onClick={handleGenerate}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-bold text-primary-deep transition hover:bg-mint/40"
        >
          <Sparkles className="size-3.5" aria-hidden />
          Rehber Oluştur
        </button>
        <p className="mt-3 text-[10.5px] text-primary-foreground/60">
          Yapay zeka destekli — Türkçe, kişiselleştirilmiş
        </p>
      </div>
    )
  }

  if (state === 'loading') {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-label="Rehber yükleniyor"
        className="relative rounded-3xl bg-card p-6 ring-1 ring-border/40"
      >
        <div className="space-y-2">
          {[100, 80, 90, 70, 85].map((w, i) => (
            <div
              key={i}
              aria-hidden
              className="h-4 animate-pulse rounded bg-muted"
              style={{ width: `${w}%` }}
            />
          ))}
        </div>
        <div className="mt-4 space-y-2">
          {[75, 88, 60].map((w, i) => (
            <div
              key={i}
              aria-hidden
              className="h-4 animate-pulse rounded bg-muted"
              style={{ width: `${w}%` }}
            />
          ))}
        </div>
        {showOverlay && (
          <div
            aria-hidden
            className="absolute inset-0 grid place-items-center rounded-3xl bg-card/80 backdrop-blur"
          >
            <p className="text-sm font-semibold text-primary animate-pulse">
              Rehber hazırlanıyor...
            </p>
          </div>
        )}
      </div>
    )
  }

  if (state === 'red-flag') {
    return (
      <div
        role="alert"
        className="space-y-3 rounded-3xl bg-destructive/8 p-5 ring-1 ring-destructive/30 hc:bg-white hc:ring-black"
      >
        <p className="flex items-center gap-2  text-base font-bold text-destructive hc:text-black">
          <AlertTriangle className="size-5" aria-hidden />
          Lütfen bir sağlık profesyoneline danışın
        </p>
        <p className="text-sm text-foreground/80 hc:text-black">
          Fiziksel semptomlar yaşıyorsanız ziyaretinizi ertelemenizi öneririz.
          Acil bir durumda <strong>112</strong>'yi arayın.
        </p>
        <button
          type="button"
          onClick={() => setState('idle')}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-destructive underline hover:text-destructive/80"
        >
          <ArrowLeft className="size-3.5" aria-hidden /> Geri dön
        </button>
      </div>
    )
  }

  if (state === 'success' && result) {
    const paragraphs = result.guide
      .split(/\n{2,}/)
      .map(p => p.trim())
      .filter(Boolean)

    return (
      <div className="overflow-hidden rounded-3xl bg-card ring-1 ring-border/40">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 bg-primary/5 px-5 py-3">
          <span className="inline-flex items-center gap-2 text-sm font-bold text-primary-deep">
            <FileSpreadsheet aria-hidden className="size-4 text-primary" />
            İlk Ziyaret Rehberi
          </span>
          <div className="flex items-center gap-2">
            <SpeakButton text={result.guide} label="ziyaret rehberini oku" />
            <button
              type="button"
              onClick={handleDownloadPdf}
              aria-label="Rehberi PDF olarak indir"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary-deep"
            >
              <FileDown className="size-3.5" aria-hidden />
              PDF İndir
            </button>
          </div>
        </div>

        <div ref={guideRef} className="space-y-4 px-5 py-5">
          {paragraphs.map((para, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <p className="flex-1 text-[14px] leading-relaxed text-foreground/85 hc:text-black">{para}</p>
              <SpeakButton text={para} className="mt-0.5 shrink-0" />
            </div>
          ))}
        </div>

        <div className="border-t border-border/40 bg-muted/60 px-5 py-3">
          <p className="text-xs italic text-muted-foreground hc:text-black">
            {result.disclaimer ?? DISCLAIMER}
          </p>
        </div>
      </div>
    )
  }

  return null
}
