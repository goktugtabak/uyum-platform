import type { UserProfile, Sport, DisabilityType, MobilityLevel, Goal } from '../types'

export interface MatchResult {
  sport:   Sport
  score:   number
  reason:  string
}

const DISABILITY_LABELS: Record<DisabilityType, string> = {
  wheelchair:  'tekerlekli sandalye kullanan bireyler',
  visual:      'görme engelli bireyler',
  hearing:     'işitme engelli bireyler',
  upper_limb:  'üst ekstremite engeli olan bireyler',
}

const MOBILITY_VERBS: Record<MobilityLevel, string> = {
  sitting:     'oturarak',
  supported:   'destekle',
  independent: 'bağımsız olarak',
}

const GOAL_LABELS: Record<Goal, string> = {
  strength:    'güç geliştirme',
  flexibility: 'esneklik',
  social:      'sosyal bağ kurma',
  compete:     'yarışma',
}

function scoreSport(sport: Sport, profile: UserProfile): number {
  let score = 0
  if (sport.suitableFor.includes(profile.disabilityType)) {
    score += 3
  }
  if (sport.mobilityLevel.includes(profile.mobilityLevel)) {
    score += 2
  }
  if (sport.goals.includes(profile.goal)) {
    score += 2
  }
  return score
}

function buildReason(sport: Sport, profile: UserProfile): string {
  const parts: string[] = []
  const disabilityLabel = DISABILITY_LABELS[profile.disabilityType]
  const mobilityVerb    = MOBILITY_VERBS[profile.mobilityLevel]

  if (sport.suitableFor.includes(profile.disabilityType)) {
    parts.push(`${sport.name}, ${disabilityLabel} için uygun bir adaptif spor`)
  } else {
    parts.push(`${sport.name} senin profilinle kısmen örtüşüyor`)
  }

  if (sport.mobilityLevel.includes(profile.mobilityLevel)) {
    parts.push(`${mobilityVerb} yapılabilir`)
  }

  if (sport.goals.includes(profile.goal)) {
    parts.push(`${GOAL_LABELS[profile.goal]} hedefini destekler`)
  }

  return parts.join(', ') + '.'
}

export function matchSports(profile: UserProfile, sports: Sport[]): MatchResult[] {
  return sports
    .map(sport => ({
      sport,
      score:  scoreSport(sport, profile),
      reason: buildReason(sport, profile),
    }))
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
}
