import { Link } from 'react-router-dom'
import { Bookmark } from 'lucide-react'

interface Props {
  to: string
  title: string
  subtitle?: string
  tone?: string
  onRemove?: () => void
}

export function MiniFavCard({ to, title, subtitle, tone = 'bg-primary/10 text-primary', onRemove }: Props) {
  return (
    <div className="group relative">
      <Link
        to={to}
        className="flex min-w-0 flex-col py-2 pr-7 transition"
      >
        <span className="truncate text-[13px] font-medium text-foreground transition group-hover:text-primary hc:text-black">
          {title}
        </span>
        {subtitle && (
          <span className="truncate text-[11px] text-muted-foreground">{subtitle}</span>
        )}
      </Link>

      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`${title} kaydedilenlerden çıkar`}
          className={`absolute right-0 top-1/2 -translate-y-1/2 rounded-md p-1 opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100 ${tone}`}
        >
          <Bookmark className="size-3.5 fill-current" aria-hidden />
        </button>
      )}
    </div>
  )
}
