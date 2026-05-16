import { Link } from 'react-router-dom'
import type { MatchResult } from '../../lib/sport-match'

const RANK_LABELS: Record<1 | 2 | 3, string> = {
  1: 'Sana en uygun',
  2: 'Güçlü aday',
  3: 'Denemeye değer',
}

const CATEGORY_LABELS: Record<string, string> = {
  team:       'Takım',
  individual: 'Bireysel',
  adaptive:   'Adaptif',
  water:      'Su Sporu',
  indoor:     'Salon',
  outdoor:    'Açık Alan',
}

interface SportMatchCardProps {
  result: MatchResult
  rank:   1 | 2 | 3
}

export function SportMatchCard({ result, rank }: SportMatchCardProps) {
  const { sport, reason } = result
  const categoryLabel = CATEGORY_LABELS[sport.category] ?? sport.category

  return (
    <article
      aria-labelledby={`sport-${sport.id}-title`}
      className="flex flex-col gap-4 p-6 rounded-xl border border-white/10 bg-white/5 hover:border-uyum-purple/60 transition-colors"
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <span className="text-xs font-body uppercase tracking-widest text-uyum-frost-blue">
          {RANK_LABELS[rank]} · #{rank}
        </span>
        <span className="text-xs font-body text-white/50 px-2 py-1 rounded-full border border-white/10">
          {categoryLabel}
        </span>
      </div>

      <div>
        <h3
          id={`sport-${sport.id}-title`}
          className="text-xl font-heading font-bold text-white mb-2"
        >
          {sport.name}
        </h3>
        <p className="text-sm font-body text-white/70 leading-relaxed">
          {sport.description}
        </p>
      </div>

      <p className="text-sm font-body text-white/90 leading-relaxed border-l-2 border-uyum-purple pl-3">
        {reason}
      </p>

      <div className="flex flex-col sm:flex-row gap-2 mt-auto pt-2">
        <Link
          to={`/map?sport=${sport.id}`}
          className="flex-1 text-center px-4 py-2.5 rounded-lg bg-uyum-purple text-white text-sm font-heading font-semibold hover:bg-uyum-blue transition-colors focus-visible:ring-2 focus-visible:ring-uyum-frost-blue focus-visible:ring-offset-2 focus-visible:ring-offset-uyum-dark"
        >
          Tesisleri gör
        </Link>
        <Link
          to={`/coaches?sport=${sport.id}`}
          className="flex-1 text-center px-4 py-2.5 rounded-lg border border-white/30 text-white/80 text-sm font-heading font-semibold hover:bg-white/10 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-uyum-purple focus-visible:ring-offset-2 focus-visible:ring-offset-uyum-dark"
        >
          Koç bul
        </Link>
      </div>
    </article>
  )
}
