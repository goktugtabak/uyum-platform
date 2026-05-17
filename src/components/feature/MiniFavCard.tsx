import { Link } from 'react-router-dom'
import { BookmarkCheck } from 'lucide-react'

interface Props {
  to: string
  title: string
  subtitle?: string
  tone?: string
}

export function MiniFavCard({ to, title, subtitle, tone = 'bg-primary/10 text-primary' }: Props) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-2xl bg-card p-3.5 ring-1 ring-border/40 transition hover:ring-primary/40 hover:shadow-sm hc:bg-white hc:ring-black"
    >
      <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${tone}`}>
        <BookmarkCheck className="size-4" aria-hidden />
      </span>
      <div className="min-w-0">
        <div className="truncate text-[13px] font-semibold text-foreground group-hover:text-primary hc:text-black">
          {title}
        </div>
        {subtitle && (
          <div className="truncate text-[11px] text-muted-foreground">{subtitle}</div>
        )}
      </div>
    </Link>
  )
}
