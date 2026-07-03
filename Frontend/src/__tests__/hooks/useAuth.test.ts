/**
 * useAuth Hook Tests
 */
import { renderHook, act, waitFor } from '@testing-library/react'
import { useAuth, AuthProvider } from '@/context/AuthContext'
import React from 'react'

// Mock API
const mockGet = jest.fn()
const mockPost = jest.fn()

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: {
    get: (...args: any[]) => mockGet(...args),
    post: (...args: any[]) => mockPost(...args),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  },
}))

const wrapper = ({ children }: { children: React.ReactNode }) => (
  React.createElement(AuthProvider, null, children)
)

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    document.cookie = 'auth_hint=; path=/; max-age=0'
  })

  describe('initial state', () => {
    it('should skip session restore when no auth hint exists', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => expect(result.current.loading).toBe(false))
      expect(result.current.user).toBeNull()
      expect(mockGet).not.toHaveBeenCalled()
    })

    it('should set user when auth hint exists and /auth/me succeeds', async () => {
      document.cookie = 'auth_hint=1; path=/'
      mockGet.mockResolvedValueOnce({
        data: {
          data: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            role: 'student',
          },
        },
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.user).toEqual({
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'student',
      })
      expect(result.current.isAuthenticated).toBe(true)
    })

    it('should clear auth hint on definitive /auth/me failure', async () => {
      document.cookie = 'auth_hint=1; path=/'
      mockGet.mockRejectedValueOnce({ response: { status: 401 } })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(document.cookie).not.toContain('auth_hint=')
    })
  })

  describe('login', () => {
    it('should set user and token on successful login', async () => {
      mockPost.mockResolvedValueOnce({
        data: {
          data: {
            token: 'new-token',
            user: {
              id: '1',
              email: 'test@example.com',
              name: 'Test User',
              role: 'student',
            },
          },
        },
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => expect(result.current.loading).toBe(false))

      await act(async () => {
        await result.current.login('test@example.com', 'password123')
      })

      expect(result.current.user).toEqual({
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'student',
      })
      expect(document.cookie).toContain('auth_hint=1')
    })

    it('should throw error on failed login', async () => {
      mockPost.mockRejectedValueOnce({
        response: {
          data: { message: 'Invalid credentials' },
        },
      })

      const { result } = renderHook(() => useAuth(), { wrapper })
      await waitFor(() => expect(result.current.loading).toBe(false))

      await expect(result.current.login('test@example.com', 'wrong-password')).rejects.toBeDefined()
    })
  })

  describe('logout', () => {
    it('should clear user and token', async () => {
      document.cookie = 'auth_hint=1; path=/'
      mockGet.mockResolvedValueOnce({
        data: {
          data: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            role: 'student',
          },
        },
      })
      mockPost.mockResolvedValueOnce({ data: { success: true } })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => expect(result.current.loading).toBe(false))
      expect(result.current.isAuthenticated).toBe(true)

      await act(async () => {
        await result.current.logout()
      })

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(document.cookie).not.toContain('auth_hint=')
      expect(mockPost).toHaveBeenCalledWith('/auth/logout')
    })
  })

  describe('register', () => {
    it('should register new user and set auth state', async () => {
      mockPost.mockResolvedValueOnce({
        data: {
          data: {
            token: 'new-token',
            user: {
              id: '1',
              email: 'new@example.com',
              name: 'New User',
              role: 'student',
            },
          },
        },
      })

      const { result } = renderHook(() => useAuth(), { wrapper })
      await waitFor(() => expect(result.current.loading).toBe(false))

      await act(async () => {
        await result.current.register({
          email: 'new@example.com',
          password: 'Password123!',
          name: 'New User',
        })
      })

      expect(result.current.user).toBeDefined()
      expect(result.current.isAuthenticated).toBe(true)
    })
  })

  describe('refreshUser', () => {
    it('should update user profile from /auth/me', async () => {
      document.cookie = 'auth_hint=1; path=/'
      mockGet.mockResolvedValueOnce({
        data: {
          data: {
            id: '1',
            email: 'test@example.com',
            name: 'Old Name',
            role: 'student',
          },
        },
      })
      mockGet.mockResolvedValueOnce({
        data: {
          data: {
            id: '1',
            email: 'test@example.com',
            name: 'New Name',
            role: 'student',
          },
        },
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => expect(result.current.loading).toBe(false))

      await act(async () => {
        await result.current.refreshUser()
      })

      expect(result.current.user?.name).toBe('New Name')
    })
  })
})
