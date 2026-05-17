export type AccessibilityDimension = 'verified' | 'partial' | 'none' | 'unknown'
export type DisabilityType = 'wheelchair' | 'visual' | 'hearing' | 'upper_limb'
export type MobilityLevel = 'sitting' | 'supported' | 'independent'
export type Goal = 'strength' | 'flexibility' | 'social' | 'performance' | 'healthy' | 'compete'
export type EventLevel = 'başlangıç' | 'orta' | 'ileri' | 'yarışma'
export type FacilityType = 'havuz' | 'spor_salonu' | 'açık_alan' | 'atletizm'

export interface AccessibilityMatrix {
  entry:         Record<DisabilityType, AccessibilityDimension>
  internal:      Record<DisabilityType, AccessibilityDimension>
  changing:      Record<DisabilityType, AccessibilityDimension>
  equipment:     Record<DisabilityType, AccessibilityDimension>
  staff:         Record<DisabilityType, AccessibilityDimension>
  communication: Record<DisabilityType, AccessibilityDimension>
}

export interface LiveStatusEntry {
  status: boolean | null
  verifiedAt: string | null
  verifiedBy: string | null
}

export interface LiveStatus {
  lift:     LiveStatusEntry
  elevator: LiveStatusEntry
  ramp:     LiveStatusEntry
  changing: LiveStatusEntry
}

export interface Coordinates {
  lat: number
  lng: number
}

export interface FacilityContact {
  phone?: string
  email?: string
  address?: string
}

export interface FacilityPhoto {
  url: string
  alt: string
  attribution: string  // Places ToS: "Photo: <author>" — must be visible to end user
  sourceRef?: string   // Places photo_reference for future refresh
}

export interface Facility {
  id: string
  name: string
  type: FacilityType
  district: string
  coordinates: Coordinates
  sports: string[]
  accessibility: AccessibilityMatrix
  liveStatus: LiveStatus
  coaches: string[]
  contact: FacilityContact
  source?: 'manual' | 'overpass' | 'places'
  website?: string
  placeId?: string
  photos?: FacilityPhoto[]
  description?: string
  rating?: number
  userRatingsTotal?: number
  openingHours?: string[]
}

export interface AccessibilityPrefs {
  colorblindMode: 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia'
  highContrast: boolean
  fontSize: 'normal' | 'large' | 'xlarge'
  speechEnabled: boolean
}

export interface UserProfile {
  disabilityTypes: DisabilityType[]
  mobilityLevel: MobilityLevel
  goals: Goal[]
  city: string
  favoriteFacilities: string[]
  favoriteEvents: string[]
  favoriteExercises: string[]
  accessibility: AccessibilityPrefs
}

export interface Testimony {
  id: string
  facilityId: string
  timestamp: string
  disabilityType: DisabilityType
  anonymous: boolean
  displayName?: string
  text: string
  issueReport?: string
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
  disabilityTypes: DisabilityType[]
  registrationUrl?: string
  organizer: string
}

export interface CoachContact {
  email?: string
  phone?: string
}

export interface Coach {
  id: string
  name: string
  photo: string | null
  bio: string
  sports: string[]
  disabilityExpertise: DisabilityType[]
  facilityIds: string[]
  yearsExperience: number
  city: string
  contact: CoachContact
}

export interface Exercise {
  id: string
  title: string
  description: string
  youtubeId: string
  duration: number
  disabilityTypes: DisabilityType[]
  mobilityLevel: MobilityLevel[]
  equipment: string[]
  language: 'tr' | 'en'
  hasSubtitles: boolean
  goals: Goal[]
  channelName: string
  tags: string[]
}

// Sport: ana dokumanda tip yok, ama Faz 4 sport-match.ts'in ihtiyaci
export interface Sport {
  id: string
  name: string
  nameEn?: string
  category: 'team' | 'individual' | 'adaptive' | 'water' | 'indoor' | 'outdoor'
  description: string
  suitableFor: DisabilityType[]
  mobilityLevel: MobilityLevel[]
  goals: Goal[]
}

export type VerificationVote = 'confirm' | 'deny'

export interface VerificationEntry {
  id: string
  facilityId: string
  dimension: 'entry' | 'internal' | 'changing' | 'equipment' | 'staff' | 'communication'
  disabilityType: DisabilityType
  vote: VerificationVote
  userId: string
  timestamp: string
}
