import { useMemo, useState } from 'react'
import { Heart, Plus, MessageCircle, Sparkles } from 'lucide-react'
import type { Facility, Testimony, DisabilityType } from '../types'
import { useProfile } from '../contexts/ProfileContext'
import { BackButton } from '../components/ui/BackButton'
import {
  loadTestimonies,
  saveTestimony,
  generateTestimonyId,
} from '../lib/testimony-store'
import { formatRelative } from '../lib/live-status'
import { FilterChip, FilterGroup } from '../components/ui/FilterChip'
import facilitiesData from '../data/facilities.json'

const ALL_FACILITIES = facilitiesData as Facility[]

const DISABILITY_LABELS: Record<DisabilityType, string> = {
  wheelchair: 'Tekerlekli Sandalye',
  visual:     'Görme',
  hearing:    'İşitme',
  upper_limb: 'Üst Ekstremite',
}

const DISABILITY_OPTIONS: ReadonlyArray<{ id: DisabilityType; label: string }> = [
  { id: 'wheelchair', label: 'Tekerlekli Sandalye' },
  { id: 'visual',     label: 'Görme' },
  { id: 'hearing',    label: 'İşitme' },
  { id: 'upper_limb', label: 'Üst Ekstremite' },
]

export function Community() {
  const { profile } = useProfile()
  const [testimonies, setTestimonies] = useState<Testimony[]>(() => loadTestimonies())
  const [filterDisability, setFilterDisability] = useState<DisabilityType | 'all'>('all')
  const [text, setText] = useState('')
  const [anonymous, setAnonymous] = useState(true)
  const [displayName, setDisplayName] = useState('')
  const [facilityId, setFacilityId] = useState(ALL_FACILITIES[0]?.id ?? '')
  const [error, setError] = useState('')

  const filtered = useMemo(() => {
    if (filterDisability === 'all') return testimonies
    return testimonies.filter(t => t.disabilityType === filterDisability)
  }, [testimonies, filterDisability])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (text.trim().length < 10) return setError('Tanıklık en az 10 karakter olmalıdır.')
    if (text.trim().length > 500) return setError('Tanıklık en fazla 500 karakter olabilir.')
    if (!facilityId) return setError('Lütfen bir tesis seç.')
    setError('')

    const newT: Testimony = {
      id: generateTestimonyId(),
      facilityId,
      timestamp: new Date().toISOString(),
      disabilityType: profile?.disabilityTypes[0] ?? 'wheelchair',
      anonymous,
      displayName: anonymous ? undefined : displayName.trim() || undefined,
      text: text.trim(),
    }
    saveTestimony(newT)
    setTestimonies(prev => [newT, ...prev])
    setText('')
    setDisplayName('')

    const live = document.getElementById('aria-live-region')
    if (live) live.textContent = 'Paylaşımın eklendi'
  }

  if (!profile) return null

  return (
    <div className="mx-auto max-w-7xl pt-2">
      <BackButton className="mb-6" />
      <header className="mb-10">
        <p className="text-sm font-semibold text-primary">
          <Sparkles className="mr-1 inline size-3.5" aria-hidden /> Topluluk
        </p>
        <h1 className="mt-2  text-[clamp(2rem,4vw,3rem)] font-extrabold tracking-tight text-primary-deep">
          Topluluk Akışı
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground">
          Spor topluluğundan ilham al, deneyimini paylaş ve diğerlerini destekle.
        </p>
      </header>

      <div className="grid gap-12 xl:grid-cols-[1fr_22rem]">
        {/* Feed */}
        <section aria-labelledby="feed-heading">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
            <h2 id="feed-heading" className="text-xl font-extrabold text-primary-deep">
              Topluluk gönderileri
            </h2>
            <span className="rounded-full bg-mint/50 px-3 py-1 text-[11px] font-bold text-mint-foreground">
              {filtered.length} gönderi
            </span>
          </div>

          <div className="mb-6 rounded-3xl bg-card/85 p-4 ring-1 ring-border/40 backdrop-blur">
            <FilterGroup label="Engel tipi">
              <FilterChip
                role="radio"
                active={filterDisability === 'all'}
                onClick={() => setFilterDisability('all')}
              >
                Hepsi
              </FilterChip>
              {DISABILITY_OPTIONS.map(opt => (
                <FilterChip
                  key={opt.id}
                  role="radio"
                  active={filterDisability === opt.id}
                  onClick={() => setFilterDisability(opt.id)}
                >
                  {opt.label}
                </FilterChip>
              ))}
            </FilterGroup>
          </div>

          {filtered.length === 0 ? (
            <div role="status" className="rounded-3xl bg-card p-6 text-center ring-1 ring-border/40">
              <p className="text-sm text-foreground/80">
                Bu filtreyle eşleşen paylaşım yok. İlk paylaşımı sen yap!
              </p>
            </div>
          ) : (
            <ul role="list" className="space-y-8">
              {filtered.map(t => {
                const facility = ALL_FACILITIES.find(f => f.id === t.facilityId)
                const name = t.anonymous || !t.displayName ? 'Anonim Sporcu' : t.displayName
                return (
                  <li key={t.id} className="rounded-3xl bg-card p-5 ring-1 ring-border/40 hc:bg-white hc:ring-black">
                    <header className="flex items-center gap-3">
                      <div
                        aria-hidden
                        className="grid size-10 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground"
                      >
                        {name[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-foreground hc:text-black">{name}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {formatRelative(t.timestamp)} · {facility?.name ?? 'Tesis'}
                        </div>
                      </div>
                      <span className="shrink-0 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent">
                        {DISABILITY_LABELS[t.disabilityType]}
                      </span>
                    </header>
                    <p className="mt-3 text-[14px] leading-relaxed text-foreground/90 hc:text-black">{t.text}</p>
                    <footer className="mt-3 flex items-center gap-4 text-[12.5px] text-muted-foreground">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 font-semibold text-destructive hover:text-destructive/80"
                      >
                        <Heart aria-hidden className="size-3.5" /> Destekle
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 hover:text-primary"
                      >
                        <MessageCircle aria-hidden className="size-3.5" /> Yorum yap
                      </button>
                    </footer>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        {/* Compose + tips */}
        <aside className="space-y-8">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl bg-card p-5 ring-1 ring-border/40 hc:bg-white hc:ring-black"
          >
            <h3 className="text-base font-extrabold text-primary-deep hc:text-black">
              Sen de paylaş
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Bir tesisteki deneyimini, motivasyonunu ya da sorunu anlat.
            </p>

            <label htmlFor="community-facility" className="mt-4 block text-xs font-semibold text-foreground hc:text-black">
              Tesis
            </label>
            <select
              id="community-facility"
              value={facilityId}
              onChange={e => setFacilityId(e.target.value)}
              className="mt-1 w-full rounded-xl bg-card px-3 py-2 text-sm ring-1 ring-border/60 outline-none focus:ring-2 focus:ring-primary/30 hc:bg-white hc:ring-black"
            >
              {ALL_FACILITIES.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>

            <label htmlFor="community-text" className="mt-3 block text-xs font-semibold text-foreground hc:text-black">
              Paylaşımın
            </label>
            <textarea
              id="community-text"
              value={text}
              onChange={e => setText(e.target.value)}
              rows={4}
              maxLength={500}
              placeholder="Deneyimini paylaş..."
              className="mt-1 w-full resize-y rounded-xl bg-card px-3 py-2 text-sm ring-1 ring-border/60 outline-none focus:ring-2 focus:ring-primary/30 hc:bg-white hc:ring-black"
            />
            <p className="mt-0.5 text-[11px] text-muted-foreground">{text.length}/500</p>

            <div className="mt-3 flex items-center gap-2">
              <input
                type="checkbox"
                id="community-anonymous"
                checked={anonymous}
                onChange={e => setAnonymous(e.target.checked)}
              />
              <label htmlFor="community-anonymous" className="text-xs text-foreground hc:text-black">
                Anonim paylaş
              </label>
            </div>

            {!anonymous && (
              <>
                <label htmlFor="community-name" className="mt-3 block text-xs font-semibold text-foreground hc:text-black">
                  Görünen ad
                </label>
                <input
                  id="community-name"
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  maxLength={50}
                  className="mt-1 w-full rounded-xl bg-card px-3 py-2 text-sm ring-1 ring-border/60 outline-none focus:ring-2 focus:ring-primary/30 hc:bg-white hc:ring-black"
                />
              </>
            )}

            {error && (
              <p role="alert" className="mt-3 text-xs font-semibold text-destructive">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-glow hover:bg-primary-deep"
            >
              <Plus aria-hidden className="size-4" /> Paylaş
            </button>
          </form>

          <div className="rounded-3xl bg-mint/30 p-5 ring-1 ring-mint">
            <h3 className="text-base font-extrabold text-primary-deep">İpuçları</h3>
            <ul role="list" className="mt-3 space-y-2 text-xs text-foreground/85 hc:text-black">
              <li>• Spesifik ol — hangi tesis, hangi spor, hangi engel.</li>
              <li>• Pozitif ya da problemli, her deneyim değerli.</li>
              <li>• Kişisel sağlık bilgini paylaşma — anonim mod aç.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}
