'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { login, logout, refreshTokens, getProfile } from '../lib/auth'
import { User } from '@/types/userPayload'

interface AuthContextType {
  user: Partial<User> | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshTokens: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<Partial<User> | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const initAuth = async () => {
      try {
        const profile = await getProfile()
        setUser(profile)
      } catch (error) {
        console.error('Failed to fetch user profile:', error)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const loginHandler = async (identifier: string, password: string) => {
    try {
      await login(identifier, password)
      const profile = await getProfile()
      setUser(profile)
      router.push('/dashboard')
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const logoutHandler = async () => {
    try {
      await logout()
      setUser(null)
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const refreshTokensHandler = async () => {
    try {
      await refreshTokens()
      const profile = await getProfile()
      setUser(profile)
    } catch (error) {
      console.error('Token refresh failed:', error)
      setUser(null)
      router.push('/login')
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login: loginHandler,
        logout: logoutHandler,
        refreshTokens: refreshTokensHandler,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
