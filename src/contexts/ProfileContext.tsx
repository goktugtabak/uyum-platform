import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { UserProfile } from '../types'

const STORAGE_KEY = 'uyum:profile'

function loadProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as UserProfile
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
  profile:       UserProfile | null
  hasProfile:    boolean
  setProfile:    (profile: UserProfile) => void
  updateProfile: (patch: Partial<UserProfile>) => void
  clearProfile:  () => void
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

  const value: ProfileContextValue = {
    profile,
    hasProfile:   profile !== null,
    setProfile,
    updateProfile,
    clearProfile,
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
