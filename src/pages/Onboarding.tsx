import { useEffect, useMemo, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  Accessibility, Eye, Ear, Hand,
  Dumbbell, Sprout, Users, TrendingUp, Heart, Trophy,
  Target, CheckCircle2, Circle, ShieldCheck,
  MapPin, Calendar, Activity, GraduationCap,
  ArrowLeft, ArrowRight, Info, Pencil,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { UyumLogo } from '../components/ui/UyumLogo'
import { useProfile } from '../contexts/ProfileContext'
import { matchSports } from '../lib/sport-match'
import sportsData from '../data/sports.json'
import type { DisabilityType, Goal, MobilityLevel, UserProfile, Sport } from '../types'

/* ---------- Option configs ---------- */

interface DisabilityOption {
  value: DisabilityType
  label: string
  description: string
  icon: LucideIcon
  iconColor: string
  selectedBg: string
}

interface GoalOption {
  value: Goal
  label: string
  description: string
  icon: LucideIcon
  iconColor: string
  selectedBg: string
}

const DISABILITY_OPTIONS: ReadonlyArray<DisabilityOption> = [
  {
    value: 'wheelchair', label: 'Tekerlekli sandalye kullanıyorum',
    description: 'Tekerlekli sandalye ile günlük yaşamımı sürdürüyorum.',
    icon: Accessibility, iconColor: '#4C2A85', selectedBg: '#f5f3f7',
  },
  {
    value: 'visual', label: 'Görme engelliyim',
    description: 'Kısmi veya tamamen görme engeliyim.',
    icon: Eye, iconColor: '#6B7FD7', selectedBg: 'var(--color-muted)',
  },
  {
    value: 'hearing', label: 'İşitme engelliyim',
    description: 'Kısmi veya tamamen işitme engeliyim.',
    icon: Ear, iconColor: '#4C2A85', selectedBg: '#f5f3f7',
  },
  {
    value: 'upper_limb', label: 'Üst ekstremite kısıtım var',
    description: 'Kol veya el kullanımında zorluk yaşıyorum.',
    icon: Hand, iconColor: '#1f5a36', selectedBg: '#DDFBD2',
  },
]

const GOAL_OPTIONS: ReadonlyArray<GoalOption> = [
  {
    value: 'strength', label: 'Güçlenmek',
    description: 'Kas gücümü artırmak istiyorum.',
    icon: Dumbbell, iconColor: '#4C2A85', selectedBg: '#f5f3f7',
  },
  {
    value: 'flexibility', label: 'Esnekliğimi artırmak',
    description: 'Daha esnek ve rahat hareket etmek istiyorum.',
    icon: Sprout, iconColor: '#1f5a36', selectedBg: '#DDFBD2',
  },
  {
    value: 'social', label: 'Sosyal olmak',
    description: 'Yeni insanlarla tanışmak ve birlikte etkinliklere katılmak istiyorum.',
    icon: Users, iconColor: '#4C2A85', selectedBg: '#f5f3f7',
  },
  {
    value: 'performance', label: 'Performans geliştirmek',
    description: 'Spor performansımı artırmak istiyorum.',
    icon: TrendingUp, iconColor: '#6B7FD7', selectedBg: '#BCEDF6',
  },
  {
    value: 'healthy', label: 'Sağlıklı kalmak',
    description: 'Genel sağlığımı korumak istiyorum.',
    icon: Heart, iconColor: '#4C2A85', selectedBg: '#f5f3f7',
  },
  {
    value: 'compete', label: 'Rekabet etmek',
    description: 'Yarışmalara katılmak ve kendimi zorlamak istiyorum.',
    icon: Trophy, iconColor: '#1f5a36', selectedBg: '#DDFBD2',
  },
]

const DISABILITY_LABELS: Record<DisabilityType, string> = {
  wheelchair: 'Tekerlekli sandalye kullanıyorum',
  visual:     'Görme engelliyim',
  hearing:    'İşitme engelliyim',
  upper_limb: 'Üst ekstremite kısıtım var',
}

interface MobilityOption {
  value: MobilityLevel
  label: string
  description: string
  icon: LucideIcon
  iconColor: string
  selectedBg: string
}

const MOBILITY_OPTIONS: ReadonlyArray<MobilityOption> = [
  {
    value: 'sitting',
    label: 'Oturarak',
    description: 'Sporu çoğunlukla oturarak yapıyorum.',
    icon: Accessibility, iconColor: '#4C2A85', selectedBg: '#f5f3f7',
  },
  {
    value: 'supported',
    label: 'Destekle',
    description: 'Destek/yardımcı araçlarla hareket edebiliyorum.',
    icon: Hand, iconColor: '#6B7FD7', selectedBg: 'var(--color-muted)',
  },
  {
    value: 'independent',
    label: 'Bağımsız',
    description: 'Hareketlerimi bağımsız olarak gerçekleştirebiliyorum.',
    icon: Activity, iconColor: '#1f5a36', selectedBg: '#DDFBD2',
  },
  {
    value: 'upper_limb_limited',
    label: 'Kol / El Kısıtlı',
    description: 'Üst ekstremite hareketlerimde kısıtım var.',
    icon: Target, iconColor: '#0f4858', selectedBg: '#BCEDF6',
  },
]

const MOBILITY_STEP_LABELS: Record<MobilityLevel, string> =
  Object.fromEntries(MOBILITY_OPTIONS.map(o => [o.value, o.label])) as Record<MobilityLevel, string>

const MOBILITY_STEP_DESCRIPTIONS: Record<MobilityLevel, string> =
  Object.fromEntries(MOBILITY_OPTIONS.map(o => [o.value, o.description])) as Record<MobilityLevel, string>

const GOAL_LABELS: Record<Goal, string> = {
  strength:    'Güçlenmek',
  flexibility: 'Esnekliğimi artırmak',
  social:      'Sosyal olmak',
  performance: 'Performans geliştirmek',
  healthy:     'Sağlıklı kalmak',
  compete:     'Rekabet etmek',
}

const DEFAULT_ACCESSIBILITY: UserProfile['accessibility'] = {
  colorblindMode: 'none',
  highContrast:   false,
  fontSize:       'normal',
  speechEnabled:  false,
}

/* ---------- Route step normalization ---------- */

const STEP_PATHS = ['welcome', 'disability', 'mobility', 'goal', 'confirm'] as const
type StepName = typeof STEP_PATHS[number]

const NUMBERED_STEPS = ['disability', 'mobility', 'goal', 'confirm'] as const
const TOTAL_STEPS = NUMBERED_STEPS.length

const STEP_SCREEN_TITLES: Record<StepName, string> = {
  welcome:    'Başlayalım',
  disability: 'Engellilik durumunu seç',
  mobility:   'Hareket durumunu seç',
  goal:       'Hedeflerini seç',
  confirm:    'Seçimlerini kontrol et',
}

function pathFor(step: StepName): string {
  return step === 'welcome' ? '/onboarding' : `/onboarding/${step}`
}

// Numbered step index for the progress bar (1-based among NUMBERED_STEPS).
// 'welcome' returns 0 (intro screen, not counted as a step).
function numberedIndex(step: StepName): number {
  if (step === 'welcome') return 0
  return (NUMBERED_STEPS as readonly string[]).indexOf(step) + 1
}

function normalizeStep(raw: string | undefined): StepName {
  if (!raw) return 'welcome'
  return (STEP_PATHS as readonly string[]).includes(raw) ? (raw as StepName) : 'welcome'
}

/* ---------- Draft persistence ---------- */

const DRAFT_KEY = 'uyum:onboarding-draft'

const MOBILITY_VALUES: readonly MobilityLevel[] = ['sitting', 'supported', 'independent', 'upper_limb_limited']

interface Draft {
  disabilityTypes: DisabilityType[]
  mobilityLevel:   MobilityLevel | null
  goals:           Goal[]
}

function emptyDraft(): Draft {
  return { disabilityTypes: [], mobilityLevel: null, goals: [] }
}

function loadDraft(): Draft {
  if (typeof window === 'undefined') return emptyDraft()
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY)
    if (!raw) return emptyDraft()
    const parsed = JSON.parse(raw) as Draft
    return {
      disabilityTypes: Array.isArray(parsed.disabilityTypes) ? parsed.disabilityTypes : [],
      mobilityLevel:   (parsed.mobilityLevel && MOBILITY_VALUES.includes(parsed.mobilityLevel as MobilityLevel))
                          ? parsed.mobilityLevel
                          : null,
      goals:           Array.isArray(parsed.goals)           ? parsed.goals           : [],
    }
  } catch {
    return emptyDraft()
  }
}

function saveDraft(d: Draft): void {
  try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(d)) } catch { /* ignore */ }
}

function clearDraft(): void {
  try { sessionStorage.removeItem(DRAFT_KEY) } catch { /* ignore */ }
}

/* ---------- cn helper ---------- */

function cn(...xs: (string | false | undefined)[]): string {
  return xs.filter(Boolean).join(' ')
}

/* ---------- Page ---------- */

export function Onboarding() {
  const navigate = useNavigate()
  const { setProfile } = useProfile()
  const { step: stepParam } = useParams<{ step?: string }>()
  const step = normalizeStep(stepParam)
  const headingRef = useRef<HTMLHeadingElement>(null)

  const initial = useMemo(() => loadDraft(), [])
  const [disabilityTypes, setDisabilityTypes] = useState<DisabilityType[]>(initial.disabilityTypes)
  const [mobilityLevel, setMobilityLevel]     = useState<MobilityLevel | null>(initial.mobilityLevel)
  const [goals, setGoals]                     = useState<Goal[]>(initial.goals)

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true })
  }, [step])

  useEffect(() => {
    saveDraft({ disabilityTypes, mobilityLevel, goals })
  }, [disabilityTypes, mobilityLevel, goals])

  function announce(msg: string) {
    const region = document.getElementById('aria-live-region')
    if (region) region.textContent = msg
  }

  function gotoStep(target: StepName) {
    navigate(pathFor(target))
  }

  function toggleDisability(value: DisabilityType) {
    setDisabilityTypes(prev =>
      prev.includes(value) ? prev.filter(d => d !== value) : [...prev, value],
    )
  }

  function toggleGoal(value: Goal) {
    setGoals(prev =>
      prev.includes(value) ? prev.filter(g => g !== value) : [...prev, value],
    )
  }

  function next() {
    if (step === 'welcome') {
      gotoStep('disability')
      announce('Adım 1/4. Engellilik durumunu seç.')
    } else if (step === 'disability' && disabilityTypes.length > 0) {
      gotoStep('mobility')
      announce('Adım 2/4. Hareket durumunu seç.')
    } else if (step === 'mobility' && mobilityLevel) {
      gotoStep('goal')
      announce('Adım 3/4. Hedeflerini seç.')
    } else if (step === 'goal' && goals.length > 0) {
      gotoStep('confirm')
      announce('Adım 4/4. Profilini onayla.')
    } else if (step === 'confirm' && disabilityTypes.length > 0 && mobilityLevel && goals.length > 0) {
      setProfile({
        disabilityTypes,
        mobilityLevel,
        goals,
        city:               'Ankara',
        favoriteFacilities: [],
        favoriteEvents:     [],
        favoriteExercises:  [],
        accessibility:      DEFAULT_ACCESSIBILITY,
      })
      clearDraft()
      announce('Profilin oluşturuldu. Ana sayfaya yönlendiriliyorsun.')
      navigate('/dashboard')
    }
  }

  function back() {
    if (step === 'welcome')         navigate('/')
    else if (step === 'disability') gotoStep('welcome')
    else if (step === 'mobility')   gotoStep('disability')
    else if (step === 'goal')       gotoStep('mobility')
    else if (step === 'confirm')    gotoStep('goal')
  }

  const canProceed =
    step === 'welcome' ||
    (step === 'disability' && disabilityTypes.length > 0) ||
    (step === 'mobility'   && mobilityLevel !== null) ||
    (step === 'goal'       && goals.length > 0) ||
    (step === 'confirm'    && disabilityTypes.length > 0 && mobilityLevel !== null && goals.length > 0)
  const stepNumber = numberedIndex(step)
  const stepAnnouncement = step === 'welcome'
    ? STEP_SCREEN_TITLES.welcome
    : `Adım ${stepNumber}/${TOTAL_STEPS}. ${STEP_SCREEN_TITLES[step]}`

  return (
    <div className="min-h-screen overflow-x-hidden bg-muted px-2 py-3 text-primary-deep sm:px-4 lg:px-5">
      <div id="aria-live-region" className="sr-only" aria-live="polite" aria-atomic="true">
        {stepAnnouncement}
      </div>

      <section className="relative mx-auto flex w-full max-w-[1680px] flex-col overflow-hidden rounded-[1.35rem] border border-border/70 bg-card shadow-[0_24px_80px_-52px_rgba(50,14,59,0.55)] lg:rounded-[1.75rem]">
        {step === 'welcome' ? (
          <div className="flex min-h-full w-full flex-col">
            <header className="relative z-10 flex items-center justify-between px-5 pt-5 sm:px-8 lg:px-14 lg:pt-8">
              <Link to="/" aria-label="UYUM Ana Sayfa" className="inline-flex items-center">
                <UyumLogo size={42} />
              </Link>
              <ProgressBar step={step} />
            </header>

            <div className="grid flex-1 items-center gap-6 px-5 pb-6 pt-6 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-14 lg:pb-8 lg:pt-3">
              <WelcomeStep headingRef={headingRef} onPrimary={next} />
              <WelcomeVisual />
            </div>
          </div>
        ) : (
          <div className="flex min-h-full w-full min-w-0 flex-col">
            <header className="sticky top-0 z-10 flex min-w-0 items-center justify-start gap-4 bg-card/95 px-5 py-4 backdrop-blur sm:justify-between sm:px-8 lg:px-12 lg:py-5">
              <button
                type="button"
                onClick={back}
                className="inline-flex min-h-10 items-center gap-2 rounded-full px-2 text-sm font-semibold text-primary-deep transition hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <ArrowLeft className="size-5" aria-hidden />
                Geri
              </button>
              <div className="shrink-0">
                <ProgressBar step={step} />
              </div>
            </header>

            <div className="grid flex-1 lg:grid-cols-[33%_67%]">
              <aside className="hidden items-center px-8 pb-8 pt-2 lg:flex xl:px-12">
                <LeftRail step={step} />
              </aside>

              <main className="flex min-w-0 flex-col border-border/80 lg:border-l">
                <div className="px-5 pb-6 pt-2 sm:px-8 lg:px-10 xl:px-12">
                  <div className="mx-auto max-w-[920px] min-w-0">
                    {step === 'disability' && (
                      <MultiSelectStep
                        headingRef={headingRef}
                        headingId="disability-heading"
                        title="Engellilik durumunu seç"
                        note="İstediğin zaman profil ayarlarından değiştirebilirsin."
                        options={DISABILITY_OPTIONS}
                        selected={disabilityTypes}
                        onToggle={toggleDisability}
                      />
                    )}
                    {step === 'mobility' && (
                      <MobilityStep
                        headingRef={headingRef}
                        selected={mobilityLevel}
                        onSelect={setMobilityLevel}
                        disabilityTypes={disabilityTypes}
                      />
                    )}
                    {step === 'goal' && (
                      <MultiSelectStep
                        headingRef={headingRef}
                        headingId="goal-heading"
                        title="Sana en uygun önerileri yapabilmemiz için hedeflerini seçebilirsin."
                        note="Birden fazla hedef seçebilirsin. Zamanla hedeflerini güncelleyebilirsin."
                        options={GOAL_OPTIONS}
                        selected={goals}
                        onToggle={toggleGoal}
                        cols={3}
                      />
                    )}
                    {step === 'confirm' && (
                      <ConfirmStep
                        headingRef={headingRef}
                        disabilityTypes={disabilityTypes}
                        mobilityLevel={mobilityLevel}
                        goals={goals}
                        onEditDisability={() => gotoStep('disability')}
                        onEditMobility={() => gotoStep('mobility')}
                        onEditGoal={() => gotoStep('goal')}
                      />
                    )}
                  </div>
                </div>

                <footer className="sticky bottom-0 z-10 border-t border-border/90 bg-card/95 px-5 py-4 backdrop-blur sm:px-8 lg:px-10 xl:px-12">
                  <div className="mx-auto grid max-w-[920px] grid-cols-2 items-center gap-4">
                    <button
                      type="button"
                      onClick={back}
                      className="inline-flex h-12 w-full max-w-[190px] items-center justify-center rounded-md border border-primary/30 bg-card text-sm font-bold text-primary transition hover:border-primary hover:bg-primary/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                      Geri
                    </button>
                    <button
                      type="button"
                      onClick={next}
                      disabled={!canProceed}
                      aria-disabled={!canProceed}
                      className={cn(
                        'ml-auto inline-flex h-12 w-full max-w-[380px] items-center justify-center gap-4 rounded-md px-5 text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                        canProceed
                          ? 'bg-primary text-primary-foreground shadow-[0_16px_30px_-20px_rgba(76,42,133,0.8)] hover:brightness-105'
                          : 'cursor-not-allowed bg-muted text-muted-foreground',
                      )}
                    >
                      {step === 'confirm' ? 'Keşfetmeye Başla' : 'Devam Et'}
                      <ArrowRight className="size-5" aria-hidden />
                    </button>
                  </div>
                </footer>
              </main>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

/* ---------- Progress bar ---------- */

function ProgressBar({ step }: { step: StepName }) {
  if (step === 'welcome') {
    return (
      <div
        className="flex items-center gap-3 text-sm font-semibold text-primary-deep"
        aria-label="Başlangıç ekranı"
      >
        <span>Başlayalım</span>
      </div>
    )
  }

  const idx = numberedIndex(step)
  return (
    <div
      className="flex min-w-0 items-center gap-2 text-sm font-semibold text-primary-deep sm:gap-3"
      aria-label={`Adım ${idx} / ${TOTAL_STEPS}`}
    >
      <span className="sm:hidden">{idx}/{TOTAL_STEPS}</span>
      <span className="hidden sm:inline">Adım {idx}/{TOTAL_STEPS}</span>
      <ol className="hidden items-center sm:flex" aria-hidden>
        {NUMBERED_STEPS.map((_, i) => {
          const stepNum = i + 1
          const done = stepNum < idx
          const current = stepNum === idx
          return (
            <li key={i} className="flex items-center">
              <span
                className={cn(
                  'grid size-4 place-items-center rounded-full text-[9px] transition sm:size-6 sm:text-[10px]',
                  done && 'bg-primary text-primary-foreground shadow-[0_0_0_1px_rgba(76,42,133,0.18)]',
                  current && 'border-[3px] border-primary bg-card shadow-[0_0_0_4px_rgba(76,42,133,0.14)]',
                  !done && !current && 'bg-border',
                )}
              >
                {done ? '' : current ? <span className="size-1.5 rounded-full bg-primary sm:size-2" /> : null}
              </span>
              {i < NUMBERED_STEPS.length - 1 && (
                <span
                  className={cn(
                    'h-0.5 w-5 transition sm:w-11',
                    stepNum < idx ? 'bg-primary' : 'bg-border',
                  )}
                />
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

/* ---------- Left rail ---------- */

function LeftRail({ step }: { step: StepName }) {
  const map: Record<StepName, {
    eyebrow?: string
    title: string
    body: string
    icons: Array<{ icon: LucideIcon; bg: string; color: string }>
    note?: string
  }> = {
    welcome: {
      eyebrow: 'Hoş Geldiniz',
      title:   'Spor herkes içindir. Bizimle uyum içinde harekete geç.',
      body:    'UYUM, engelli bireylerin spor ve fiziksel aktivitelere erişimini kolaylaştıran bir platformdur. Yakındaki tesisleri keşfet, etkinliklere katıl ve topluluğun bir parçası ol.',
      icons: [
        { icon: MapPin,       bg: '#BCEDF6', color: '#0f4858' },
        { icon: Activity,     bg: '#DDFBD2', color: '#1f5a36' },
        { icon: Calendar,     bg: '#f5f3f7', color: '#4C2A85' },
        { icon: GraduationCap, bg: 'var(--color-muted)', color: '#6B7FD7' },
      ],
    },
    disability: {
      title: 'Seni daha iyi tanımak istiyoruz',
      body:  'Doğru öneriler ve rehberlik sunabilmek için engellilik durumunu seçmemiz önemli.',
      icons: [
        { icon: Accessibility, bg: '#DDFBD2', color: '#1f5a36' },
        { icon: Eye,           bg: '#f5f3f7', color: '#6B7FD7' },
        { icon: Ear,           bg: '#f5f3f7', color: '#4C2A85' },
        { icon: Hand,          bg: '#BCEDF6', color: '#0f4858' },
      ],
      note: 'Bu bilgi sadece sana özel içerik için kullanılır. Gizliliğin bizim için önemli.',
    },
    mobility: {
      title: 'Hareket durumunu birlikte belirleyelim',
      body:  'Spor anındaki fiziksel bağımsızlık seviyene göre sana doğru egzersizleri ve tesisleri öneriyoruz.',
      icons: [
        { icon: Activity,      bg: '#DDFBD2', color: '#1f5a36' },
        { icon: Accessibility, bg: '#f5f3f7', color: '#4C2A85' },
        { icon: Hand,          bg: '#BCEDF6', color: '#0f4858' },
        { icon: Target,        bg: 'var(--color-muted)', color: '#6B7FD7' },
      ],
      note: 'Bu seçim ileride profilinden değiştirilebilir.',
    },
    goal: {
      title: 'Hedeflerini öğrenelim',
      body:  'Spor ve fiziksel aktiviteyle ilgili hedeflerini seç. Sana en uygun önerileri hazırlayabilelim.',
      icons: [
        { icon: Dumbbell,    bg: '#f5f3f7', color: '#4C2A85' },
        { icon: Users,       bg: '#BCEDF6', color: '#6B7FD7' },
        { icon: Heart,       bg: '#DDFBD2', color: '#1f5a36' },
        { icon: Trophy,      bg: 'var(--color-muted)', color: '#0f4858' },
      ],
      note: 'Bu bilgiler sana özel olarak kullanılır. İlgilerini sonra değiştirebilirsin.',
    },
    confirm: {
      title: 'Profilin hazır! Sana özel bir deneyim seni bekliyor.',
      body:  'Bu bilgilerle sana en uygun tesisleri, sporları, etkinlikleri ve uzman koçları öneriyoruz.',
      icons: [
        { icon: MapPin,       bg: '#DDFBD2', color: '#1f5a36' },
        { icon: Activity,     bg: '#BCEDF6', color: '#6B7FD7' },
        { icon: Users,        bg: '#f5f3f7', color: '#4C2A85' },
        { icon: Calendar,     bg: 'var(--color-muted)', color: '#0f4858' },
      ],
      note: 'Güvende olabilirsin. Bilgilerin yalnızca sana özel olacak.',
    },
  }

  const { eyebrow, title, body, icons, note } = map[step]

  return (
    <div className="w-full max-w-[440px] space-y-5 xl:max-w-[470px]">
      {eyebrow && (
        <p className="text-sm font-bold text-primary">{eyebrow}</p>
      )}

      <div className="space-y-3">
        <h2 className="max-w-[400px] text-[1.9rem] font-extrabold leading-[1.12] text-primary-deep xl:text-[2.2rem]">
          {title}
        </h2>

        <p className="max-w-[360px] text-sm font-medium leading-6 text-primary-deep/80 xl:text-[15px] xl:leading-7">{body}</p>
      </div>

      <OrbitIllustration step={step} icons={icons} />

      {note && (
        <div className={cn(
          'flex items-start gap-3 border border-border bg-card/80 px-4 py-3 shadow-soft',
          step === 'confirm' ? 'rounded-md' : 'rounded-full',
        )}>
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10">
            <ShieldCheck className="size-4 text-primary" aria-hidden />
          </span>
          <p className="text-xs font-medium leading-5 text-primary-deep/75 xl:text-sm xl:leading-6">{note}</p>
        </div>
      )}
    </div>
  )
}

function OrbitIllustration({
  step,
  icons,
}: {
  step: StepName
  icons: Array<{ icon: LucideIcon; bg: string; color: string }>
}) {
  const CenterIcon =
    step === 'goal'     ? Target       :
    step === 'confirm'  ? CheckCircle2 :
    step === 'mobility' ? Activity     :
                          Accessibility
  const positions = [
    { left: '44%', top: '0%' },
    { left: '78%', top: '35%' },
    { left: '44%', top: '72%' },
    { left: '9%', top: '35%' },
  ]

  return (
    <div aria-hidden className="relative h-[265px] w-full xl:h-[300px]">
      <div className="absolute inset-x-0 top-5 mx-auto h-[215px] w-[90%] rounded-[42%_58%_50%_50%/46%_48%_52%_54%] bg-[radial-gradient(circle_at_28%_24%,rgba(188,237,246,0.42),transparent_38%),radial-gradient(circle_at_78%_32%,rgba(221,251,210,0.55),transparent_40%),radial-gradient(circle_at_52%_70%,rgba(76,42,133,0.12),transparent_48%),var(--color-muted)] xl:h-[245px]" />
      <div className="absolute left-1/2 top-1/2 h-[190px] w-[190px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-primary/20 xl:h-[220px] xl:w-[220px]" />
      <span className="absolute left-[31%] top-[28%] size-2.5 rounded-full bg-accent/60" />
      <span className="absolute right-[25%] top-[42%] size-3 rounded-full bg-mint" />
      <span className="absolute bottom-[23%] left-[43%] size-2.5 rounded-full bg-accent/40" />

      <div className="absolute left-1/2 top-1/2 grid size-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_20px_34px_-20px_rgba(76,42,133,0.75)] xl:size-[88px]">
        <CenterIcon className="size-10 xl:size-11" strokeWidth={1.8} />
      </div>

      {icons.map(({ icon: Icon, bg, color }, i) => (
        <div
          key={`${step}-${i}`}
          className="absolute grid size-[68px] place-items-center rounded-full bg-card shadow-[0_18px_40px_-25px_rgba(50,14,59,0.7)] xl:size-20"
          style={positions[i]}
        >
          <span className="grid size-11 place-items-center rounded-full xl:size-[52px]" style={{ backgroundColor: bg }}>
            <Icon className="size-6 xl:size-7" style={{ color }} strokeWidth={1.75} />
          </span>
        </div>
      ))}
    </div>
  )
}

/* ---------- Welcome step ---------- */

function WelcomeStep({
  headingRef, onPrimary,
}: {
  headingRef: RefObject<HTMLHeadingElement | null>
  onPrimary: () => void
}) {
  const featureItems = [
    { icon: MapPin,   label: 'Uygun Tesisleri Keşfet',     bg: '#BCEDF6', color: '#0f4858' },
    { icon: Activity, label: 'Sporları ve Egzersizleri Öğren', bg: '#DDFBD2', color: '#1f5a36' },
    { icon: Calendar, label: 'Etkinlikleri Takip Et',      bg: '#f5f3f7', color: '#4C2A85' },
    { icon: Users,    label: 'Topluluğa Katıl',            bg: '#f5f3f7', color: '#6B7FD7' },
  ]

  return (
    <div className="max-w-[560px] self-center lg:pb-2 xl:max-w-[610px]">
      <div>
        <p className="mb-5 text-base font-bold text-primary xl:mb-6">Hoş Geldiniz</p>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-[2.25rem] font-extrabold leading-[1.14] text-primary-deep outline-none focus-visible:!outline-none sm:text-[2.6rem] xl:text-[3rem]"
        >
          Spor herkes içindir.
          <br />
          Bizimle uyum içinde
          <br />
          <span className="bg-primary bg-clip-text text-transparent">harekete geç.</span>
        </h1>
        <p className="mt-5 max-w-[520px] text-base font-medium leading-7 text-primary-deep/75 xl:mt-6 xl:text-[17px]">
          UYUM, engelli bireylerin spor ve fiziksel aktivitelere erişimini kolaylaştıran bir platformdur.
          Sana uygun tesisleri keşfet, sporları öğren, etkinliklere katıl ve topluluğun bir parçası ol.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 xl:mt-7">
        {featureItems.map(({ icon: Icon, label, bg, color }) => (
          <div
            key={label}
            className="flex min-h-[96px] flex-col items-center justify-start gap-2 text-center"
          >
            <div
              className="grid size-16 place-items-center rounded-full shadow-[0_18px_34px_-26px_rgba(50,14,59,0.8)] xl:size-[72px]"
              style={{ backgroundColor: bg }}
              aria-hidden
            >
              <Icon className="size-7 xl:size-8" style={{ color }} strokeWidth={1.8} />
            </div>
            <span className="max-w-[120px] text-xs font-bold leading-5 text-primary-deep xl:text-[13px]">{label}</span>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onPrimary}
        className="mt-6 inline-flex h-[52px] w-full max-w-[560px] items-center justify-center gap-6 rounded-md bg-primary px-6 text-base font-bold text-primary-foreground shadow-[0_18px_38px_-26px_rgba(76,42,133,0.9)] transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary xl:mt-7 xl:h-14 xl:text-lg"
      >
        Başlayalım <ArrowRight className="size-5 xl:size-6" aria-hidden />
      </button>

      <p className="mt-4 max-w-[560px] text-center text-xs text-primary-deep/65 xl:text-sm">
        Zaten hesabın var mı?{' '}
        <Link to="/" className="font-bold text-primary hover:text-primary-deep">
          Giriş yap
        </Link>
      </p>
    </div>
  )
}

function WelcomeVisual() {
  const orbitIcons = [
    { icon: MapPin, bg: '#BCEDF6', color: '#0f4858', className: 'left-[20%] top-[13%]' },
    { icon: Activity, bg: '#DDFBD2', color: '#1f5a36', className: 'right-[8%] top-[20%]' },
    { icon: Calendar, bg: '#f5f3f7', color: '#4C2A85', className: 'left-[18%] bottom-[28%]' },
    { icon: Users, bg: '#f5f3f7', color: '#6B7FD7', className: 'right-[12%] bottom-[24%]' },
  ]

  return (
    <div className="relative hidden min-h-[540px] items-center justify-center lg:flex xl:min-h-[600px]">
      <div className="absolute inset-y-[-90px] left-[-10%] w-px rotate-[-10deg] bg-border/80" />
      <div className="absolute left-[11%] top-[9%] h-[430px] w-[74%] rounded-[42%_58%_50%_50%/46%_48%_52%_54%] bg-[radial-gradient(circle_at_26%_24%,rgba(188,237,246,0.5),transparent_38%),radial-gradient(circle_at_78%_36%,rgba(221,251,210,0.62),transparent_42%),radial-gradient(circle_at_50%_70%,rgba(76,42,133,0.13),transparent_50%),var(--color-muted)] xl:h-[490px]" />
      <div className="absolute left-1/2 top-[42%] h-[330px] w-[330px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-primary/20 xl:h-[380px] xl:w-[380px]" />
      <span className="absolute left-[32%] top-[32%] size-3 rounded-full bg-accent/70" />
      <span className="absolute right-[22%] top-[33%] size-3 rounded-full bg-mint" />
      <span className="absolute bottom-[34%] left-[36%] size-3 rounded-full bg-sky" />

      <div className="absolute left-1/2 top-[42%] h-[176px] w-[176px] -translate-x-1/2 -translate-y-1/2 xl:h-[200px] xl:w-[200px]">
        <div className="absolute inset-x-7 bottom-3 h-7 rounded-full bg-primary/20 blur-xl" />
        <div className="relative grid h-full w-full place-items-center rounded-full bg-white shadow-[0_30px_60px_-35px_rgba(76,42,133,0.9)]">
          <img src="/images/uyumlogo.svg" alt="Uyum" className="w-32 h-32 xl:w-40 xl:h-40 object-contain ml-4" />
        </div>
      </div>

      {orbitIcons.map(({ icon: Icon, bg, color, className }) => (
        <div
          key={className}
          className={cn(
            'absolute grid size-[88px] place-items-center rounded-full bg-card shadow-[0_20px_44px_-28px_rgba(50,14,59,0.75)] xl:size-24',
            className,
          )}
        >
          <span className="grid size-[52px] place-items-center rounded-full xl:size-14" style={{ backgroundColor: bg }}>
            <Icon className="size-7 xl:size-8" style={{ color }} strokeWidth={1.75} />
          </span>
        </div>
      ))}

      <div className="absolute bottom-3 left-[14%] flex w-[76%] items-center gap-4 rounded-md border border-border bg-card/85 px-6 py-4 shadow-card backdrop-blur">
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary/10">
          <ShieldCheck className="size-7 text-primary" strokeWidth={1.7} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold text-primary-deep xl:text-base">Güvenilir. Erişilebilir. Topluluk Odaklı.</p>
          <p className="mt-1 text-xs font-medium leading-5 text-primary-deep/70 xl:text-sm xl:leading-6">
            Bilgiler topluluk tarafından güncellenir, seninle daha güçlü hale gelir.
          </p>
        </div>
        <Users className="size-8 shrink-0 text-primary" strokeWidth={1.7} />
      </div>
    </div>
  )
}

/* ---------- Multi-select step ---------- */

interface SelectableOption {
  value: string
  label: string
  description: string
  icon: LucideIcon
  iconColor: string
  selectedBg: string
}

function SelectableCard({
  selected, onToggle, icon: Icon, iconColor, selectedBg, title, desc,
}: {
  selected: boolean
  onToggle: () => void
  icon: LucideIcon
  iconColor: string
  selectedBg: string
  title: string
  desc?: string
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      onClick={onToggle}
      className={cn(
        'relative flex min-h-[160px] w-full flex-col items-start gap-4 rounded-md border p-5 text-left transition-all xl:min-h-[176px]',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        'motion-reduce:transition-none',
        selected
          ? 'border-primary bg-primary/5 shadow-[0_22px_45px_-36px_rgba(76,42,133,0.8)]'
          : 'border-border bg-card hover:border-primary/35 hover:shadow-soft',
      )}
    >
      <div className="absolute right-4 top-4">
        {selected
          ? <CheckCircle2 className="size-6 text-primary" aria-hidden />
          : <Circle className="size-6 text-primary-deep/25" aria-hidden />}
      </div>
      <div
        className="grid size-14 place-items-center rounded-full transition-colors xl:size-16"
        style={{ backgroundColor: selectedBg }}
      >
        <Icon className="size-7 xl:size-8" style={{ color: iconColor }} aria-hidden strokeWidth={1.75} />
      </div>
      <div className="max-w-[260px] pr-6">
        <p className="text-base font-extrabold leading-6 text-primary-deep xl:text-[17px]">{title}</p>
        {desc && <p className="mt-2 text-xs font-medium leading-5 text-primary-deep/75 xl:text-[13px] xl:leading-6">{desc}</p>}
      </div>
    </button>
  )
}

function MobilityStep({
  headingRef, selected, onSelect, disabilityTypes,
}: {
  headingRef: RefObject<HTMLHeadingElement | null>
  selected: MobilityLevel | null
  onSelect: (v: MobilityLevel) => void
  disabilityTypes: DisabilityType[]
}) {
  const noteSuffix = disabilityTypes.length > 0
    ? 'Engel seçimine göre öneriyoruz; istediğini seçebilirsin.'
    : 'Sana en uygun egzersiz ve tesisleri önerebilmemiz için bu bilgiyi alıyoruz.'
  return (
    <div className="w-full">
      <h1
        ref={headingRef}
        tabIndex={-1}
        id="mobility-heading"
        className="mb-2 max-w-[calc(100vw-3.75rem)] break-words text-base font-extrabold leading-[1.3] text-primary-deep outline-none focus-visible:!outline-none sm:max-w-[650px] sm:text-xl md:text-2xl xl:text-[1.55rem]"
      >
        Hareket durumunu seç
      </h1>
      <p className="mb-5 text-sm font-medium text-primary-deep/75">
        Spor anındaki fiziksel bağımsızlık seviyene en yakın olanı seç. Tek seçim.
      </p>

      <div
        role="radiogroup"
        aria-labelledby="mobility-heading"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:gap-5"
      >
        {MOBILITY_OPTIONS.map(opt => {
          const isSelected = selected === opt.value
          const Icon = opt.icon
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelect(opt.value)}
              className={cn(
                'relative flex min-h-[140px] w-full flex-col items-start gap-4 rounded-md border p-5 text-left transition-all xl:min-h-[156px]',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                'motion-reduce:transition-none',
                isSelected
                  ? 'border-primary bg-primary/5 shadow-[0_22px_45px_-36px_rgba(76,42,133,0.8)]'
                  : 'border-border bg-card hover:border-primary/35 hover:shadow-soft',
              )}
            >
              <div className="absolute right-4 top-4">
                {isSelected
                  ? <CheckCircle2 className="size-6 text-primary" aria-hidden />
                  : <Circle className="size-6 text-primary-deep/25" aria-hidden />}
              </div>
              <div
                className="grid size-14 place-items-center rounded-full transition-colors xl:size-16"
                style={{ backgroundColor: opt.selectedBg }}
              >
                <Icon className="size-7 xl:size-8" style={{ color: opt.iconColor }} aria-hidden strokeWidth={1.75} />
              </div>
              <div className="max-w-[260px] pr-6">
                <p className="text-base font-extrabold leading-6 text-primary-deep xl:text-[17px]">{opt.label}</p>
                <p className="mt-2 text-xs font-medium leading-5 text-primary-deep/75 xl:text-[13px] xl:leading-6">{opt.description}</p>
              </div>
            </button>
          )
        })}
      </div>

      <div className="mt-5 flex items-center gap-3 rounded-md border border-primary/15 bg-card/80 px-4 py-3 text-primary-deep/75 shadow-soft">
        <Info className="size-5 shrink-0 text-primary" aria-hidden />
        <p className="text-xs font-medium leading-5 xl:text-sm">{noteSuffix}</p>
      </div>
    </div>
  )
}

function MultiSelectStep<T extends string>({
  headingRef, headingId, title, note, options, selected, onToggle, cols = 2,
}: {
  headingRef: RefObject<HTMLHeadingElement | null>
  headingId: string
  title: string
  note: string
  options: ReadonlyArray<SelectableOption & { value: T }>
  selected: T[]
  onToggle: (value: T) => void
  cols?: 2 | 3
}) {
  return (
    <div className="w-full">
      <h1
        ref={headingRef}
        tabIndex={-1}
        id={headingId}
        className="mb-5 max-w-[calc(100vw-3.75rem)] break-words text-base font-extrabold leading-[1.3] text-primary-deep outline-none focus-visible:!outline-none sm:max-w-[650px] sm:text-xl md:text-2xl xl:text-[1.55rem]"
      >
        {title}
      </h1>

      <div
        role="group"
        aria-labelledby={headingId}
        className={cn(
          'grid gap-4 xl:gap-5',
          cols === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2',
        )}
      >
        {options.map(opt => (
          <SelectableCard
            key={opt.value}
            selected={selected.includes(opt.value)}
            onToggle={() => onToggle(opt.value)}
            icon={opt.icon}
            iconColor={opt.iconColor}
            selectedBg={opt.selectedBg}
            title={opt.label}
            desc={opt.description}
          />
        ))}
      </div>

      <div className="mt-5 flex items-center gap-3 rounded-md border border-primary/15 bg-card/80 px-4 py-3 text-primary-deep/75 shadow-soft">
        <Info className="size-5 shrink-0 text-primary" aria-hidden />
        <p className="text-xs font-medium leading-5 xl:text-sm">{note}</p>
      </div>
    </div>
  )
}

/* ---------- Confirm step ---------- */

function ConfirmStep({
  headingRef, disabilityTypes, mobilityLevel, goals, onEditDisability, onEditMobility, onEditGoal,
}: {
  headingRef: RefObject<HTMLHeadingElement | null>
  disabilityTypes: DisabilityType[]
  mobilityLevel:   MobilityLevel | null
  goals:           Goal[]
  onEditDisability: () => void
  onEditMobility:   () => void
  onEditGoal:       () => void
}) {
  const profileForMatch = {
    disabilityTypes,
    goals,
    mobilityLevel: (mobilityLevel ?? 'independent') as MobilityLevel,
    city: 'Ankara',
    favoriteFacilities: [],
    favoriteEvents: [],
    favoriteExercises: [],
    accessibility: DEFAULT_ACCESSIBILITY,
  }
  const suggestedSports = matchSports(profileForMatch, sportsData as Sport[])
    .slice(0, 2)
    .map(r => r.sport.name)
    .join(', ')
  const disabilityDescription = disabilityTypes
    .map(d => DISABILITY_OPTIONS.find(opt => opt.value === d)?.description)
    .filter(Boolean)
    .join(' ')
  const goalDescription = goals
    .map(g => GOAL_OPTIONS.find(opt => opt.value === g)?.description)
    .filter(Boolean)
    .join(' ')

  return (
    <div className="w-full">
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="mb-2 text-xl font-extrabold text-primary-deep outline-none focus-visible:!outline-none md:text-2xl"
      >
        Seçimlerini kontrol et
      </h1>
      <p className="mb-5 text-sm font-medium text-primary-deep/75">Dilediğin zaman ayarlardan güncelleyebilirsin.</p>

      <ul className="space-y-4 xl:space-y-5">
        <ConfirmRow
          icon={Accessibility}
          iconColor="#4C2A85"
          iconBg="#f5f3f7"
          label="Engellilik durumun"
          value={disabilityTypes.map(d => DISABILITY_LABELS[d]).join(', ')}
          description={disabilityDescription}
          onEdit={onEditDisability}
        />
        <ConfirmRow
          icon={Activity}
          iconColor="#0f4858"
          iconBg="#BCEDF6"
          label="Hareket durumun"
          value={mobilityLevel ? MOBILITY_STEP_LABELS[mobilityLevel] : '—'}
          description={mobilityLevel ? MOBILITY_STEP_DESCRIPTIONS[mobilityLevel] : ''}
          onEdit={onEditMobility}
        />
        <ConfirmRow
          icon={Dumbbell}
          iconColor="#1f5a36"
          iconBg="#DDFBD2"
          label="Hedefin"
          value={goals.map(g => GOAL_LABELS[g]).join(', ')}
          description={goalDescription}
          onEdit={onEditGoal}
        />
        {suggestedSports && (
          <li className="flex min-h-[112px] items-center gap-5 rounded-md border border-border bg-card px-5 py-4 shadow-card xl:min-h-[124px] xl:gap-6 xl:px-6 xl:py-5">
            <span
              className="grid size-16 flex-shrink-0 place-items-center rounded-full xl:size-20"
              style={{ backgroundColor: '#BCEDF6' }}
              aria-hidden
            >
              <Target className="size-8 xl:size-10" style={{ color: '#6B7FD7' }} strokeWidth={1.75} />
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-primary-deep/70">İlgi alanın</div>
              <div className="mt-1 text-base font-extrabold text-primary-deep xl:text-lg">{suggestedSports}</div>
              <p className="mt-1 text-sm font-medium leading-6 text-primary-deep/70">Bu sporlarla ilgileniyorsun.</p>
            </div>
          </li>
        )}
      </ul>

      <div className="mt-7 flex items-center gap-4 rounded-md border border-mint bg-mint/35 px-5 py-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-card/80">
          <ShieldCheck className="size-7 text-mint-foreground" aria-hidden strokeWidth={1.7} />
        </span>
        <p className="text-sm font-medium leading-6 text-primary-deep/75">
          <strong className="block text-base font-extrabold text-mint-foreground">Harika! Profilin oluşturuldu.</strong>
          Artık sana özel öneriler ve içerikler görebilirsin.
        </p>
      </div>
    </div>
  )
}

function ConfirmRow({
  icon: Icon, iconColor, iconBg, label, value, description, onEdit,
}: {
  icon: LucideIcon
  iconColor: string
  iconBg: string
  label: string
  value: string
  description?: string
  onEdit: () => void
}) {
  return (
    <li className="flex min-h-[112px] items-center gap-5 rounded-md border border-border bg-card px-5 py-4 shadow-card xl:min-h-[124px] xl:gap-6 xl:px-6 xl:py-5">
      <span
        className="grid size-16 flex-shrink-0 place-items-center rounded-full xl:size-20"
        style={{ backgroundColor: iconBg }}
        aria-hidden
      >
        <Icon className="size-8 xl:size-10" style={{ color: iconColor }} strokeWidth={1.75} />
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-primary-deep/70">{label}</div>
        <div className="mt-1 text-base font-extrabold text-primary-deep xl:text-lg">{value || '—'}</div>
        {description && <p className="mt-1 line-clamp-2 text-sm font-medium leading-6 text-primary-deep/70">{description}</p>}
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-primary transition hover:text-primary-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <Pencil className="size-4" aria-hidden />
        Değiştir
      </button>
    </li>
  )
}
