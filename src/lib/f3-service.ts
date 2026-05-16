import type { Facility, UserProfile } from '../types'
import { fallbackGuide } from './f3-fallback'
import type { FallbackGuide } from './f3-fallback'

export interface F3GuideResult {
  ok: boolean
  guide: string
  source: 'n8n-openai' | 'fallback'
  redFlag?: boolean
  sections?: {
    arrival?: string
    parking?: string
    inside?: string
    attention?: string
    contact?: string
  }
  disclaimer?: string
}

interface N8nSuccessResponse {
  ok: true
  source: string
  sections?: F3GuideResult['sections']
  guide: string
  warningAppended?: boolean
  disclaimer?: string
}

interface N8nErrorResponse {
  ok: false
  error: string
}

type N8nResponse = N8nSuccessResponse | N8nErrorResponse

const TIMEOUT_MS = 5000

function toFallback(profile: UserProfile, facility: Facility): F3GuideResult {
  const fb: FallbackGuide = fallbackGuide(profile, facility)
  return { ok: true, guide: fb.guide, source: 'fallback' }
}

export async function fetchF3Guide(
  profile: UserProfile,
  facility: Facility,
): Promise<F3GuideResult> {
  // Red flag enforcement lives in n8n (see n8n response handling below). The
  // frontend has no symptom input surface yet, so a client-side scan of facility
  // metadata never matches and was misleading. If a symptom textarea is later
  // added to F3Guide, run containsRedFlag(userText) here before calling n8n.

  // Fallback trigger 1: env var not defined
  const webhookUrl = import.meta.env.VITE_N8N_F3_WEBHOOK_URL as string | undefined
  if (!webhookUrl) {
    console.warn('[F3] VITE_N8N_F3_WEBHOOK_URL not set — using fallback guide')
    return toFallback(profile, facility)
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        profile: {
          disabilityType: profile.disabilityType,
          mobilityLevel:  profile.mobilityLevel,
          goals:          [profile.goal],
          city:           profile.city,
          language:       'tr',
        },
        facility: {
          id:            facility.id,
          name:          facility.name,
          type:          facility.type,
          district:      facility.district,
          contact:       facility.contact,
          accessibility: facility.accessibility,
          liveStatus:    facility.liveStatus,
        },
      }),
    })

    // Fallback trigger 5: HTTP 4xx/5xx
    if (!res.ok) {
      console.warn(`[F3] n8n returned HTTP ${res.status} — using fallback guide`)
      return toFallback(profile, facility)
    }

    let data: N8nResponse
    try {
      // Fallback trigger 6: malformed JSON
      data = (await res.json()) as N8nResponse
    } catch {
      console.warn('[F3] n8n response is not valid JSON — using fallback guide')
      return toFallback(profile, facility)
    }

    // Fallback trigger 8: ok: false
    if (!data.ok) {
      const err = (data as N8nErrorResponse).error
      if (err === 'RED_FLAG') {
        return { ok: true, guide: '', source: 'fallback', redFlag: true }
      }
      console.warn(`[F3] n8n returned ok:false (${err}) — using fallback guide`)
      return toFallback(profile, facility)
    }

    const success = data as N8nSuccessResponse

    // Fallback trigger 7: sections or guide missing
    if (!success.guide) {
      console.warn('[F3] n8n response missing guide field — using fallback guide')
      return toFallback(profile, facility)
    }

    return {
      ok:         true,
      guide:      success.guide,
      source:     'n8n-openai',
      sections:   success.sections,
      disclaimer: success.disclaimer,
    }
  } catch (err) {
    // Fallback triggers 2/3/4: timeout (AbortError), network error, CORS error
    if (err instanceof Error && err.name === 'AbortError') {
      console.warn('[F3] n8n request timed out (5s) — using fallback guide')
    } else {
      console.warn('[F3] n8n fetch error — using fallback guide', err)
    }
    return toFallback(profile, facility)
  } finally {
    clearTimeout(timer)
  }
}
