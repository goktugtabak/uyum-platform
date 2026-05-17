const SPORT_ICONS: Record<string, string> = {
  's-swim':               '',
  's-aqua':               '',
  's-wheelchair-basket':  '',
  's-wheelchair-tennis':  '',
  's-goalball':           '',
  's-boccia':             '',
  's-sitting-volleyball': '',
  's-athletics':          '',
  's-archery-para':       '',
  's-yoga':               '',
  's-pilates':            '',
  's-strength':           '️',
  's-judo-para':          '',
  's-football':           '',
  's-waterpolo':          '',
}

const SPORT_LABELS: Record<string, string> = {
  's-swim':               'Yüzme',
  's-aqua':               'Su Aerobiği',
  's-wheelchair-basket':  'Tekerlekli Sandalye Basketbolu',
  's-wheelchair-tennis':  'Tekerlekli Sandalye Tenisi',
  's-goalball':           'Goalball',
  's-boccia':             'Boccia',
  's-sitting-volleyball': 'Oturarak Voleybol',
  's-athletics':          'Atletizm',
  's-archery-para':       'Para Okçuluk',
  's-yoga':               'Adaptif Yoga',
  's-pilates':            'Adaptif Pilates',
  's-strength':           'Kuvvet Antrenmanı',
  's-judo-para':          'Para Judo',
  's-football':           'Ampute Futbol',
  's-waterpolo':          'Su Topu',
}

export function getSportIcon(sportId: string): string {
  return SPORT_ICONS[sportId] ?? ''
}

export function getSportLabel(sportId: string): string {
  return SPORT_LABELS[sportId] ?? sportId
}

export const LEGEND_SPORTS = [
  's-swim',
  's-wheelchair-basket',
  's-wheelchair-tennis',
  's-strength',
  's-athletics',
  's-sitting-volleyball',
  's-goalball',
  's-boccia',
]
