import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Accessibility, Eye, Ear, Hand,
  Activity, Heart, Target, Users, Sparkles, Trophy,
  PersonStanding, ArmchairIcon, Footprints,
  ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck, MapPin, Calendar, GraduationCap,
} from 'lucide-react'
import { OnboardingStep } from '../components/feature/OnboardingStep'
import { UyumLogo } from '../components/ui/UyumLogo'
import { useProfile } from '../contexts/ProfileContext'
import type { DisabilityType, MobilityLevel, Goal, UserProfile } from '../types'

const DISABILITY_OPTIONS = [
  { value: 'wheelchair' as DisabilityType, label: 'Tekerlekli sandalye kullanıyorum', description: 'Manuel veya elektrikli tekerlekli sandalye kullananlar.', icon: Accessibility },
  { value: 'visual'     as DisabilityType, label: 'Görme engelliyim',                  description: 'Görme kaybı veya düşük görme yaşayanlar.',                icon: Eye },
  { value: 'hearing'    as DisabilityType, label: 'İşitme engelliyim',                 description: 'İşitme kaybı veya sağırlık yaşayanlar.',                 icon: Ear },
  { value: 'upper_limb' as DisabilityType, label: 'Üst ekstremite kısıtım var',        description: 'Kol veya el fonksiyon kaybı yaşayanlar.',                icon: Hand },
]

const MOBILITY_OPTIONS = [
  { value: 'sitting'     as MobilityLevel, label: 'Oturarak',  description: 'Aktiviteleri oturarak yapıyorum.',                        icon: ArmchairIcon },
  { value: 'supported'   as MobilityLevel, label: 'Destekle',  description: 'Yardımcı ekipman veya kişiyle hareket ediyorum.',          icon: PersonStanding },
  { value: 'independent' as MobilityLevel, label: 'Bağımsız',  description: 'Bağımsız olarak hareket edebiliyorum.',                    icon: Footprints },
]

const GOAL_OPTIONS = [
  { value: 'strength'    as Goal, label: 'Güçlenmek',       description: 'Kas gücümü artırmak istiyorum.',                  icon: Activity },
  { value: 'flexibility' as Goal, label: 'Esnekliğimi artırmak', description: 'Daha esnek ve hareket aralığı geniş olmak istiyorum.', icon: Sparkles },
  { value: 'social'      as Goal, label: 'Sosyal olmak',    description: 'Spor aracılığıyla sosyal bağlar kurmak istiyorum.', icon: Heart },
  { value: 'compete'     as Goal, label: 'Rekabet etmek',   description: 'Yarışmalara katılmak istiyorum.',                  icon: Trophy },
]

const DEFAULT_ACCESSIBILITY: UserProfile['accessibility'] = {
  colorblindMode: 'none',
  highContrast:   false,
  fontSize:       'normal',
  speechEnabled:  false,
}

type Step = 0 | 1 | 2 | 3

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

export function Onboarding() {
  const navigate = useNavigate()
  const { setProfile } = useProfile()

  const [step, setStep] = useState<Step>(0)
  const [disabilityType, setDisabilityType] = useState<DisabilityType | null>(null)
  const [mobilityLevel, setMobilityLevel]   = useState<MobilityLevel | null>(null)
  const [goal, setGoal]                     = useState<Goal | null>(null)

  function announce(msg: string) {
    const region = document.getElementById('aria-live-region')
    if (region) region.textContent = msg
  }

  function next() {
    if (step === 0) {
      setStep(1)
      announce('Adım 2/4. Engelli durumunu seç.')
    } else if (step === 1 && disabilityType) {
      setStep(2)
      announce('Adım 3/4. Hedefini seç.')
    } else if (step === 2 && goal) {
      // Mobility level isteyen sub-step: yine adım 3 içinde ama ayrı görüntü
      setStep(3)
      announce('Adım 4/4. Profilini onayla.')
    } else if (step === 3 && disabilityType && goal) {
      const mobility = mobilityLevel ?? 'independent'
      setProfile({
        disabilityType,
        mobilityLevel: mobility,
        goal,
        city:               'Ankara',
        favoriteFacilities: [],
        favoriteEvents:     [],
        accessibility:      DEFAULT_ACCESSIBILITY,
      })
      announce('Profilin oluşturuldu. Ana sayfaya yönlendiriliyorsun.')
      navigate('/dashboard')
    }
  }

  function back() {
    if (step === 0) navigate('/')
    else if (step === 1) setStep(0)
    else if (step === 2) setStep(1)
    else if (step === 3) setStep(2)
  }

  const canProceed =
    step === 0 ||
    (step === 1 && disabilityType !== null) ||
    (step === 2 && goal !== null) ||
    (step === 3 && mobilityLevel !== null)

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Ambient lights */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 right-1/3 h-[40rem] w-[40rem] rounded-full bg-accent/15 blur-[150px]" />
        <div className="absolute top-1/2 -left-32 h-[34rem] w-[34rem] rounded-full bg-mint/40 blur-[140px]" />
        <div className="absolute -bottom-40 right-0 h-[30rem] w-[30rem] rounded-full bg-sky/40 blur-[140px]" />
      </div>

      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 md:px-8">
        <Link to="/" aria-label="UYUM Ana Sayfa"><UyumLogo /></Link>
        <ProgressBar step={step} />
      </header>

      <main className="mx-auto grid max-w-6xl items-start gap-10 px-4 py-6 md:grid-cols-12 md:px-8 md:py-10">
        {/* Left rail — copy + illustration */}
        <aside className="md:col-span-5 lg:col-span-4">
          <LeftRail step={step} />
        </aside>

        {/* Right card */}
        <section className="md:col-span-7 lg:col-span-8">
          <div className="rounded-3xl bg-card/85 p-6 ring-1 ring-border/40 backdrop-blur shadow-soft md:p-8">
            {step === 0 && <WelcomeStep />}

            {step === 1 && (
              <OnboardingStep
                stepLabel="Adım 2/4"
                title="Seni daha iyi tanımak istiyoruz"
                subtitle="Doğru önerileri verebilmek için engelli durumunu seç."
                options={DISABILITY_OPTIONS}
                selected={disabilityType}
                onSelect={setDisabilityType}
              />
            )}

            {step === 2 && (
              <OnboardingStep
                stepLabel="Adım 3/4"
                title="Hedeflerini öğrenelim"
                subtitle="Sana en uygun spor önerilerini yapabilmemiz için hedeflerini seç."
                options={GOAL_OPTIONS}
                selected={goal}
                onSelect={setGoal}
              />
            )}

            {step === 3 && (
              <ConfirmStep
                disabilityType={disabilityType}
                mobilityLevel={mobilityLevel}
                goal={goal}
                onMobilitySelect={setMobilityLevel}
                onEditDisability={() => setStep(1)}
                onEditGoal={() => setStep(2)}
              />
            )}

            {/* Nav */}
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
                {step === 0 ? 'Başlayalım' : step === 3 ? 'Kaydolmaya başla' : 'Devam Et'}
                <ArrowRight className="size-4" aria-hidden />
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

function ProgressBar({ step }: { step: Step }) {
  const labels = ['1/4', '2/4', '3/4', '4/4']
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground" aria-label={`Adım ${step + 1} / 4`}>
      <span className="hidden font-semibold text-foreground sm:inline">Adım</span>
      <div className="flex items-center gap-1.5">
        {labels.map((l, i) => (
          <span
            key={l}
            aria-hidden
            className={`h-2 w-7 rounded-full transition ${
              i <= step ? 'bg-primary' : 'bg-border'
            }`}
          />
        ))}
      </div>
      <span className="ml-1 font-semibold text-primary">{labels[step]}</span>
    </div>
  )
}

function LeftRail({ step }: { step: Step }) {
  const map: Record<Step, { title: string; body: string; icons: React.ReactNode[] }> = {
    0: {
      title: 'Spor herkes içindir. Bizimle uyum içinde harekete geç.',
      body: 'UYUM, engelli bireylerin spor ve fiziksel aktivitelere erişimini kolaylaştıran bir platformdur. Yakındaki tesisleri keşfet, sporları öğren, etkinliklere katıl ve topluluğun bir parçası ol.',
      icons: [<MapPin key="m" />, <Activity key="a" />, <Calendar key="c" />, <Users key="u" />],
    },
    1: {
      title: 'Seni daha iyi tanımak istiyoruz',
      body: 'Doğru öneriler ve rehberlik sunabilmek için engelli durumunu seçmemiz önemli. Verilerin sadece sana özel öneriler oluşturmak için kullanılır.',
      icons: [<Eye key="e" />, <Ear key="r" />, <Hand key="h" />, <Accessibility key="ac" />],
    },
    2: {
      title: 'Hedeflerini öğrenelim',
      body: 'Spor ve fiziksel aktiviteyle ilgili hedeflerini seç. Sana en uygun spor önerilerini hazırlayabilelim.',
      icons: [<Target key="t" />, <Activity key="a" />, <Heart key="he" />, <Sparkles key="s" />],
    },
    3: {
      title: 'Profilin hazır! Sana özel bir deneyim seni bekliyor.',
      body: 'Bu bilgilerle sana en uygun tesisleri, sporları, etkinlikleri ve içerikleri öneriyoruz.',
      icons: [<MapPin key="m" />, <CheckCircle2 key="c" />, <Heart key="h" />, <GraduationCap key="g" />],
    },
  }
  const { title, body, icons } = map[step]

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-extrabold leading-tight text-primary-deep md:text-4xl">
        {title}
      </h1>
      <p className="max-w-md text-sm leading-relaxed text-foreground/75 md:text-base">{body}</p>
      <div aria-hidden className="grid grid-cols-2 gap-3 max-w-xs">
        {icons.map((node, i) => (
          <div
            key={i}
            className={`grid size-16 place-items-center rounded-2xl ${
              i % 4 === 0 ? 'bg-mint/50 text-mint-foreground' :
              i % 4 === 1 ? 'bg-sky/50 text-sky-foreground' :
              i % 4 === 2 ? 'bg-accent/15 text-accent' :
              'bg-[oklch(0.92_0.07_60)] text-[oklch(0.55_0.16_50)]'
            }`}
          >
            <span className="*:size-6">{node}</span>
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

function WelcomeStep() {
  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">Adım 1/4</p>
      <h2 className="font-display text-3xl font-extrabold text-primary-deep md:text-4xl">
        Hoş geldin.
      </h2>
      <p className="max-w-xl text-sm text-muted-foreground md:text-base">
        UYUM ile sana uygun tesisleri, sporları, etkinlikleri ve uzman koçları tanıyacaksın.
        Birkaç soruyla profilini oluşturalım — kişiselleştirilmiş öneriler için sadece 1 dakika.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <FeatureChip icon={<MapPin />} label="Tesisleri Keşfet" tint="sky" />
        <FeatureChip icon={<Activity />} label="Sporları Keşfet" tint="mint" />
        <FeatureChip icon={<Calendar />} label="Etkinlikler" tint="lavender" />
        <FeatureChip icon={<Users />} label="Topluluk" tint="peach" />
      </div>
    </div>
  )
}

function FeatureChip({
  icon, label, tint,
}: {
  icon: React.ReactNode
  label: string
  tint: 'sky' | 'mint' | 'lavender' | 'peach'
}) {
  const bg =
    tint === 'sky' ? 'bg-sky/60 text-sky-foreground' :
    tint === 'mint' ? 'bg-mint/60 text-mint-foreground' :
    tint === 'lavender' ? 'bg-accent/15 text-accent' :
    'bg-[oklch(0.92_0.07_60)] text-[oklch(0.55_0.16_50)]'
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl bg-card p-4 ring-1 ring-border/40 text-center">
      <span aria-hidden className={`grid size-11 place-items-center rounded-full ${bg}`}>
        <span className="*:size-5">{icon}</span>
      </span>
      <span className="text-xs font-bold text-primary-deep">{label}</span>
    </div>
  )
}

function ConfirmStep({
  disabilityType,
  mobilityLevel,
  goal,
  onMobilitySelect,
  onEditDisability,
  onEditGoal,
}: {
  disabilityType: DisabilityType | null
  mobilityLevel: MobilityLevel | null
  goal: Goal | null
  onMobilitySelect: (value: MobilityLevel) => void
  onEditDisability: () => void
  onEditGoal: () => void
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">Adım 4/4</p>
      <h2 className="font-display text-3xl font-extrabold text-primary-deep md:text-4xl">
        Seçimlerini kontrol et
      </h2>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        İstediğin zaman ayarlardan güncelleyebilirsin.
      </p>

      <ul className="mt-6 space-y-3">
        <SummaryRow
          icon={<Accessibility className="size-5" aria-hidden />}
          label="Engelli durumun"
          value={disabilityType ? DISABILITY_LABELS[disabilityType] : '—'}
          onEdit={onEditDisability}
        />
        <SummaryRow
          icon={<Target className="size-5" aria-hidden />}
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
    </div>
  )
}

function SummaryRow({
  icon, label, value, onEdit,
}: {
  icon: React.ReactNode
  label: string
  value: string
  onEdit: () => void
}) {
  return (
    <li className="flex items-center gap-3 rounded-2xl bg-card p-4 ring-1 ring-border/40">
      <span aria-hidden className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
        {icon}
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
