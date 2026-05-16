import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { OnboardingStep } from '../components/feature/OnboardingStep'
import { useProfile } from '../contexts/ProfileContext'
import type { DisabilityType, MobilityLevel, Goal, UserProfile } from '../types'

const DISABILITY_OPTIONS: { value: DisabilityType; label: string; description: string }[] = [
  { value: 'wheelchair', label: 'Tekerlekli Sandalye', description: 'Manuel veya elektrikli tekerlekli sandalye kullananlar' },
  { value: 'visual',     label: 'Görme',               description: 'Görme kaybı veya düşük görme yaşayanlar' },
  { value: 'hearing',    label: 'İşitme',              description: 'İşitme kaybı veya sağırlık yaşayanlar' },
  { value: 'upper_limb', label: 'Üst Ekstremite',      description: 'Kol veya el fonksiyon kaybı yaşayanlar' },
]

const MOBILITY_OPTIONS: { value: MobilityLevel; label: string; description: string }[] = [
  { value: 'sitting',     label: 'Oturarak',  description: 'Aktiviteleri oturarak yapıyorum' },
  { value: 'supported',   label: 'Destekle',  description: 'Yardımcı ekipman veya kişiyle hareket ediyorum' },
  { value: 'independent', label: 'Bağımsız',  description: 'Bağımsız olarak hareket edebiliyorum' },
]

const GOAL_OPTIONS: { value: Goal; label: string; description: string }[] = [
  { value: 'strength',    label: 'Güç',       description: 'Kas gücü ve dayanıklılık geliştirmek istiyorum' },
  { value: 'flexibility', label: 'Esneklik',  description: 'Hareket açıklığı ve esneklik geliştirmek istiyorum' },
  { value: 'social',      label: 'Sosyal',    description: 'Spor aracılığıyla sosyal bağlar kurmak istiyorum' },
  { value: 'compete',     label: 'Yarışma',   description: 'Adaptif sporla yarışmak istiyorum' },
]

const DEFAULT_ACCESSIBILITY: UserProfile['accessibility'] = {
  colorblindMode: 'none',
  highContrast:   false,
  fontSize:       'normal',
  speechEnabled:  false,
}

export function Onboarding() {
  const navigate = useNavigate()
  const { setProfile } = useProfile()

  const [step, setStep] = useState<0 | 1 | 2>(0)
  const [disabilityType, setDisabilityType] = useState<DisabilityType | null>(null)
  const [mobilityLevel, setMobilityLevel]   = useState<MobilityLevel | null>(null)
  const [goal, setGoal]                     = useState<Goal | null>(null)

  function goNext() {
    if (step === 0 && disabilityType) setStep(1)
    else if (step === 1 && mobilityLevel) setStep(2)
    else if (step === 2 && goal && disabilityType && mobilityLevel) {
      setProfile({
        disabilityType,
        mobilityLevel,
        goal,
        city:               'Ankara',
        favoriteFacilities: [],
        favoriteEvents:     [],
        accessibility:      DEFAULT_ACCESSIBILITY,
      })
      // Announce completion to screen readers
      const region = document.getElementById('aria-live-region')
      if (region) region.textContent = 'Profiliniz oluşturuldu. Ana sayfaya yönlendiriliyorsunuz.'
      navigate('/')
    }
  }

  function goBack() {
    if (step === 1) setStep(0)
    else if (step === 2) setStep(1)
  }

  function announceStep(n: number) {
    const region = document.getElementById('aria-live-region')
    if (region) region.textContent = `Adım ${n + 1} / 3`
  }

  const canProceed =
    (step === 0 && disabilityType !== null) ||
    (step === 1 && mobilityLevel !== null) ||
    (step === 2 && goal !== null)

  return (
    <div className="min-h-screen bg-uyum-dark flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {step === 0 && (
          <OnboardingStep
            stepNumber={1}
            totalSteps={3}
            title="Engel tipiniz nedir?"
            options={DISABILITY_OPTIONS}
            selected={disabilityType}
            onSelect={v => { setDisabilityType(v); announceStep(0) }}
          />
        )}
        {step === 1 && (
          <OnboardingStep
            stepNumber={2}
            totalSteps={3}
            title="Hareket durumunuz nedir?"
            options={MOBILITY_OPTIONS}
            selected={mobilityLevel}
            onSelect={v => { setMobilityLevel(v); announceStep(1) }}
          />
        )}
        {step === 2 && (
          <OnboardingStep
            stepNumber={3}
            totalSteps={3}
            title="Hedefiniz nedir?"
            options={GOAL_OPTIONS}
            selected={goal}
            onSelect={v => { setGoal(v); announceStep(2) }}
          />
        )}

        <div className="flex items-center gap-3 mt-8">
          {step > 0 && (
            <button
              type="button"
              onClick={goBack}
              className="px-5 py-2.5 rounded-lg border border-white/30 text-white/70 text-sm font-body hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-uyum-purple"
            >
              Geri
            </button>
          )}
          <button
            type="button"
            onClick={goNext}
            disabled={!canProceed}
            className={[
              'px-6 py-2.5 rounded-lg text-sm font-heading font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-uyum-purple',
              canProceed
                ? 'bg-uyum-purple text-white hover:bg-uyum-blue'
                : 'bg-white/10 text-white/30 cursor-not-allowed',
            ].join(' ')}
            aria-disabled={!canProceed}
          >
            {step === 2 ? 'Profili Oluştur' : 'Devam'}
          </button>
        </div>

        {/* Progress dots */}
        <div className="flex gap-2 mt-6" role="presentation">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className={[
                'h-1.5 rounded-full transition-all',
                i === step ? 'bg-uyum-purple w-6' : 'bg-white/20 w-3',
              ].join(' ')}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
