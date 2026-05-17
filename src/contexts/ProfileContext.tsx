import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { UserProfile } from '../types'
import { logActivity } from '../lib/activity-log'

const STORAGE_KEY = 'uyum:profile'

function loadProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Record<string, unknown>
    // Migrate legacy single-value disability / goal fields
    if ('disabilityType' in parsed && !Array.isArray(parsed.disabilityTypes)) {
      parsed.disabilityTypes = [parsed.disabilityType]
      delete parsed.disabilityType
    }
    if ('goal' in parsed && !Array.isArray(parsed.goals)) {
      parsed.goals = [parsed.goal]
      delete parsed.goal
    }
    const profile = parsed as unknown as UserProfile
    return {
      ...profile,
      disabilityTypes:    profile.disabilityTypes    ?? [],
      goals:              profile.goals              ?? [],
      favoriteFacilities: profile.favoriteFacilities ?? [],
      favoriteEvents:     profile.favoriteEvents     ?? [],
      favoriteExercises:  profile.favoriteExercises  ?? [],
    }
  } catch {
    return null
  }
}

function saveProfile(profile: UserProfile | null): void {
  try {
    if (profile === null) {
      localStorage.removeItem(STORAGE_KEY)
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
    }
  } catch {
    // quota exceeded — silently ignore
  }
}

interface ProfileContextValue {
  profile:                UserProfile | null
  hasProfile:             boolean
  setProfile:             (profile: UserProfile) => void
  updateProfile:          (patch: Partial<UserProfile>) => void
  clearProfile:           () => void
  toggleFavoriteFacility: (id: string) => void
  toggleFavoriteEvent:    (id: string) => void
  toggleFavoriteExercise: (id: string) => void
}

const ProfileContext = createContext<ProfileContextValue | null>(null)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile | null>(loadProfile)

  useEffect(() => {
    saveProfile(profile)
  }, [profile])

  function setProfile(p: UserProfile) {
    setProfileState(prev => {
      if (prev === null) {
        logActivity('profile_created', 'Profil oluşturuldu')
      }
      return p
    })
  }

  function updateProfile(patch: Partial<UserProfile>) {
    setProfileState(prev => prev ? { ...prev, ...patch } : null)
  }

  function clearProfile() {
    setProfileState(null)
  }

  function toggleFavoriteFacility(id: string) {
    setProfileState(prev => {
      if (!prev) return prev
      const list = prev.favoriteFacilities ?? []
      const isCurrentlyFav = list.includes(id)
      const next = isCurrentlyFav ? list.filter(x => x !== id) : [...list, id]
      logActivity(isCurrentlyFav ? 'facility_unbookmarked' : 'facility_bookmarked', id)
      return { ...prev, favoriteFacilities: next }
    })
  }

  function toggleFavoriteEvent(id: string) {
    setProfileState(prev => {
      if (!prev) return prev
      const list = prev.favoriteEvents ?? []
      const isCurrentlyFav = list.includes(id)
      const next = isCurrentlyFav ? list.filter(x => x !== id) : [...list, id]
      logActivity(isCurrentlyFav ? 'event_unbookmarked' : 'event_bookmarked', id)
      return { ...prev, favoriteEvents: next }
    })
  }

  function toggleFavoriteExercise(id: string) {
    setProfileState(prev => {
      if (!prev) return prev
      const list = prev.favoriteExercises ?? []
      const isCurrentlyFav = list.includes(id)
      const next = isCurrentlyFav ? list.filter(x => x !== id) : [...list, id]
      logActivity(isCurrentlyFav ? 'exercise_unbookmarked' : 'exercise_bookmarked', id)
      return { ...prev, favoriteExercises: next }
    })
  }

  const value: ProfileContextValue = {
    profile,
    hasProfile:             profile !== null,
    setProfile,
    updateProfile,
    clearProfile,
    toggleFavoriteFacility,
    toggleFavoriteEvent,
    toggleFavoriteExercise,
  }

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfile must be used inside ProfileProvider')
  return ctx
}
