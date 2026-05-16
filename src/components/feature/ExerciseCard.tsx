import type { Exercise, DisabilityType } from '../../types'

const DISABILITY_LABELS: Record<DisabilityType, string> = {
  wheelchair: 'Tekerlekli Sandalye',
  visual:     'Görme',
  hearing:    'İşitme',
  upper_limb: 'Üst Ekstremite',
}

function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60)
  return `${minutes} dk`
}

interface ExerciseCardProps {
  exercise: Exercise
}

export function ExerciseCard({ exercise }: ExerciseCardProps) {
  const titleId = `ex-${exercise.id}-title`

  return (
    <article
      aria-labelledby={titleId}
      className="
        flex flex-col rounded-xl border border-white/10 bg-white/5
        overflow-hidden transition-colors hover:border-uyum-purple/40
      "
    >
      <div className="relative aspect-video bg-black">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${exercise.youtubeId}`}
          title={exercise.title}
          loading="lazy"
          allow="accelerometer; encrypted-media; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
        {exercise.hasSubtitles && (
          <span
            className="
              absolute top-2 right-2 inline-flex items-center gap-1
              px-2 py-0.5 rounded-md text-[10px] font-medium
              bg-black/70 text-uyum-frost-mint border border-white/20
            "
            aria-label="Altyazılı içerik"
          >
            <span aria-hidden="true">🔠</span>
            Altyazılı
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2 p-4">
        <header className="flex items-start justify-between gap-2">
          <h3 id={titleId} className="text-sm font-heading font-semibold text-white leading-snug">
            {exercise.title}
          </h3>
          <span className="text-[10px] uppercase tracking-wider text-white/50 font-heading flex-shrink-0">
            {formatDuration(exercise.duration)}
          </span>
        </header>

        <p className="text-xs text-white/70 font-body leading-relaxed line-clamp-3">
          {exercise.description}
        </p>

        <div className="flex flex-wrap gap-1.5 mt-1" aria-label="Etiketler">
          {exercise.disabilityTypes.map(d => (
            <span
              key={d}
              className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/10"
            >
              {DISABILITY_LABELS[d]}
            </span>
          ))}
          <span
            className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/10 uppercase"
          >
            {exercise.language === 'tr' ? 'Türkçe' : 'İngilizce'}
          </span>
        </div>

        <p
          className="text-[11px] text-amber-300/90 mt-2 leading-snug border-t border-white/10 pt-2"
          role="note"
        >
          Bu içerikler bilgilendirme amaçlıdır. Ağrı varsa dur.
        </p>
      </div>
    </article>
  )
}
