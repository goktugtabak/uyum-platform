import type { Facility, UserProfile } from '../types'
import { getDimensionLabel } from './a11y-dimensions'

const DISABILITY_TR: Record<string, string> = {
  wheelchair:  'tekerlekli sandalye kullanıcısı',
  visual:      'görme engelli birey',
  hearing:     'işitme engelli birey',
  upper_limb:  'üst ekstremite engelli birey',
}

const MOBILITY_TR: Record<string, string> = {
  sitting:     'oturarak',
  supported:   'destekle',
  independent: 'bağımsız',
}

export interface FallbackGuide {
  guide: string
  source: 'fallback'
}

export function fallbackGuide(profile: UserProfile, facility: Facility): FallbackGuide {
  const dt = profile.disabilityTypes[0] ?? 'wheelchair'
  const acc = facility.accessibility

  const lines: string[] = []

  lines.push(
    `${facility.name} tesisine planladığınız ziyaret için hazırladığımız erişilebilirlik özeti aşağıdadır. ` +
    `Bu bilgiler, ${DISABILITY_TR[dt] ?? dt} ve ${MOBILITY_TR[profile.mobilityLevel] ?? profile.mobilityLevel} ` +
    `hareket düzeyi baz alınarak hazırlanmıştır.`,
  )

  const dimensions = [
    'entry', 'internal', 'changing', 'equipment', 'staff', 'communication',
  ] as const

  const dimLines: string[] = []
  for (const dim of dimensions) {
    const status = acc[dim][dt]
    const label = getDimensionLabel(dim)
    if (status === 'verified') {
      dimLines.push(`${label}: Doğrulanmış erişilebilirlik mevcut.`)
    } else if (status === 'partial') {
      dimLines.push(`${label}: Kısmi erişilebilirlik — ziyaretten önce tesisle teyit ediniz.`)
    } else if (status === 'none') {
      dimLines.push(`${label}: Erişilebilirlik bildirilmemiş — tesis ile doğrudan iletişim kurunuz.`)
    } else {
      dimLines.push(`${label}: Bilgi mevcut değil — tesis ile iletişime geçerek öğrenebilirsiniz.`)
    }
  }
  lines.push(dimLines.join('\n'))

  if (facility.liveStatus.ramp.status === true) {
    lines.push('Tesiste rampa mevcut ve son kontrolde aktif olarak çalışmaktadır.')
  }
  if (facility.liveStatus.elevator.status === true) {
    lines.push('Asansör aktif — kat geçişleri için kullanılabilir.')
  }
  if (facility.liveStatus.lift.status === false) {
    lines.push('Lift şu an arızalı olarak bildirilmiştir. Ziyaret öncesi güncel durumu teyit edin.')
  }

  const phone = facility.contact.phone
  lines.push(
    `Ziyaretinizden önce tesisi arayarak en güncel koşulları doğrulamanızı öneririz.` +
    (phone ? ` Telefon: ${phone}` : ''),
  )

  lines.push(
    'Bu bilgiler topluluk katkıları ve tesis bildirimleri doğrultusunda hazırlanmıştır. ' +
    'Profesyonel sağlık tavsiyesi değildir.',
  )

  return { guide: lines.join('\n\n'), source: 'fallback' }
}
