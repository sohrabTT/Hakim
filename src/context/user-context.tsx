'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import type { Language } from '@/lib/i18n'

export interface AuthUser {
  id: string
  username: string
}

export interface UserProfile {
  firstName: string
  lastName: string
  phone: string
  age: number
  location: string
  language: Language
  role: 'doctor' | 'patient' | 'caregiver'
  specialization?: string
  level?: 'specialist' | 'subspecialist' | 'general'
  department?: string
  gender?: string
  weight?: string
  height?: string
  bloodType?: string
  underlyingDiseases?: string
  drugAllergies?: string
  foodAllergies?: string
  currentMedications?: string
  previousSurgeries?: string
  smokingAlcohol?: string
  activityLevel?: string
  createdAt: Date
}

interface UserContextType {
  user: AuthUser | null
  profile: UserProfile | null
  isOnboarded: boolean
  isMedicalComplete: boolean
  language: Language
  isLoading: boolean
  authLoading: boolean
  setProfile: (profile: UserProfile) => Promise<void>
  setLanguage: (lang: Language) => void
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  refreshUser: () => Promise<void>
  logout: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null)
  const [profile, setProfileState] = useState<UserProfile | null>(null)
  const [language, setLanguageState] = useState<Language>('en')
  const [isLoading, setIsLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(true)

  const refreshUser = async () => {
    setAuthLoading(true)
    try {
      const response = await fetch('/api/auth/me')
      const data = await response.json()
      if (data.user) {
        setUserState(data.user)
        const profileRes = await fetch('/api/profile')
        if (profileRes.ok) {
          const profileData = await profileRes.json()
          if (profileData && profileData.firstName) {
            setProfileState(profileData as UserProfile)
          }
        }
      } else {
        setUserState(null)
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
      setUserState(null)
    } finally {
      setAuthLoading(false)
    }
  }

  useEffect(() => {
    const init = async () => {
      const savedLanguage = (localStorage.getItem('language') as Language) || 'en'

      if (savedLanguage) {
        setLanguageState(savedLanguage)
      }
      await refreshUser()
      setIsLoading(false)
    }
    init()
  }, [])

  const setProfile = async (newProfile: UserProfile) => {
    setProfileState(newProfile)
    try {
      await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProfile),
      })
    } catch (error) {
      console.error('Failed to save profile:', error)
    }
  }

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : lang === 'fa' ? 'rtl' : 'ltr'
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (profile) {
      const updated = { ...profile, ...updates }
      await setProfile(updated)
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUserState(null)
      setProfileState(null)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const hasBloodType = !!(profile?.bloodType)
  const isMedicalComplete = !!(profile && profile.gender && profile.weight && profile.height && hasBloodType)

  return (
    <UserContext.Provider
      value={{
        user,
        profile,
        isOnboarded: !!profile,
        isMedicalComplete,
        language,
        isLoading,
        authLoading,
        setProfile,
        setLanguage,
        updateProfile,
        refreshUser,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within UserProvider')
  }
  return context
}
