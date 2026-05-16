import { getSportIcon, getSportLabel, LEGEND_SPORTS } from '../../lib/sport-icons'

const COLOR_ITEMS = [
  { color: '#16a34a', label: 'İyi erişilebilir' },
  { color: '#eab308', label: 'Kısmen erişilebilir' },
  { color: '#dc2626', label: 'Erişim engeli var' },
  { color: '#6b7280', label: 'Bilgi yetersiz' },
]

export function MapLegend() {
  return (
    <div className="absolute bottom-4 left-4 z-[400]">
      <details className="group">
        <summary
          className="
            cursor-pointer select-none
            px-3 py-1.5 rounded-lg
            bg-uyum-dark/90 border border-white/20
            text-white text-xs font-heading font-semibold
            hover:bg-uyum-dark focus-visible:ring-2 focus-visible:ring-uyum-purple
            hc:bg-black hc:border-white hc:text-white
          "
          aria-label="Harita lejantını aç"
        >
          Lejant
        </summary>

        <div
          className="
            mt-1 p-3 rounded-lg min-w-[180px]
            bg-uyum-dark/95 border border-white/20
            hc:bg-black hc:border-white
          "
        >
          {/* Accessibility color legend */}
          <p className="text-xs font-heading font-semibold text-white/60 uppercase tracking-wider mb-2 hc:text-white">
            Erişilebilirlik
          </p>
          <ul className="space-y-1 mb-3" role="list">
            {COLOR_ITEMS.map(({ color, label }) => (
              <li key={color} className="flex items-center gap-2" role="listitem">
                <span
                  className="inline-block w-3.5 h-3.5 rounded-full border-2 flex-shrink-0"
                  style={{ borderColor: color, backgroundColor: 'transparent' }}
                  aria-hidden="true"
                />
                <span className="text-xs font-body text-white/80 hc:text-white">{label}</span>
              </li>
            ))}
          </ul>

          {/* Sport icon legend */}
          <p className="text-xs font-heading font-semibold text-white/60 uppercase tracking-wider mb-2 hc:text-white">
            Spor İkonu
          </p>
          <ul className="space-y-1" role="list">
            {LEGEND_SPORTS.map(id => (
              <li key={id} className="flex items-center gap-2" role="listitem">
                <span className="text-sm leading-none flex-shrink-0" aria-hidden="true">
                  {getSportIcon(id)}
                </span>
                <span className="text-xs font-body text-white/80 hc:text-white">
                  {getSportLabel(id)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </details>
    </div>
  )
}
