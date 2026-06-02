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
  specialization?: string // حوزه فعالیت
  level?: 'specialist' | 'subspecialist' | 'general' // متخصص، فوق تخصص، عمومی
  department?: string // بخش
  createdAt: Date
}

interface UserContextType {
  user: AuthUser | null
  profile: UserProfile | null
  isOnboarded: boolean
  language: Language
  isLoading: boolean
  authLoading: boolean
  setProfile: (profile: UserProfile) => void
  setLanguage: (lang: Language) => void
  updateProfile: (updates: Partial<UserProfile>) => void
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

  // Load from localStorage on mount and fetch user
  useEffect(() => {
    const init = async () => {
      const savedProfile = localStorage.getItem('user-profile')
      const savedLanguage = (localStorage.getItem('language') as Language) || 'en'

      if (savedProfile) {
        const parsed = JSON.parse(savedProfile)
        setProfileState(parsed)
      }

      setLanguageState(savedLanguage)
      
      await refreshUser()
      setIsLoading(false)
    }
    
    init()
  }, [])

  // Save profile to localStorage
  const setProfile = (newProfile: UserProfile) => {
    setProfileState(newProfile)
    localStorage.setItem('user-profile', JSON.stringify(newProfile))
    
    // Also update profile for the current authenticated user if needed
    // In a real app, you would send this to the server
  }

  // Update language
  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : lang === 'fa' ? 'rtl' : 'ltr'
  }

  // Update profile
  const updateProfile = (updates: Partial<UserProfile>) => {
    if (profile) {
      const updated = { ...profile, ...updates }
      setProfile(updated)
    }
  }

  // Logout
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUserState(null)
      setProfileState(null)
      localStorage.removeItem('user-profile')
      localStorage.removeItem('chat-sessions')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <UserContext.Provider
      value={{
        user,
        profile,
        isOnboarded: !!profile,
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
