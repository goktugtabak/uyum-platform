import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { UserProfile } from '../types'

const STORAGE_KEY = 'uyum:profile'

function loadProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as UserProfile
    // Backward compatibility: ensure array fields exist for profiles saved before they were added
    return {
      ...parsed,
      favoriteFacilities: parsed.favoriteFacilities ?? [],
      favoriteEvents:     parsed.favoriteEvents     ?? [],
      favoriteExercises:  parsed.favoriteExercises  ?? [],
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
    setProfileState(p)
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
      const next = list.includes(id) ? list.filter(x => x !== id) : [...list, id]
      return { ...prev, favoriteFacilities: next }
    })
  }

  function toggleFavoriteEvent(id: string) {
    setProfileState(prev => {
      if (!prev) return prev
      const list = prev.favoriteEvents ?? []
      const next = list.includes(id) ? list.filter(x => x !== id) : [...list, id]
      return { ...prev, favoriteEvents: next }
    })
  }

  function toggleFavoriteExercise(id: string) {
    setProfileState(prev => {
      if (!prev) return prev
      const list = prev.favoriteExercises ?? []
      const next = list.includes(id) ? list.filter(x => x !== id) : [...list, id]
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
