import { useEffect, useMemo, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  Accessibility, Eye, Ear, Hand,
  Dumbbell, Sprout, Users, TrendingUp, Heart, Trophy,
  Target, Sparkles, CheckCircle2, Circle, ShieldCheck,
  MapPin, Calendar, Activity, GraduationCap,
  ArrowLeft, ArrowRight,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { UyumLogo } from '../components/ui/UyumLogo'
import { useProfile } from '../contexts/ProfileContext'
import { matchSports } from '../lib/sport-match'
import sportsData from '../data/sports.json'
import type { DisabilityType, Goal, UserProfile, Sport } from '../types'
import heroAthletes from '../assets/hero-athletes.png'

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
    description: 'Tekerlekli sandalye ile günlük yaşamını sürdürüyorsun.',
    icon: Accessibility, iconColor: '#7B2FBE', selectedBg: '#F3E5F5',
  },
  {
    value: 'visual', label: 'Görme engelliyim',
    description: 'Kısmi veya tamamen görme engeliyim.',
    icon: Eye, iconColor: '#00BCD4', selectedBg: '#E0F7FA',
  },
  {
    value: 'hearing', label: 'İşitme engelliyim',
    description: 'Kısmi veya tamamen işitme engeliyim.',
    icon: Ear, iconColor: '#43A047', selectedBg: '#E8F5E9',
  },
  {
    value: 'upper_limb', label: 'Üst ekstremite kısıtım var',
    description: 'Kol veya el fonksiyon kaybı yaşıyorum.',
    icon: Hand, iconColor: '#FF6B35', selectedBg: '#FFF3E0',
  },
]

const GOAL_OPTIONS: ReadonlyArray<GoalOption> = [
  {
    value: 'strength', label: 'Güçlenmek',
    description: 'Kas gücümü artırmak istiyorum.',
    icon: Dumbbell, iconColor: '#7B2FBE', selectedBg: '#F3E5F5',
  },
  {
    value: 'flexibility', label: 'Esnekliğimi artırmak',
    description: 'Daha esnek ve hareket aralığı geniş olmak istiyorum.',
    icon: Sprout, iconColor: '#43A047', selectedBg: '#E8F5E9',
  },
  {
    value: 'social', label: 'Sosyal olmak',
    description: 'Spor aracılığıyla sosyal bağlar kurmak istiyorum.',
    icon: Users, iconColor: '#00BCD4', selectedBg: '#E0F7FA',
  },
  {
    value: 'performance', label: 'Performans geliştirmek',
    description: 'Spor performansımı üst seviyeye çıkarmak istiyorum.',
    icon: TrendingUp, iconColor: '#FF6B35', selectedBg: '#FFF3E0',
  },
  {
    value: 'healthy', label: 'Sağlıklı kalmak',
    description: 'Sağlıklı bir yaşam tarzı sürdürmek istiyorum.',
    icon: Heart, iconColor: '#EC407A', selectedBg: '#FCE4EC',
  },
  {
    value: 'compete', label: 'Rekabet etmek',
    description: 'Yarışmalara katılmak istiyorum.',
    icon: Trophy, iconColor: '#00897B', selectedBg: '#E0F2F1',
  },
]

const DISABILITY_LABELS: Record<DisabilityType, string> = {
  wheelchair: 'Tekerlekli sandalye kullanıyorum',
  visual:     'Görme engelliyim',
  hearing:    'İşitme engelliyim',
  upper_limb: 'Üst ekstremite kısıtım var',
}

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

const STEP_PATHS = ['welcome', 'disability', 'goal', 'confirm'] as const
type StepName = typeof STEP_PATHS[number]

const STEP_SCREEN_TITLES: Record<StepName, string> = {
  welcome:    'Başlayalım',
  disability: 'Engellilik durumunu seç',
  goal:       'Hedeflerini seç',
  confirm:    'Seçimlerini kontrol et',
}

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

/* ---------- Draft persistence ---------- */

const DRAFT_KEY = 'uyum:onboarding-draft'

interface Draft {
  disabilityTypes: DisabilityType[]
  goals:           Goal[]
}

function emptyDraft(): Draft {
  return { disabilityTypes: [], goals: [] }
}

function loadDraft(): Draft {
  if (typeof window === 'undefined') return emptyDraft()
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY)
    if (!raw) return emptyDraft()
    const parsed = JSON.parse(raw) as Draft
    return {
      disabilityTypes: Array.isArray(parsed.disabilityTypes) ? parsed.disabilityTypes : [],
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
  const [goals, setGoals]                     = useState<Goal[]>(initial.goals)

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true })
  }, [step])

  useEffect(() => {
    saveDraft({ disabilityTypes, goals })
  }, [disabilityTypes, goals])

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
      announce('Adım 2/4. Engellilik durumunu seç.')
    } else if (step === 'disability' && disabilityTypes.length > 0) {
      gotoStep('goal')
      announce('Adım 3/4. Hedeflerini seç.')
    } else if (step === 'goal' && goals.length > 0) {
      gotoStep('confirm')
      announce('Adım 4/4. Profilini onayla.')
    } else if (step === 'confirm' && disabilityTypes.length > 0 && goals.length > 0) {
      setProfile({
        disabilityTypes,
        mobilityLevel:      'independent',
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
    if (step === 'welcome')        navigate('/')
    else if (step === 'disability') gotoStep('welcome')
    else if (step === 'goal')       gotoStep('disability')
    else if (step === 'confirm')    gotoStep('goal')
  }

  const canProceed =
    step === 'welcome' ||
    (step === 'disability' && disabilityTypes.length > 0) ||
    (step === 'goal'       && goals.length > 0) ||
    (step === 'confirm'    && disabilityTypes.length > 0 && goals.length > 0)
  const stepAnnouncement = `Adım ${stepIndex(step) + 1}/4. ${STEP_SCREEN_TITLES[step]}`

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div id="aria-live-region" className="sr-only" aria-live="polite" aria-atomic="true">
        {stepAnnouncement}
      </div>

      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <Link to="/" aria-label="UYUM Ana Sayfa" className="flex items-center gap-2">
          <UyumLogo />
          <span className="text-lg font-extrabold text-[#320E3B]">UYUM</span>
        </Link>
        <ProgressBar step={step} />
      </header>

      {/* Main split layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left rail */}
        <aside className="hidden md:flex w-[38%] flex-col justify-center px-10 py-12 bg-white border-r border-gray-100">
          <LeftRail step={step} />
        </aside>

        {/* Right content */}
        <main className="flex-1 overflow-y-auto bg-[#f8f7f7] px-6 py-10 md:px-12 lg:px-16">
          {step === 'welcome' && (
            <WelcomeStep headingRef={headingRef} onPrimary={next} />
          )}
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
          {step === 'goal' && (
            <MultiSelectStep
              headingRef={headingRef}
              headingId="goal-heading"
              title="Hedeflerini seç"
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
              goals={goals}
              onEditDisability={() => gotoStep('disability')}
              onEditGoal={() => gotoStep('goal')}
            />
          )}

          {/* Footer nav */}
          {step !== 'welcome' && (
            <div className="mt-8 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={back}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-[#320E3B] hover:border-gray-300 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4C2A85]"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden /> Geri
              </button>
              <button
                type="button"
                onClick={next}
                disabled={!canProceed}
                aria-disabled={!canProceed}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4C2A85]',
                  canProceed
                    ? 'bg-[#4C2A85] text-white hover:bg-[#320E3B]'
                    : 'cursor-not-allowed bg-gray-200 text-gray-400',
                )}
              >
                {step === 'confirm' ? 'Keşfetmeye Başla' : 'Devam Et'}
                <ArrowRight className="w-4 h-4" aria-hidden />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

/* ---------- Progress bar ---------- */

function ProgressBar({ step }: { step: StepName }) {
  const idx = stepIndex(step)
  return (
    <div
      className="flex items-center gap-3 text-xs text-gray-400"
      aria-label={`Adım ${idx + 1} / 4`}
    >
      <span className="hidden font-semibold text-gray-500 sm:inline">Adım {idx + 1}/4</span>
      <div className="flex items-center gap-1.5" aria-hidden>
        {STEP_PATHS.map((_, i) => (
          <span
            key={i}
            className={cn(
              'h-2 rounded-full transition-all',
              i < idx  ? 'w-6 bg-[#4C2A85]' :
              i === idx ? 'w-8 bg-[#4C2A85]' :
                          'w-6 bg-gray-200',
            )}
          />
        ))}
      </div>
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
        { icon: MapPin,       bg: '#E0F7FA', color: '#00BCD4' },
        { icon: Activity,     bg: '#E8F5E9', color: '#43A047' },
        { icon: Calendar,     bg: '#F3E5F5', color: '#7B2FBE' },
        { icon: GraduationCap, bg: '#FFF3E0', color: '#FF6B35' },
      ],
    },
    disability: {
      title: 'Seni daha iyi tanımak istiyoruz',
      body:  'Doğru öneriler ve rehberlik sunabilmek için engellilik durumunu seçmemiz önemli.',
      icons: [
        { icon: Accessibility, bg: '#F3E5F5', color: '#7B2FBE' },
        { icon: Eye,           bg: '#E0F7FA', color: '#00BCD4' },
        { icon: Ear,           bg: '#E8F5E9', color: '#43A047' },
        { icon: Hand,          bg: '#FFF3E0', color: '#FF6B35' },
      ],
      note: 'Bu bilgi sadece sana özel içerik için kullanılır. Gizliliğin bizim için önemli.',
    },
    goal: {
      title: 'Hedeflerini öğrenelim',
      body:  'Spor ve fiziksel aktiviteyle ilgili hedeflerini seç. Sana en uygun önerileri hazırlayabilelim.',
      icons: [
        { icon: Dumbbell,    bg: '#F3E5F5', color: '#7B2FBE' },
        { icon: Target,      bg: '#E0F7FA', color: '#00BCD4' },
        { icon: Heart,       bg: '#FCE4EC', color: '#EC407A' },
        { icon: Trophy,      bg: '#E0F2F1', color: '#00897B' },
      ],
      note: 'Bu bilgiler sana özel olarak kullanılır. İlgilerini sonra değiştirebilirsin.',
    },
    confirm: {
      title: 'Profilin hazır! Sana özel bir deneyim seni bekliyor.',
      body:  'Bu bilgilerle sana en uygun tesisleri, sporları, etkinlikleri ve uzman koçları öneriyoruz.',
      icons: [
        { icon: CheckCircle2, bg: '#E8F5E9', color: '#43A047' },
        { icon: Sparkles,     bg: '#F3E5F5', color: '#7B2FBE' },
        { icon: MapPin,       bg: '#E0F7FA', color: '#00BCD4' },
        { icon: GraduationCap, bg: '#FFF3E0', color: '#FF6B35' },
      ],
      note: 'Güvende olabilirsin. Bilgilerin yalnızca sana özel olacak.',
    },
  }

  const { eyebrow, title, body, icons, note } = map[step]

  return (
    <div className="space-y-6 max-w-xs">
      {eyebrow && (
        <p className="text-xs font-bold uppercase tracking-widest text-[#4C2A85]">{eyebrow}</p>
      )}

      <h2 className="text-3xl font-extrabold text-[#320E3B] leading-tight">
        {title}
      </h2>

      <p className="text-sm text-gray-500 leading-relaxed">{body}</p>

      <div aria-hidden className="grid grid-cols-2 gap-3">
        {icons.map(({ icon: Icon, bg, color }, i) => (
          <div
            key={i}
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: bg }}
          >
            <Icon className="w-7 h-7" style={{ color }} strokeWidth={1.7} />
          </div>
        ))}
      </div>

      {note && (
        <div className="flex items-start gap-3 rounded-2xl bg-[#F3E5F5] px-4 py-3">
          <ShieldCheck className="mt-0.5 w-4 h-4 shrink-0 text-[#7B2FBE]" aria-hidden />
          <p className="text-xs text-[#4C2A85]/80 leading-relaxed">{note}</p>
        </div>
      )}
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
    { icon: MapPin,       label: 'Uygun Tesisleri Keşfet',  bg: '#E0F7FA', color: '#00BCD4' },
    { icon: Activity,     label: 'Sporlar ve Egzersizler',  bg: '#E8F5E9', color: '#43A047' },
    { icon: Calendar,     label: 'Etkinlikleri Takip Et',   bg: '#F3E5F5', color: '#7B2FBE' },
    { icon: GraduationCap, label: 'Koçlarla Tanış',         bg: '#FFF3E0', color: '#FF6B35' },
  ]

  return (
    <div className="space-y-8 max-w-lg">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-[#4C2A85] mb-4">Adım 1/4</p>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-3xl font-extrabold text-[#320E3B] leading-tight outline-none md:text-4xl"
        >
          Başlayalım.
        </h1>
        <p className="mt-3 text-sm text-gray-500 leading-relaxed md:text-base">
          UYUM ile sana uygun tesisleri, sporları, etkinlikleri ve uzman koçları tanıyacaksın.
          Birkaç soruyla profilini oluşturalım — sadece 1 dakika.
        </p>
      </div>

      <div className="overflow-hidden rounded-[1.5rem] border border-gray-100 bg-white shadow-sm">
        <img
          src={heroAthletes}
          alt="Birlikte spor yapan kullanıcılar"
          className="h-48 w-full object-contain p-5"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {featureItems.map(({ icon: Icon, label, bg, color }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-2 rounded-2xl bg-white border border-gray-100 p-4 text-center shadow-sm"
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: bg }}
              aria-hidden
            >
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <span className="text-xs font-bold text-[#320E3B]">{label}</span>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-[#43A047] shrink-0" aria-hidden />
        <div>
          <p className="text-xs font-bold text-[#320E3B]">Güvenli. Erişilebilir. Topluluk Odaklı.</p>
          <p className="text-xs text-gray-400 mt-0.5">Bilgilerin yalnızca kişisel öneriler için kullanılır.</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onPrimary}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#4C2A85] px-6 py-3.5 text-sm font-bold text-white hover:bg-[#320E3B] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4C2A85]"
      >
        Başlayalım <ArrowRight className="w-4 h-4" aria-hidden />
      </button>

      <p className="text-center text-xs text-gray-400">
        Zaten hesabın var mı?{' '}
        <Link to="/" className="font-bold text-[#4C2A85] hover:text-[#320E3B]">
          Giriş yap
        </Link>
      </p>
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
        'relative flex flex-col items-start gap-3 rounded-2xl border-2 p-5 text-left transition-all w-full',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4C2A85]',
        'motion-reduce:transition-none',
        selected
          ? 'border-[#4C2A85] shadow-sm'
          : 'border-gray-200 bg-white hover:border-gray-300',
      )}
      style={{ backgroundColor: selected ? selectedBg : undefined }}
    >
      <div className="absolute top-3 right-3">
        {selected
          ? <CheckCircle2 className="w-5 h-5 text-[#4C2A85]" aria-hidden />
          : <Circle className="w-5 h-5 text-gray-300" aria-hidden />}
      </div>
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors"
        style={{ backgroundColor: selected ? 'white' : selectedBg }}
      >
        <Icon className="w-6 h-6" style={{ color: iconColor }} aria-hidden />
      </div>
      <div className="pr-6">
        <p className="text-base font-bold text-[#320E3B]">{title}</p>
        {desc && <p className="text-xs text-gray-500 mt-1 leading-relaxed">{desc}</p>}
      </div>
    </button>
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
    <div className="max-w-2xl">
      <h1
        ref={headingRef}
        tabIndex={-1}
        id={headingId}
        className="mb-6 text-2xl font-extrabold text-[#320E3B] outline-none md:text-3xl"
      >
        {title}
      </h1>

      <div
        role="group"
        aria-labelledby={headingId}
        className={cn(
          'grid gap-3',
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

      <p className="mt-4 text-xs text-gray-400">{note}</p>
    </div>
  )
}

/* ---------- Confirm step ---------- */

function ConfirmStep({
  headingRef, disabilityTypes, goals, onEditDisability, onEditGoal,
}: {
  headingRef: RefObject<HTMLHeadingElement | null>
  disabilityTypes: DisabilityType[]
  goals:           Goal[]
  onEditDisability: () => void
  onEditGoal:       () => void
}) {
  const profileForMatch = {
    disabilityTypes,
    goals,
    mobilityLevel: 'independent' as const,
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

  return (
    <div className="max-w-lg">
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="mb-2 text-2xl font-extrabold text-[#320E3B] outline-none md:text-3xl"
      >
        Seçimlerini kontrol et
      </h1>
      <p className="text-sm text-gray-500 mb-6">İstediğin zaman ayarlardan güncelleyebilirsin.</p>

      <ul className="space-y-3">
        <ConfirmRow
          icon={Accessibility}
          iconColor="#7B2FBE"
          iconBg="#F3E5F5"
          label="Engellilik durumun"
          value={disabilityTypes.map(d => DISABILITY_LABELS[d]).join(', ')}
          onEdit={onEditDisability}
        />
        <ConfirmRow
          icon={Target}
          iconColor="#00BCD4"
          iconBg="#E0F7FA"
          label="Hedeflerin"
          value={goals.map(g => GOAL_LABELS[g]).join(', ')}
          onEdit={onEditGoal}
        />
        {suggestedSports && (
          <li className="flex items-center gap-3 rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
            <span
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#E8F5E9' }}
              aria-hidden
            >
              <Sparkles className="w-5 h-5" style={{ color: '#43A047' }} />
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Sana önerilen sporlar</div>
              <div className="text-sm font-bold text-[#320E3B] mt-0.5 truncate">{suggestedSports}</div>
            </div>
          </li>
        )}
      </ul>

      <div className="mt-5 flex items-start gap-3 rounded-2xl bg-[#E8F5E9] border border-[#C8E6C9] px-4 py-3">
        <CheckCircle2 className="mt-0.5 w-4 h-4 shrink-0 text-[#43A047]" aria-hidden />
        <p className="text-xs text-[#2E7D32] leading-relaxed">
          Harika! Profilini oluştur — ana sayfada sana özel öneriler seni bekliyor.
        </p>
      </div>
    </div>
  )
}

function ConfirmRow({
  icon: Icon, iconColor, iconBg, label, value, onEdit,
}: {
  icon: LucideIcon
  iconColor: string
  iconBg: string
  label: string
  value: string
  onEdit: () => void
}) {
  return (
    <li className="flex items-center gap-3 rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
      <span
        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: iconBg }}
        aria-hidden
      >
        <Icon className="w-5 h-5" style={{ color: iconColor }} />
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</div>
        <div className="text-sm font-bold text-[#320E3B] mt-0.5 line-clamp-2">{value || '—'}</div>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="text-xs font-bold text-[#4C2A85] hover:text-[#320E3B] shrink-0 flex items-center gap-1"
      >
        Değiştir
      </button>
    </li>
  )
}
