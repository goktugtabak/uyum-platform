import type { Coach, UserProfile, DisabilityType } from '../types'

export interface CoachFilters {
  sportId?:    string
  facilityId?: string
  expertise?:  DisabilityType[]
}

export function filterCoaches(
  filters: CoachFilters,
  profile: UserProfile | null,
  all: Coach[],
): Coach[] {
  const result = all.filter(c => {
    if (filters.sportId && !c.sports.includes(filters.sportId)) return false
    if (filters.facilityId && !c.facilityIds.includes(filters.facilityId)) return false
    if (filters.expertise && filters.expertise.length > 0) {
      const has = filters.expertise.every(d => c.disabilityExpertise.includes(d))
      if (!has) return false
    }
    return true
  })

  const profileType = profile?.disabilityType
  return result.sort((a, b) => {
    if (profileType) {
      const aMatch = a.disabilityExpertise.includes(profileType) ? 0 : 1
      const bMatch = b.disabilityExpertise.includes(profileType) ? 0 : 1
      if (aMatch !== bMatch) return aMatch - bMatch
    }
    if (a.yearsExperience !== b.yearsExperience) return b.yearsExperience - a.yearsExperience
    return a.name.localeCompare(b.name, 'tr')
  })
}
