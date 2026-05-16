import type { LucideIcon } from 'lucide-react'

interface Option<T extends string> {
  value: T
  label: string
  description?: string
  icon?: LucideIcon
}

interface OnboardingStepProps<T extends string> {
  stepLabel?: string
  title: string
  subtitle?: string
  options: Option<T>[]
  selected: T | null
  onSelect: (value: T) => void
  columns?: 2 | 3
}

/**
 * Faz 12 onboarding kart grid'i — light tema, ikon + başlık + açıklama
 * (uyum-step2.png / uyum-step3.png referansından).
 */
export function OnboardingStep<T extends string>({
  stepLabel,
  title,
  subtitle,
  options,
  selected,
  onSelect,
  columns = 2,
}: OnboardingStepProps<T>) {
  const titleId = `onb-${stepLabel ?? title}`.replace(/\s+/g, '-')
  const colsCls = columns === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'

  return (
    <div className="w-full">
      {stepLabel && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
          {stepLabel}
        </p>
      )}
      <h2
        id={titleId}
        className="font-display text-3xl font-extrabold text-primary-deep md:text-4xl"
      >
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2 max-w-xl text-sm text-muted-foreground md:text-base">
          {subtitle}
        </p>
      )}

      <fieldset
        role="radiogroup"
        aria-labelledby={titleId}
        className="mt-6 border-0 p-0 m-0"
      >
        <legend className="sr-only">{title}</legend>
        <div className={`grid grid-cols-1 gap-3 ${colsCls}`}>
          {options.map(opt => {
            const Icon = opt.icon
            const isSelected = opt.value === selected
            return (
              <label
                key={opt.value}
                className={[
                  'flex cursor-pointer flex-col gap-1 rounded-2xl p-4 transition-all',
                  'ring-1 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary hc:ring-black',
                  isSelected
                    ? 'bg-primary/12 ring-primary hc:bg-black hc:text-white'
                    : 'bg-card ring-border/60 hover:ring-primary/40 hover:bg-primary/5',
                ].join(' ')}
              >
                <input
                  type="radio"
                  name={`step-${stepLabel ?? 'opt'}`}
                  value={opt.value}
                  checked={isSelected}
                  onChange={() => onSelect(opt.value)}
                  className="sr-only"
                />
                <div className="flex items-start gap-3">
                  {Icon && (
                    <span
                      aria-hidden
                      className={`mt-0.5 grid size-10 shrink-0 place-items-center rounded-full ${
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-primary/10 text-primary'
                      }`}
                    >
                      <Icon className="size-5" strokeWidth={1.8} />
                    </span>
                  )}
                  <div className="flex-1">
                    <span className="font-display text-base font-extrabold text-primary-deep">
                      {opt.label}
                    </span>
                    {opt.description && (
                      <p className="mt-1 text-[12.5px] text-muted-foreground">
                        {opt.description}
                      </p>
                    )}
                  </div>
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
                </div>
              </label>
            )
          })}
        </div>
      </fieldset>
    </div>
  )
}
