export type Notification = {
  id: string
  type: 'facility' | 'event' | 'match' | 'community'
  title: string
  body: string
  time: string
  read: boolean
  to: string
}

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n-1',
    type: 'facility',
    title: 'Çankaya Havuzu güncellendi',
    body: 'Asansör tekrar kullanıma açıldı. Erişilebilirlik puanı yükseldi.',
    time: '5 dk önce',
    read: false,
    to: '/facility/f-ank-001',
  },
  {
    id: 'n-2',
    type: 'event',
    title: 'Yaklaşan etkinlik: Adaptif Yüzme',
    body: 'Yarın saat 10:00\'da başlıyor. Kaydınızı tamamladınız.',
    time: '1 saat önce',
    read: false,
    to: '/events',
  },
  {
    id: 'n-3',
    type: 'match',
    title: 'Yeni spor önerisi hazır',
    body: 'Profilinize göre bocce topu branşı eklendi.',
    time: '3 saat önce',
    read: true,
    to: '/match',
  },
  {
    id: 'n-4',
    type: 'community',
    title: 'Tanıklığınız 18 destek aldı',
    body: '"Rampa kullanışlıydı" yorumunuz topluluk tarafından onaylandı.',
    time: 'Dün',
    read: true,
    to: '/',
  },
  {
    id: 'n-5',
    type: 'facility',
    title: 'Eryaman Spor Salonu — yeni koç',
    body: 'Koç Elif Kaya adaptif antrenman hizmetine başladı.',
    time: '2 gün önce',
    read: true,
    to: '/coaches',
  },
]
