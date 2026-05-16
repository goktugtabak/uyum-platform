interface Option<T extends string> {
  value: T
  label: string
  description?: string
}

interface OnboardingStepProps<T extends string> {
  stepNumber: number
  totalSteps: number
  title: string
  options: Option<T>[]
  selected: T | null
  onSelect: (value: T) => void
}

export function OnboardingStep<T extends string>({
  stepNumber,
  totalSteps,
  title,
  options,
  selected,
  onSelect,
}: OnboardingStepProps<T>) {
  const titleId = `step-${stepNumber}-title`

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-2 text-xs text-white/50 font-body uppercase tracking-widest">
        Adım {stepNumber} / {totalSteps}
      </div>
      <h2
        id={titleId}
        className="text-2xl font-heading font-bold text-white mb-6"
      >
        {title}
      </h2>

      <fieldset
        role="radiogroup"
        aria-labelledby={titleId}
        className="border-0 p-0 m-0"
      >
        <legend className="sr-only">{title}</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {options.map(opt => {
            const isSelected = opt.value === selected
            return (
              <label
                key={opt.value}
                className={[
                  'flex flex-col gap-1 p-4 rounded-xl border-2 cursor-pointer transition-all',
                  'focus-within:ring-2 focus-within:ring-uyum-purple focus-within:ring-offset-2 focus-within:ring-offset-uyum-dark',
                  isSelected
                    ? 'border-uyum-purple bg-uyum-purple/20 text-white'
                    : 'border-white/20 bg-white/5 text-white/80 hover:border-white/40 hover:bg-white/10',
                ].join(' ')}
              >
                <input
                  type="radio"
                  name={`step-${stepNumber}`}
                  value={opt.value}
                  checked={isSelected}
                  onChange={() => onSelect(opt.value)}
                  className="sr-only"
                />
                <span className="font-heading font-semibold text-base">{opt.label}</span>
                {opt.description && (
                  <span className="text-xs opacity-70 font-body">{opt.description}</span>
                )}
              </label>
            )
          })}
        </div>
      </fieldset>
    </div>
  )
}
