import { useEffect, useRef, useState } from 'react'
import { Check, X, Calendar, Share2 } from 'lucide-react'
import type { SportEvent, Facility } from '../../types'
import { saveRegistration, buildIcsBlob } from '../../lib/event-registration'
import { useProfile } from '../../contexts/ProfileContext'

import sportSwim     from '../../assets/sport-swimming.jpg'
import sportBasket   from '../../assets/sport-basketball.jpg'
import sportTT       from '../../assets/sport-tabletennis.jpg'
import facilityPool  from '../../assets/facility-pool.jpg'
import facilityEryaman from '../../assets/facility-eryaman.jpg'

interface Props {
  event: SportEvent
  facility?: Facility
  open: boolean
  onClose: () => void
}

type ModalState = 'form' | 'success'

const MONTHS_TR = [
  'Ocak','Şubat','Mart','Nisan','Mayıs','Haziran',
  'Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık',
]

function getThumb(sportId: string): string {
  if (sportId.includes('swim') || sportId.includes('aqua') || sportId.includes('waterpolo')) return sportSwim
  if (sportId.includes('basket') || sportId.includes('volley') || sportId.includes('football')) return sportBasket
  if (sportId.includes('tennis') || sportId.includes('table') || sportId.includes('boccia') || sportId.includes('archery') || sportId.includes('goalball')) return sportTT
  if (sportId.includes('yoga') || sportId.includes('pilates')) return facilityPool
  if (sportId.includes('athletics') || sportId.includes('strength')) return facilityEryaman
  return facilityEryaman
}

function formatWhen(dateIso: string, facilityName: string | undefined): string {
  const d = new Date(dateIso)
  const day = d.getDate()
  const month = MONTHS_TR[d.getMonth()]
  const weekday = d.toLocaleDateString('tr-TR', { weekday: 'long' })
  const time = d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
  return `${day} ${month} ${weekday} · ${time}${facilityName ? ' · ' + facilityName : ''}`
}

function validateEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

function validatePhone(v: string): boolean {
  return v.replace(/\D/g, '').length >= 10
}

export function EventRegistrationModal({ event, facility, open, onClose }: Props) {
  const { toggleFavoriteEvent } = useProfile()
  const [state, setState] = useState<ModalState>('form')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string }>({})
  const [ticket, setTicket] = useState('')
  const firstInputRef = useRef<HTMLInputElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  // Auto-focus first field when modal opens
  useEffect(() => {
    if (!open) return
    const id = window.setTimeout(() => firstInputRef.current?.focus(), 50)
    return () => window.clearTimeout(id)
  }, [open])

  // Esc to close
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Focus trap
  useEffect(() => {
    if (!open || state !== 'form') return
    function onTab(e: KeyboardEvent) {
      if (e.key !== 'Tab') return
      const modal = document.getElementById('event-reg-modal')
      if (!modal) return
      const focusable = Array.from(
        modal.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
        )
      ).filter(el => el.offsetParent !== null)
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onTab)
    return () => document.removeEventListener('keydown', onTab)
  }, [open, state])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs: typeof errors = {}
    if (!name.trim()) errs.name = 'Ad Soyad zorunlu'
    if (!validateEmail(email)) errs.email = 'Geçerli bir e-posta girin'
    if (!validatePhone(phone)) errs.phone = 'En az 10 haneli telefon numarası girin'
    if (Object.keys(errs).length) { setErrors(errs); return }

    const reg = saveRegistration({ eventId: event.id, name, email, phone, dateIso: event.date })
    setTicket(reg.ticketNumber)
    toggleFavoriteEvent(event.id)
    setState('success')
    setTimeout(() => closeRef.current?.focus(), 50)
  }

  function handleDownloadIcs() {
    const blob = buildIcsBlob(event, facility)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${event.id}.ics`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: event.title, text: event.description, url: window.location.href }).catch(() => null)
    } else {
      navigator.clipboard.writeText(window.location.href).catch(() => null)
    }
  }

  const registered = event.registered ?? 36
  const capacity   = event.capacity ?? 48

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby="event-reg-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      <div
        id="event-reg-modal"
        className="relative w-full max-w-[440px] overflow-hidden rounded-3xl bg-card shadow-glow ring-1 ring-border/40"
      >
        {/* Close */}
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Kapat"
          className="absolute right-4 top-4 z-10 grid size-9 place-items-center rounded-full border border-border/60 bg-card text-foreground/70 hover:border-foreground/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        >
          <X className="size-4" aria-hidden />
        </button>

        {state === 'form' ? (
          <>
            {/* Event header bar */}
            <div className="flex items-center gap-3 border-b border-border/40 bg-muted/30 px-6 py-4">
              <img
                src={getThumb(event.sport)}
                alt=""
                className="size-11 shrink-0 rounded-2xl object-cover"
              />
              <div className="min-w-0">
                <div className="truncate text-sm font-extrabold text-primary-deep leading-tight">{event.title}</div>
                <div className="mt-0.5 truncate text-xs text-muted-foreground">
                  {formatWhen(event.date, facility?.name)}
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="px-7 pt-6 pb-5 space-y-5">
                <div>
                  <h2 id="event-reg-title" className="font-display text-2xl font-extrabold tracking-tight text-primary-deep">
                    Etkinliğe katıl
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                    Yerini ayırtabilmemiz için kısa bir bilgi formu doldurman gerekiyor.
                  </p>
                </div>

                {/* Ad Soyad */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                    Ad Soyad <span className="text-destructive">*</span>
                  </label>
                  <input
                    ref={firstInputRef}
                    type="text"
                    value={name}
                    onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: undefined })) }}
                    placeholder="Adın ve soyadın"
                    autoComplete="name"
                    className={`w-full h-12 rounded-2xl border px-4 text-sm font-medium text-foreground placeholder:text-muted-foreground bg-background outline-none transition focus:ring-2 focus:ring-primary/30 focus:border-primary ${errors.name ? 'border-destructive' : 'border-border/60'}`}
                  />
                  {errors.name && (
                    <p className="mt-1.5 text-xs text-destructive">{errors.name}</p>
                  )}
                </div>

                {/* E-posta */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                    E-posta <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })) }}
                    placeholder="ornek@uyum.app"
                    autoComplete="email"
                    className={`w-full h-12 rounded-2xl border px-4 text-sm font-medium text-foreground placeholder:text-muted-foreground bg-background outline-none transition focus:ring-2 focus:ring-primary/30 focus:border-primary ${errors.email ? 'border-destructive' : 'border-border/60'}`}
                  />
                  {errors.email ? (
                    <p className="mt-1.5 text-xs text-destructive">{errors.email}</p>
                  ) : (
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      Katılım belgesi ve hatırlatma bu adrese gider.
                    </p>
                  )}
                </div>

                {/* Telefon */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                    Telefon <span className="text-destructive">*</span>
                  </label>
                  <div className={`flex h-12 items-center rounded-2xl border bg-background transition focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary ${errors.phone ? 'border-destructive' : 'border-border/60'}`}>
                    <span className="flex h-full items-center border-r border-border/40 px-3 text-sm font-semibold text-muted-foreground">
                      🇹🇷 +90
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => { setPhone(e.target.value); setErrors(p => ({ ...p, phone: undefined })) }}
                      placeholder="5xx xxx xx xx"
                      autoComplete="tel"
                      className="flex-1 h-full bg-transparent px-3 text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none"
                    />
                  </div>
                  {errors.phone ? (
                    <p className="mt-1.5 text-xs text-destructive">{errors.phone}</p>
                  ) : (
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      SMS ile hatırlatma için. 3. taraflarla paylaşılmaz.
                    </p>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center gap-3 border-t border-border/40 bg-muted/20 px-6 py-4">
                <span className="flex-1 text-xs text-muted-foreground">
                  {registered}/{capacity} kişi kayıtlı
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full border border-border/60 bg-card px-4 py-2.5 text-sm font-bold text-foreground hover:border-foreground/40"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-glow hover:bg-primary-deep transition"
                >
                  Katılımı onayla
                  <Check className="size-3.5" aria-hidden />
                </button>
              </div>
            </form>
          </>
        ) : (
          /* Success state */
          <div className="px-7 pb-7 pt-10 text-center">
            {/* Tick ring */}
            <div className="mx-auto mb-5 grid size-[92px] place-items-center rounded-full"
                 style={{ background: 'radial-gradient(circle at center, rgba(var(--success-rgb,34,197,94),0.18) 0%, rgba(var(--success-rgb,34,197,94),0.06) 60%, transparent 70%)' }}>
              <div className="grid size-[60px] place-items-center rounded-full bg-success text-white shadow-[0_12px_32px_-8px_rgba(34,197,94,0.45)]">
                <Check className="size-7" strokeWidth={3} aria-hidden />
              </div>
            </div>

            <h2 id="event-reg-title" className="font-display text-2xl font-extrabold tracking-tight text-primary-deep mb-2">
              Kaydın tamamlandı!
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-xs mx-auto">
              Yerin ayrıldı. Hatırlatma e-postası ve SMS sana en geç 24 saat içinde ulaşır.
            </p>

            {/* Ticket */}
            <div className="mb-6 grid grid-cols-[56px_1fr_auto] items-center gap-3 rounded-2xl bg-muted/40 p-4 text-left">
              <div className="flex flex-col items-center justify-center rounded-xl bg-card p-1.5 text-center ring-1 ring-border/40">
                <span className="font-mono text-[0.6rem] font-extrabold text-primary leading-tight whitespace-pre-line">
                  {ticket.split('-').join('\n')}
                </span>
              </div>
              <div>
                <div className="text-sm font-extrabold text-primary-deep leading-snug">{event.title}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {formatWhen(event.date, facility?.name)}
                </div>
              </div>
              <span className="shrink-0 rounded-full bg-mint/60 px-2.5 py-1 text-xs font-extrabold text-mint-foreground">
                Onaylı
              </span>
            </div>

            {/* Actions */}
            <div className="mb-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleDownloadIcs}
                className="flex items-center justify-center gap-2 rounded-full border border-border/60 bg-card py-2.5 text-xs font-bold text-foreground hover:border-foreground/40"
              >
                <Calendar className="size-3.5" aria-hidden /> Takvime ekle
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="flex items-center justify-center gap-2 rounded-full border border-border/60 bg-card py-2.5 text-xs font-bold text-foreground hover:border-foreground/40"
              >
                <Share2 className="size-3.5" aria-hidden /> Paylaş
              </button>
            </div>

            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground shadow-glow hover:bg-primary-deep transition"
            >
              Tamam, sayfaya dön
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
