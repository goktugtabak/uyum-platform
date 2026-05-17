import { getSportIcon, getSportLabel, LEGEND_SPORTS } from '../../lib/sport-icons'

const COLOR_ITEMS = [
  { color: '#16a34a', glyph: '', label: 'İyi erişilebilir' },
  { color: '#eab308', glyph: '~', label: 'Kısmen erişilebilir' },
  { color: '#dc2626', glyph: '', label: 'Erişim engeli var' },
  { color: '#6b7280', glyph: '?', label: 'Bilgi yetersiz' },
]

export function MapLegend() {
  return (
    <div className="absolute bottom-4 left-4 z-[400]">
      <details className="group">
        <summary
          className="cursor-pointer select-none rounded-full bg-card/95 px-4 py-1.5 text-xs font-bold text-primary-deep ring-1 ring-border/60 backdrop-blur hover:ring-primary/40 hc:bg-white hc:ring-black hc:text-black"
          aria-label="Harita lejantını aç"
        >
          Lejant
        </summary>

        <div className="mt-2 rounded-2xl bg-card/95 p-4 shadow-card ring-1 ring-border/40 backdrop-blur min-w-[200px] hc:bg-white hc:ring-black">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hc:text-black">
            Erişilebilirlik
          </p>
          <ul role="list" className="space-y-1.5">
            {COLOR_ITEMS.map(({ color, glyph, label }) => (
              <li key={color} className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="inline-flex size-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                  style={{ backgroundColor: color }}
                >
                  {glyph}
                </span>
                <span className="text-xs text-foreground/80 hc:text-black">{label}</span>
              </li>
            ))}
          </ul>

          <p className="mt-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hc:text-black">
            Spor İkonları
          </p>
          <ul role="list" className="grid grid-cols-2 gap-x-3 gap-y-1">
            {LEGEND_SPORTS.map(id => (
              <li key={id} className="flex items-center gap-1.5 text-xs text-foreground/80 hc:text-black">
                <span aria-hidden className="text-sm leading-none">{getSportIcon(id)}</span>
                <span className="truncate">{getSportLabel(id)}</span>
              </li>
            ))}
          </ul>
        </div>
      </details>
    </div>
  )
}
