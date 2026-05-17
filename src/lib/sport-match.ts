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
  performance: 'performans geliştirme',
  healthy:     'sağlıklı kalma',
  compete:     'yarışma',
}

function scoreSport(sport: Sport, profile: UserProfile): number {
  let score = 0
  if (profile.disabilityTypes.some(d => sport.suitableFor.includes(d))) {
    score += 3
  }
  if (sport.mobilityLevel.includes(profile.mobilityLevel)) {
    score += 2
  }
  if (profile.goals.some(g => sport.goals.includes(g))) {
    score += 2
  }
  return score
}

function buildReason(sport: Sport, profile: UserProfile): string {
  const parts: string[] = []
  const disabilityLabel =
    profile.disabilityTypes.length === 1
      ? DISABILITY_LABELS[profile.disabilityTypes[0]]
      : profile.disabilityTypes.map(d => DISABILITY_LABELS[d]).join(' ve ')
  const mobilityVerb = MOBILITY_VERBS[profile.mobilityLevel]

  if (profile.disabilityTypes.some(d => sport.suitableFor.includes(d))) {
    parts.push(`${sport.name}, ${disabilityLabel} için uygun bir adaptif spor`)
  } else {
    parts.push(`${sport.name} senin profilinle kısmen örtüşüyor`)
  }

  if (sport.mobilityLevel.includes(profile.mobilityLevel)) {
    parts.push(`${mobilityVerb} yapılabilir`)
  }

  const matchingGoal = profile.goals.find(g => sport.goals.includes(g))
  if (matchingGoal) {
    parts.push(`${GOAL_LABELS[matchingGoal]} hedefini destekler`)
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
}
