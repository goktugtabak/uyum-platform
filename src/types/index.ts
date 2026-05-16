export type AccessibilityDimension = 'verified' | 'partial' | 'none' | 'unknown'
export type DisabilityType = 'wheelchair' | 'visual' | 'hearing' | 'upper_limb'
export type MobilityLevel = 'sitting' | 'supported' | 'independent'
export type Goal = 'strength' | 'flexibility' | 'social' | 'compete'
export type EventLevel = 'başlangıç' | 'orta' | 'ileri' | 'yarışma'

export interface AccessibilityMatrix {
  entry:         Record<DisabilityType, AccessibilityDimension>
  internal:      Record<DisabilityType, AccessibilityDimension>
  changing:      Record<DisabilityType, AccessibilityDimension>
  equipment:     Record<DisabilityType, AccessibilityDimension>
  staff:         Record<DisabilityType, AccessibilityDimension>
  communication: Record<DisabilityType, AccessibilityDimension>
}

export interface Facility {
  id: string
  name: string
  type: string
  district: string
  address: string
  lat: number
  lng: number
  sports: string[]
  accessibility: AccessibilityMatrix
  verifiedAt?: string
  source?: 'manual' | 'overpass'
  phone?: string
  website?: string
}

export interface UserProfile {
  disability: DisabilityType
  mobility: MobilityLevel
  goals: Goal[]
  city: string
  preferredDistricts?: string[]
}

export interface Testimony {
  id: string
  facilityId: string
  userAlias: string
  disability: DisabilityType
  rating: number
  text: string
  date: string
  helpfulCount: number
}

// 'Event' DOM tipiyle cakismasin diye SportEvent kullaniliyor
export interface SportEvent {
  id: string
  title: string
  description: string
  date: string
  facilityId: string
  sport: string
  level: EventLevel
  disabilityTags: DisabilityType[]
  capacity: number
  registered: number
  organizer: string
}

export interface Coach {
  id: string
  name: string
  bio: string
  sports: string[]
  disabilitySpecialties: DisabilityType[]
  certifications: string[]
  city: string
  contact?: string
  photoUrl?: string
}

export interface Exercise {
  id: string
  title: string
  description: string
  youtubeId: string
  durationSec: number
  disabilityTags: DisabilityType[]
  mobilityTags: MobilityLevel[]
  goals: Goal[]
  lang: 'tr' | 'en'
  channelName: string
}

export interface Sport {
  id: string
  name: string
  nameEn?: string
  category: 'team' | 'individual' | 'adaptive' | 'water' | 'indoor' | 'outdoor'
  disabilityFitness: Record<DisabilityType, 'high' | 'medium' | 'low'>
}
