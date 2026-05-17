import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  Accessibility, Eye, Ear, Hand,
  Activity, Heart, Target, Users, Sparkles, Trophy,
  PersonStanding, ArmchairIcon, Footprints,
  ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck, MapPin, Calendar, GraduationCap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { UyumLogo } from '../components/ui/UyumLogo'
import { useProfile } from '../contexts/ProfileContext'
import type { DisabilityType, MobilityLevel, Goal, UserProfile } from '../types'

/* ---------- Constants ---------- */

const DISABILITY_OPTIONS: ReadonlyArray<{ value: DisabilityType; label: string; description: string; icon: LucideIcon }> = [
  { value: 'wheelchair', label: 'Tekerlekli sandalye kullanıyorum', description: 'Tekerlekli sandalye ile günlük yaşamını sürdürüyorsun.', icon: Accessibility },
  { value: 'visual',     label: 'Görme engelliyim',                  description: 'Kısmi veya tamamen görme engeliyim.',                  icon: Eye },
  { value: 'hearing',    label: 'İşitme engelliyim',                 description: 'Kısmi veya tamamen işitme engeliyim.',                 icon: Ear },
  { value: 'upper_limb', label: 'Üst ekstremite kısıtım var',        description: 'Kol veya el fonksiyon kaybı yaşıyorum, zorluk çekiyorum.', icon: Hand },
]

const MOBILITY_OPTIONS: ReadonlyArray<{ value: MobilityLevel; label: string; description: string; icon: LucideIcon }> = [
  { value: 'sitting',     label: 'Oturarak',  description: 'Aktiviteleri oturarak yapıyorum.',                icon: ArmchairIcon  },
  { value: 'supported',   label: 'Destekle',  description: 'Yardımcı ekipman veya kişiyle hareket ediyorum.', icon: PersonStanding },
  { value: 'independent', label: 'Bağımsız',  description: 'Bağımsız olarak hareket edebiliyorum.',           icon: Footprints     },
]

const GOAL_OPTIONS: ReadonlyArray<{ value: Goal; label: string; description: string; icon: LucideIcon }> = [
  { value: 'strength',    label: 'Güçlenmek',           description: 'Kas gücümü artırmak istiyorum.',                   icon: Activity },
  { value: 'flexibility', label: 'Esnekliğimi artırmak', description: 'Daha esnek ve hareket aralığı geniş olmak istiyorum.', icon: Sparkles },
  { value: 'social',      label: 'Sosyal olmak',        description: 'Spor aracılığıyla sosyal bağlar kurmak istiyorum.', icon: Heart   },
  { value: 'compete',     label: 'Rekabet etmek',       description: 'Yarışmalara katılmak istiyorum.',                  icon: Trophy  },
]

const DEFAULT_ACCESSIBILITY: UserProfile['accessibility'] = {
  colorblindMode: 'none',
  highContrast:   false,
  fontSize:       'normal',
  speechEnabled:  false,
}

const DISABILITY_LABELS: Record<DisabilityType, string> = {
  wheelchair: 'Tekerlekli sandalye kullanıyorum',
  visual:     'Görme engelliyim',
  hearing:    'İşitme engelliyim',
  upper_limb: 'Üst ekstremite kısıtım var',
}
const MOBILITY_LABELS: Record<MobilityLevel, string> = {
  sitting:     'Oturarak',
  supported:   'Destekle',
  independent: 'Bağımsız',
}
const GOAL_LABELS: Record<Goal, string> = {
  strength:    'Güçlenmek',
  flexibility: 'Esnekliğimi artırmak',
  social:      'Sosyal olmak',
  compete:     'Rekabet etmek',
}

/* ---------- Route step normalization ---------- */

const STEP_PATHS = ['welcome', 'disability', 'goal', 'confirm'] as const
type StepName = typeof STEP_PATHS[number]

function pathFor(step: StepName): string {
  return step === 'welcome' ? '/onboarding' : `/onboarding/${step}`
}

function stepIndex(step: StepName): number {
  return STEP_PATHS.indexOf(step)
}

function normalizeStep(raw: string | undefined): StepName {
  if (!raw) return 'welcome'
  return (STEP_PATHS as readonly string[]).includes(raw) ? (raw as StepName) : 'welcome'
}

/* ---------- Session-scoped draft persistence ---------- */

const DRAFT_KEY = 'uyum:onboarding-draft'

interface Draft {
  disabilityType: DisabilityType | null
  mobilityLevel:  MobilityLevel  | null
  goal:           Goal           | null
}

function loadDraft(): Draft {
  if (typeof window === 'undefined') return { disabilityType: null, mobilityLevel: null, goal: null }
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY)
    if (!raw) return { disabilityType: null, mobilityLevel: null, goal: null }
    const parsed = JSON.parse(raw) as Draft
    return {
      disabilityType: parsed.disabilityType ?? null,
      mobilityLevel:  parsed.mobilityLevel  ?? null,
      goal:           parsed.goal           ?? null,
    }
  } catch {
    return { disabilityType: null, mobilityLevel: null, goal: null }
  }
}

function saveDraft(d: Draft): void {
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(d))
  } catch {
    // quota exceeded — silently ignore
  }
}

function clearDraft(): void {
  try { sessionStorage.removeItem(DRAFT_KEY) } catch { /* ignore */ }
}

/* ---------- Page ---------- */

export function Onboarding() {
  const navigate = useNavigate()
  const { setProfile } = useProfile()
  const { step: stepParam } = useParams<{ step?: string }>()
  const step = normalizeStep(stepParam)

  // Hydrate selections from sessionStorage so refresh / back-forward keeps progress
  const initial = useMemo(() => loadDraft(), [])
  const [disabilityType, setDisabilityType] = useState<DisabilityType | null>(initial.disabilityType)
  const [mobilityLevel, setMobilityLevel]   = useState<MobilityLevel  | null>(initial.mobilityLevel)
  const [goal, setGoal]                     = useState<Goal           | null>(initial.goal)

  useEffect(() => {
    saveDraft({ disabilityType, mobilityLevel, goal })
  }, [disabilityType, mobilityLevel, goal])

  function announce(msg: string) {
    const region = document.getElementById('aria-live-region')
    if (region) region.textContent = msg
  }

  function gotoStep(target: StepName) {
    navigate(pathFor(target))
  }

  function next() {
    if (step === 'welcome') {
      gotoStep('disability')
      announce('Adım 2/4. Engelli durumunu seç.')
    } else if (step === 'disability' && disabilityType) {
      gotoStep('goal')
      announce('Adım 3/4. Hedefini seç.')
    } else if (step === 'goal' && goal) {
      gotoStep('confirm')
      announce('Adım 4/4. Profilini onayla.')
    } else if (step === 'confirm' && disabilityType && goal) {
      const mobility = mobilityLevel ?? 'independent'
      setProfile({
        disabilityType,
        mobilityLevel:      mobility,
        goal,
        city:               'Ankara',
        favoriteFacilities: [],
        favoriteEvents:     [],
        accessibility:      DEFAULT_ACCESSIBILITY,
      })
      clearDraft()
      announce('Profilin oluşturuldu. Ana sayfaya yönlendiriliyorsun.')
      navigate('/')
    }
  }

  function back() {
    if (step === 'welcome')        navigate('/')
    else if (step === 'disability') gotoStep('welcome')
    else if (step === 'goal')       gotoStep('disability')
    else if (step === 'confirm')    gotoStep('goal')
  }

  const canProceed =
    step === 'welcome' ||
    (step === 'disability' && disabilityType !== null) ||
    (step === 'goal'       && goal           !== null) ||
    (step === 'confirm'    && mobilityLevel  !== null)

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Ambient lights */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 right-1/3 h-[40rem] w-[40rem] rounded-full bg-accent/15 blur-[150px]" />
        <div className="absolute top-1/2 -left-32 h-[34rem] w-[34rem] rounded-full bg-mint/40 blur-[140px]" />
        <div className="absolute -bottom-40 right-0 h-[30rem] w-[30rem] rounded-full bg-sky/40 blur-[140px]" />
      </div>

      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 md:px-8">
        {step === 'welcome' ? (
          <Link to="/" aria-label="UYUM Ana Sayfa" className="flex items-center gap-2">
            <UyumLogo />
            <span className="font-display text-lg font-extrabold text-primary-deep">UYUM</span>
          </Link>
        ) : (
          <button
            type="button"
            onClick={back}
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="size-4" aria-hidden /> Geri
          </button>
        )}
        <ProgressBar step={step} />
      </header>

      <main className="mx-auto grid max-w-6xl items-start gap-10 px-4 py-6 md:grid-cols-12 md:px-8 md:py-10">
        {/* Left rail — copy + illustration */}
        <aside className="md:col-span-5 lg:col-span-5">
          <LeftRail step={step} />
        </aside>

        {/* Right card */}
        <section className="md:col-span-7 lg:col-span-7">
          <div className="rounded-3xl bg-card/85 p-6 ring-1 ring-border/40 backdrop-blur shadow-soft md:p-8">
            {step === 'welcome' && (
              <WelcomeStep onPrimary={next} />
            )}

            {step === 'disability' && (
              <ChoiceGrid
                title="Engellilik durumunu seç"
                subtitle="Sana doğru önerileri verebilmemiz için engelli durumunu seç."
                options={DISABILITY_OPTIONS}
                selected={disabilityType}
                onSelect={setDisabilityType}
              />
            )}

            {step === 'goal' && (
              <ChoiceGrid
                title="Sana en uygun spor önerilerini yapabilmemiz için hedeflerini seçelim."
                subtitle="Birden fazla hedefin olabilir — şimdilik en önemli olanı seç."
                options={GOAL_OPTIONS}
                selected={goal}
                onSelect={setGoal}
              />
            )}

            {step === 'confirm' && (
              <ConfirmStep
                disabilityType={disabilityType}
                mobilityLevel={mobilityLevel}
                goal={goal}
                onMobilitySelect={setMobilityLevel}
                onEditDisability={() => gotoStep('disability')}
                onEditGoal={() => gotoStep('goal')}
              />
            )}

            {step !== 'welcome' && (
              <div className="mt-8 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={back}
                  className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-2.5 text-sm font-semibold text-foreground ring-1 ring-border/60 hover:ring-primary/40"
                >
                  <ArrowLeft className="size-4" aria-hidden /> Geri
                </button>

                <button
                  type="button"
                  onClick={next}
                  disabled={!canProceed}
                  aria-disabled={!canProceed}
                  className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition ${
                    canProceed
                      ? 'bg-primary text-primary-foreground shadow-glow hover:bg-primary-deep'
                      : 'cursor-not-allowed bg-muted text-muted-foreground'
                  }`}
                >
                  {step === 'confirm' ? 'Kaydolmaya başla' : 'Devam Et'}
                  <ArrowRight className="size-4" aria-hidden />
                </button>
              </div>
            )}
          </div>

          {/* Footer hints — design ile birebir */}
          {step === 'disability' && (
            <p className="mt-4 text-center text-[12.5px] text-muted-foreground">
              İstediğin zaman profil ayarlarından değiştirebilirsin.
            </p>
          )}
          {step === 'goal' && (
            <p className="mt-4 text-center text-[12.5px] text-muted-foreground">
              Birden fazla hedef seçebilirsin. Zamanla hedeflerini güncelleyebilirsin.
            </p>
          )}
          {step === 'confirm' && (
            <p className="mt-4 text-center text-[12.5px] text-muted-foreground">
              Profil ayarları daha sonra istediğin zaman güncellenebilir.
            </p>
          )}
        </section>
      </main>
    </div>
  )
}

/* ---------- Progress bar ---------- */

function ProgressBar({ step }: { step: StepName }) {
  const idx = stepIndex(step)
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground" aria-label={`Adım ${idx + 1} / 4`}>
      <span className="hidden font-semibold text-foreground sm:inline">Adım</span>
      <div className="flex items-center gap-1.5" aria-hidden>
        {STEP_PATHS.map((_, i) => (
          <span
            key={i}
            className={`h-2 w-7 rounded-full transition ${
              i <= idx ? 'bg-primary' : 'bg-border'
            }`}
          />
        ))}
      </div>
      <span className="ml-1 font-semibold text-primary">{idx + 1}/4</span>
    </div>
  )
}

/* ---------- Left rail (per step) ---------- */

function LeftRail({ step }: { step: StepName }) {
  const map: Record<StepName, { eyebrow?: string; title: string; body: string; icons: LucideIcon[] }> = {
    welcome: {
      eyebrow: 'Hoş Geldin',
      title:   'Spor herkes içindir. Bizimle uyum içinde harekete geç.',
      body:    'UYUM, engelli bireylerin spor ve fiziksel aktivitelere erişimini kolaylaştıran bir platformdur. Yakındaki tesisleri keşfet, etkinliklere katıl ve topluluğun bir parçası ol.',
      icons:   [MapPin, Activity, Calendar, Users],
    },
    disability: {
      title: 'Seni daha iyi tanımak istiyoruz',
      body:  'Doğru öneriler ve rehberlik sunabilmek için engelli durumunu seçmemiz önemli. Verilerin sadece sana özel öneriler oluşturmak için kullanılır.',
      icons: [Accessibility, Eye, Ear, Hand],
    },
    goal: {
      title: 'Hedeflerini öğrenelim',
      body:  'Spor ve fiziksel aktiviteyle ilgili hedeflerini seç. Sana en uygun spor önerilerini hazırlayabilelim.',
      icons: [Target, Activity, Heart, Trophy],
    },
    confirm: {
      title: 'Profilin hazır! Sana özel bir deneyim seni bekliyor.',
      body:  'Bu bilgilerle sana en uygun tesisleri, sporları, etkinlikleri ve uzman koçları öneriyoruz.',
      icons: [MapPin, CheckCircle2, Heart, GraduationCap],
    },
  }
  const { eyebrow, title, body, icons } = map[step]

  return (
    <div className="space-y-6">
      {eyebrow && (
        <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          {eyebrow}
        </p>
      )}
      <h1 className="font-display text-3xl font-extrabold leading-tight text-primary-deep md:text-4xl">
        {title}
      </h1>
      <p className="max-w-md text-sm leading-relaxed text-foreground/75 md:text-base">{body}</p>

      <div aria-hidden className="grid grid-cols-2 gap-3 max-w-xs">
        {icons.map((Icon, i) => (
          <div
            key={i}
            className={`grid size-16 place-items-center rounded-2xl ${
              i % 4 === 0 ? 'bg-mint/50 text-mint-foreground' :
              i % 4 === 1 ? 'bg-sky/50 text-sky-foreground' :
              i % 4 === 2 ? 'bg-accent/15 text-accent' :
              'bg-[oklch(0.92_0.07_60)] text-[oklch(0.55_0.16_50)]'
            }`}
          >
            <Icon className="size-6" strokeWidth={1.7} />
          </div>
        ))}
      </div>

      <div className="flex items-start gap-3 rounded-2xl bg-mint/40 px-4 py-3">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-mint-foreground" aria-hidden />
        <div className="text-xs">
          <div className="font-bold text-foreground">Güvenli. Erişilebilir. Topluluk Odaklı.</div>
          <p className="text-mint-foreground/80">
            Bilgilerin kişisel öneriler oluşturmak için kullanılır, üçüncü taraflarla paylaşılmaz.
          </p>
        </div>
      </div>
    </div>
  )
}

/* ---------- Welcome step ---------- */

function WelcomeStep({ onPrimary }: { onPrimary: () => void }) {
  return (
    <div className="space-y-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">Adım 1/4</p>
      <h2 className="font-display text-3xl font-extrabold text-primary-deep md:text-4xl">
        Başlayalım.
      </h2>
      <p className="max-w-xl text-sm text-muted-foreground md:text-base">
        UYUM ile sana uygun tesisleri, sporları, etkinlikleri ve uzman koçları tanıyacaksın.
        Birkaç soruyla profilini oluşturalım — sadece 1 dakika.
      </p>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <FeatureChip icon={MapPin}   label="Uygun Tesisleri Keşfet"  tint="sky"      />
        <FeatureChip icon={Activity} label="Sporlar ve Egzersizler"  tint="mint"     />
        <FeatureChip icon={Calendar} label="Etkinlikleri Takip Et"   tint="lavender" />
        <FeatureChip icon={Users}    label="Topluluğa Katıl"         tint="peach"    />
      </div>

      <button
        type="button"
        onClick={onPrimary}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-glow transition hover:bg-primary-deep"
      >
        Başlayalım <ArrowRight className="size-4" aria-hidden />
      </button>

      <p className="text-center text-[12.5px] text-muted-foreground">
        Zaten hesabın var mı?{' '}
        <Link to="/" className="font-bold text-primary hover:text-primary-deep">
          Giriş yap
        </Link>
      </p>
    </div>
  )
}

function FeatureChip({
  icon: Icon, label, tint,
}: {
  icon: LucideIcon
  label: string
  tint: 'sky' | 'mint' | 'lavender' | 'peach'
}) {
  const bg =
    tint === 'sky'      ? 'bg-sky/60 text-sky-foreground' :
    tint === 'mint'     ? 'bg-mint/60 text-mint-foreground' :
    tint === 'lavender' ? 'bg-accent/15 text-accent' :
                          'bg-[oklch(0.92_0.07_60)] text-[oklch(0.55_0.16_50)]'
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl bg-card p-4 ring-1 ring-border/40 text-center">
      <span aria-hidden className={`grid size-11 place-items-center rounded-full ${bg}`}>
        <Icon className="size-5" strokeWidth={1.7} />
      </span>
      <span className="text-xs font-bold text-primary-deep">{label}</span>
    </div>
  )
}

/* ---------- Choice grid (disability + goal) ---------- */

interface ChoiceOption<T extends string> {
  value: T
  label: string
  description: string
  icon: LucideIcon
}

function ChoiceGrid<T extends string>({
  title, subtitle, options, selected, onSelect,
}: {
  title: string
  subtitle: string
  options: ReadonlyArray<ChoiceOption<T>>
  selected: T | null
  onSelect: (value: T) => void
}) {
  return (
    <div className="w-full">
      <h2 className="font-display text-2xl font-extrabold text-primary-deep md:text-3xl">
        {title}
      </h2>
      <p className="mt-2 max-w-xl text-[13.5px] text-muted-foreground md:text-sm">
        {subtitle}
      </p>

      <fieldset role="radiogroup" aria-label={title} className="mt-6 border-0 p-0 m-0">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {options.map(opt => {
            const Icon = opt.icon
            const isSelected = opt.value === selected
            return (
              <label
                key={opt.value}
                className={[
                  'relative flex cursor-pointer flex-col gap-2 rounded-2xl p-4 transition-all',
                  'ring-1 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary',
                  isSelected
                    ? 'bg-primary/10 ring-primary'
                    : 'bg-card ring-border/60 hover:ring-primary/40 hover:bg-primary/5',
                ].join(' ')}
              >
                <input
                  type="radio"
                  name="choice"
                  value={opt.value}
                  checked={isSelected}
                  onChange={() => onSelect(opt.value)}
                  className="sr-only"
                />
                {/* Top row: radio (left), icon (right) */}
                <div className="flex items-center justify-between">
                  <span
                    aria-hidden
                    className={`grid size-5 shrink-0 place-items-center rounded-full ring-2 transition ${
                      isSelected
                        ? 'border-transparent bg-primary ring-primary'
                        : 'bg-transparent ring-border'
                    }`}
                  >
                    {isSelected && <span className="size-1.5 rounded-full bg-white" />}
                  </span>
                  <span
                    aria-hidden
                    className={`grid size-10 shrink-0 place-items-center rounded-full ${
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-primary/10 text-primary'
                    }`}
                  >
                    <Icon className="size-5" strokeWidth={1.7} />
                  </span>
                </div>
                <div className="mt-2">
                  <div className="font-display text-base font-extrabold text-primary-deep">
                    {opt.label}
                  </div>
                  <p className="mt-1 text-[12.5px] text-muted-foreground">
                    {opt.description}
                  </p>
                </div>
              </label>
            )
          })}
        </div>
      </fieldset>
    </div>
  )
}

/* ---------- Confirm step ---------- */

function ConfirmStep({
  disabilityType, mobilityLevel, goal,
  onMobilitySelect, onEditDisability, onEditGoal,
}: {
  disabilityType: DisabilityType | null
  mobilityLevel:  MobilityLevel  | null
  goal:           Goal           | null
  onMobilitySelect: (value: MobilityLevel) => void
  onEditDisability: () => void
  onEditGoal:       () => void
}) {
  return (
    <div>
      <h2 className="font-display text-2xl font-extrabold text-primary-deep md:text-3xl">
        Seçimlerini kontrol et
      </h2>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        İstediğin zaman ayarlardan güncelleyebilirsin.
      </p>

      <ul className="mt-6 space-y-3">
        <SummaryRow
          icon={Accessibility}
          label="Engellilik durumu"
          value={disabilityType ? DISABILITY_LABELS[disabilityType] : '—'}
          onEdit={onEditDisability}
        />
        <SummaryRow
          icon={Target}
          label="Hedefin"
          value={goal ? GOAL_LABELS[goal] : '—'}
          onEdit={onEditGoal}
        />
      </ul>

      <div className="mt-6 rounded-2xl bg-card p-4 ring-1 ring-border/40">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Hareket durumun
        </p>
        <div className="grid gap-2 sm:grid-cols-3">
          {MOBILITY_OPTIONS.map(opt => {
            const Icon = opt.icon
            const active = mobilityLevel === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onMobilitySelect(opt.value)}
                className={`flex items-center gap-2 rounded-2xl px-3 py-3 text-left ring-1 transition ${
                  active
                    ? 'bg-primary/12 ring-primary text-primary'
                    : 'bg-card ring-border/60 hover:ring-primary/40'
                }`}
              >
                <Icon className="size-4 shrink-0" strokeWidth={1.8} aria-hidden />
                <span className="text-xs font-bold">{MOBILITY_LABELS[opt.value]}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-2xl bg-mint/30 px-4 py-3">
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" aria-hidden />
        <p className="text-[12.5px] text-foreground/80">
          Harika! Profilini oluştur — ana sayfada sana özel öneriler seni bekliyor.
        </p>
      </div>
    </div>
  )
}

function SummaryRow({
  icon: Icon, label, value, onEdit,
}: {
  icon: LucideIcon
  label: string
  value: string
  onEdit: () => void
}) {
  return (
    <li className="flex items-center gap-3 rounded-2xl bg-card p-4 ring-1 ring-border/40">
      <span aria-hidden className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
        <Icon className="size-5" />
      </span>
      <div className="flex-1">
        <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className="mt-0.5 text-sm font-bold text-foreground">{value}</div>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="text-xs font-bold text-primary hover:text-primary-deep"
      >
        Değiştir
      </button>
    </li>
  )
}
