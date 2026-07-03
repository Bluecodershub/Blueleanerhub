'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { User } from '@/types'
import api from '@/lib/api'

// ─────────────────────────────────────────────────────────────────────────────
// Auth hint cookie — lives on the FRONTEND domain (Vercel) so the Next.js
// proxy can read it.  It carries NO sensitive data; it is purely a presence
// signal.  The real security is enforced by the Express backend (HttpOnly
// signed JWT) on every API call.
// ─────────────────────────────────────────────────────────────────────────────

const AUTH_HINT_COOKIE = 'auth_hint'
const AUTH_HINT_MAX_AGE = 7 * 24 * 60 * 60 // 7 days, same as refresh token window

function setAuthHintCookie() {
  if (typeof document === 'undefined') return
  const isProduction = process.env.NODE_ENV === 'production'
  const secure = isProduction ? '; Secure' : ''
  document.cookie = `${AUTH_HINT_COOKIE}=1; path=/; max-age=${AUTH_HINT_MAX_AGE}; SameSite=Lax${secure}`
}

function clearAuthHintCookie() {
  if (typeof document === 'undefined') return
  const isProduction = process.env.NODE_ENV === 'production'
  const secure = isProduction ? '; Secure' : ''
  document.cookie = `${AUTH_HINT_COOKIE}=; path=/; max-age=0; SameSite=Lax${secure}`
}

function hasAuthHintCookie(): boolean {
  if (typeof document === 'undefined') return false
  return document.cookie.split(';').some((c) => c.trim().startsWith(`${AUTH_HINT_COOKIE}=`))
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/** Consent captured at signup and persisted as a DPDP audit trail server-side. */
export interface RegisterConsents {
  terms?: boolean
  privacy?: boolean
  dataProcessing?: boolean
  marketing?: boolean
  guardianConsent?: boolean
}

interface AuthContextValue {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<User>
  logout: () => void
  register: (data: {
    email: string
    password: string
    name: string
    fullName?: string
    consents?: RegisterConsents
  }) => Promise<User>
  refreshUser: (silent?: boolean) => Promise<void>
}

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  // Deduplicate concurrent refreshUser calls — only one non-silent request in flight at a time
  const refreshInFlightRef = useRef<Promise<void> | null>(null)

  const refreshUser = useCallback(async (silent = false) => {
    // If a non-silent refresh is already in flight, reuse that promise
    if (!silent && refreshInFlightRef.current) return refreshInFlightRef.current

    const doRefresh = async () => {
      try {
        const response = await api.get('/auth/me')
        const fetchedUser = response.data?.data ?? response.data ?? null
        setUser(fetchedUser)
        if (fetchedUser) setAuthHintCookie()
        else clearAuthHintCookie()
      } catch (err: any) {
        // Only clear on a definitive HTTP 401/403 — not on network errors or
        // timeouts, which would log the user out when the backend is slow.
        const isDefinitiveAuthFailure =
          err?.response?.status === 401 || err?.response?.status === 403

        if (!silent && isDefinitiveAuthFailure) {
          // Use the functional form of setUser so we read the CURRENT state at
          // the time this callback runs, not the stale closure value.
          //
          // Race condition this prevents:
          //   T=0   refreshUser() fires (GET /auth/me in-flight)
          //   T=500 login() succeeds → setUser(user) → setAuthHintCookie()
          //   T=1s  GET /auth/me returns 401 → this catch block runs
          //
          // Without the check, setUser(null) would wipe the user set by login(),
          // clearing auth_hint and leaving the user stuck on the login page.
          setUser((current) => {
            if (current !== null) {
              // login() ran concurrently and already set the user — preserve it.
              return current
            }
            clearAuthHintCookie()
            return null
          })
        }
      } finally {
        if (!silent) {
          setLoading(false)
          refreshInFlightRef.current = null
        }
      }
    }

    if (!silent) {
      refreshInFlightRef.current = doRefresh()
      return refreshInFlightRef.current
    }
    return doRefresh()
  }, [])

  // ── Mount: restore session only if we have an auth hint ──────────────────
  // If there is no auth_hint cookie the user is clearly not logged in — skip
  // the API call entirely.  This eliminates the race condition on the login
  // page where an in-flight GET /auth/me could wipe state set by login().
  useEffect(() => {
    if (hasAuthHintCookie()) {
      refreshUser()
    } else {
      setLoading(false)
    }
  }, [refreshUser])

  const login = async (email: string, password: string): Promise<User> => {
    const response = await api.post('/auth/login', { email, password })
    const loggedInUser = response.data?.data?.user ?? response.data?.user
    if (!loggedInUser) throw new Error('Invalid login response from server')
    setUser(loggedInUser)
    setAuthHintCookie()
    // Hydrate the full profile in the background — silent so a failure does
    // not wipe the user we just set above.
    refreshUser(true).catch(() => {})
    return loggedInUser
  }

  const logout = () => {
    clearAuthHintCookie()
    setUser(null)
    api.post('/auth/logout').catch(() => {})
    if (process.env.NODE_ENV !== 'test') {
      window.location.href = '/login'
    }
  }

  const register = async (data: {
    email: string
    password: string
    name: string
    consents?: RegisterConsents
  }): Promise<User> => {
    const { name, ...rest } = data
    const response = await api.post('/auth/register', { ...rest, fullName: name, role: 'STUDENT' })
    const registeredUser = response.data?.data?.user ?? response.data?.user
    if (!registeredUser) throw new Error('Invalid registration response from server')
    setUser(registeredUser)
    setAuthHintCookie()
    return registeredUser
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        register,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

const SSR_FALLBACK: AuthContextValue = {
  user: null,
  loading: false,
  isAuthenticated: false,
  login: async () => { throw new Error('Auth not available during SSR'); },
  logout: () => {},
  register: async () => { throw new Error('Auth not available during SSR'); },
  refreshUser: async () => {},
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (ctx === undefined) {
    if (process.env.NODE_ENV === 'development') {
      throw new Error('useAuth must be used inside <AuthProvider>')
    }
    return SSR_FALLBACK
  }
  return ctx
}
