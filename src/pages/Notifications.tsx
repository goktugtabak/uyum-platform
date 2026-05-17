import { Link } from 'react-router-dom'
import { BackButton } from '../components/ui/BackButton'
import { Bell, MapPin, CalendarDays, Sparkles, Heart } from 'lucide-react'
import { MOCK_NOTIFICATIONS } from '../lib/notifications-data'
import type { Notification } from '../lib/notifications-data'

const TYPE_ICON: Record<Notification['type'], typeof Bell> = {
  facility: MapPin,
  event: CalendarDays,
  match: Sparkles,
  community: Heart,
}

const TYPE_COLOR: Record<Notification['type'], string> = {
  facility: 'bg-mint/60 text-mint-foreground',
  event: 'bg-accent/15 text-accent',
  match: 'bg-accent/15 text-accent',
  community: 'bg-red-50 text-red-500',
}

export function Notifications() {
  const unread = MOCK_NOTIFICATIONS.filter(n => !n.read).length

  return (
    <div className="mx-auto max-w-2xl px-4 pt-4 pb-16 md:pt-8">
      <header className="mb-6 flex items-center gap-3">
        <BackButton />
        <div>
          <h1 className="text-2xl font-extrabold text-primary-deep">Bildirimler</h1>
          {unread > 0 && (
            <p className="text-xs text-muted-foreground">{unread} okunmamış bildirim</p>
          )}
        </div>
      </header>

      <ul className="space-y-2">
        {MOCK_NOTIFICATIONS.map(n => {
          const Icon = TYPE_ICON[n.type]
          return (
            <li key={n.id}>
              <Link
                to={n.to}
                className={`flex items-start gap-3.5 rounded-2xl p-4 transition hover:bg-gray-50 ${
                  !n.read ? 'bg-primary/5 ring-1 ring-primary/10' : 'bg-white ring-1 ring-gray-100'
                }`}
              >
                <span className={`mt-0.5 grid size-9 shrink-0 place-items-center rounded-full ${TYPE_COLOR[n.type]}`}>
                  <Icon className="size-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <span className={`text-sm font-semibold ${!n.read ? 'text-primary-deep' : 'text-foreground'}`}>
                      {n.title}
                    </span>
                    {!n.read && (
                      <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" aria-label="Okunmadı" />
                    )}
                  </div>
                  <p className="mt-0.5 text-[12.5px] text-muted-foreground leading-relaxed">{n.body}</p>
                  <span className="mt-1 text-[11px] text-muted-foreground/70">{n.time}</span>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
