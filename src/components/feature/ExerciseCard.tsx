import { Clock, User, Play } from 'lucide-react'
import type { Exercise, DisabilityType } from '../../types'
import { useProfile } from '../../contexts/ProfileContext'
import { BookmarkButton } from '../ui/BookmarkButton'

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
  const { profile, toggleFavoriteExercise } = useProfile()
  const titleId = `ex-${exercise.id}-title`
  const primaryDisability = exercise.disabilityTypes[0]

  return (
    <article
      aria-labelledby={titleId}
      className="group flex flex-col overflow-hidden rounded-2xl bg-card ring-1 ring-border/40 transition hover:-translate-y-0.5 hover:shadow-card hc:bg-white hc:ring-black"
    >
      <div className="relative aspect-video bg-black">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${exercise.youtubeId}`}
          title={exercise.title}
          loading="lazy"
          allow="accelerometer; encrypted-media; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
        {exercise.hasSubtitles && (
          <span
            aria-label="Altyazılı içerik"
            className="absolute left-3 top-3 rounded-md bg-card/95 px-2 py-0.5 text-[11px] font-bold text-primary-deep backdrop-blur"
          >
            Altyazılı
          </span>
        )}
        <span
          aria-hidden
          className="absolute bottom-3 right-3 rounded-md bg-primary-deep/85 px-2 py-0.5 text-[11px] font-bold text-primary-foreground"
        >
          {formatDuration(exercise.duration)}
        </span>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 m-auto grid size-14 place-items-center rounded-full bg-card/95 text-primary-deep opacity-0 shadow-card transition group-hover:scale-110 group-hover:opacity-100"
        >
          <Play className="size-5 fill-current" />
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 id={titleId} className="text-[14.5px] font-extrabold leading-snug text-primary-deep line-clamp-2 hc:text-black">
          {exercise.title}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-2 hc:text-black">
          {exercise.description}
        </p>

        <div className="mt-1 flex flex-wrap gap-1.5">
          {exercise.disabilityTypes.slice(0, 2).map(d => (
            <span
              key={d}
              className="rounded-full bg-mint/50 px-2 py-0.5 text-[10px] font-bold text-mint-foreground"
            >
              {DISABILITY_LABELS[d]}
            </span>
          ))}
          <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold uppercase text-accent">
            {exercise.language === 'tr' ? 'TR' : 'EN'}
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-border/40 pt-3 text-[11.5px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <User aria-hidden className="size-3" /> {primaryDisability ? DISABILITY_LABELS[primaryDisability] : 'Genel'}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock aria-hidden className="size-3" /> {formatDuration(exercise.duration)}
          </span>
          <BookmarkButton
            isBookmarked={profile?.favoriteExercises?.includes(exercise.id) ?? false}
            onToggle={() => toggleFavoriteExercise(exercise.id)}
            label={exercise.title}
          />
        </div>
      </div>
    </article>
  )
}
