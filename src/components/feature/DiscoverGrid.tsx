import { Link } from 'react-router-dom'

interface Tile {
  to:          string
  icon:        string
  title:       string
  description: string
}

const TILES: Tile[] = [
  {
    to:          '/match',
    icon:        '',
    title:       'Hangi sporları yapabilirim?',
    description: 'Profilinle eşleşen 3 spor önerisi',
  },
  {
    to:          '/exercises',
    icon:        '️',
    title:       'Egzersiz içeriği',
    description: 'Evden çalışabileceğin adaptif egzersizler',
  },
  {
    to:          '/events',
    icon:        '',
    title:       'Yakındaki etkinlikler',
    description: 'Ankara\'da yaklaşan engelli sporu etkinlikleri',
  },
  {
    to:          '/coaches',
    icon:        '‍',
    title:       'Koç bul',
    description: 'Engel tipine uygun antrenörler',
  },
]

export function DiscoverGrid() {
  return (
    <ul
      role="list"
      className="grid grid-cols-1 sm:grid-cols-2 gap-3"
    >
      {TILES.map(tile => (
        <li key={tile.to}>
          <Link
            to={tile.to}
            className="
              group flex items-start gap-4 min-h-24 p-4 rounded-xl
              border border-white/10 bg-white/5
              hover:bg-white/10 hover:border-uyum-purple/40
              focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-uyum-purple
              transition-colors
            "
          >
            <span
              aria-hidden="true"
              className="text-3xl leading-none flex-shrink-0"
            >
              {tile.icon}
            </span>
            <div className="min-w-0">
              <h3 className="font-heading font-semibold text-white text-base group-hover:text-uyum-frost-blue">
                {tile.title}
              </h3>
              <p className="text-xs font-body text-white/60 mt-1">
                {tile.description}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}
