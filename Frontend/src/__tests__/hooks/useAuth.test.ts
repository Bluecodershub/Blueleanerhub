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

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

const wrapper = ({ children }: { children: React.ReactNode }) => (
  React.createElement(AuthProvider, null, children)
)

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  describe('initial state', () => {
    it('should start with loading true when no token', () => {
      const { result } = renderHook(() => useAuth(), { wrapper })
      expect(result.current.loading).toBe(true)
    })

    it('should set user when token exists and /auth/me succeeds', async () => {
      localStorageMock.getItem.mockReturnValue('valid-token')
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

    it('should clear auth when /auth/me fails', async () => {
      localStorageMock.getItem.mockReturnValue('invalid-token')
      mockGet.mockRejectedValueOnce(new Error('Unauthorized'))

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
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
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'new-token')
    })

    it('should throw error on failed login', async () => {
      mockPost.mockRejectedValueOnce({
        response: {
          data: { message: 'Invalid credentials' },
        },
      })

      const { result } = renderHook(() => useAuth(), { wrapper })
      await waitFor(() => expect(result.current.loading).toBe(false))

      await expect(
        act(async () => {
          await result.current.login('test@example.com', 'wrong-password')
        })
      ).rejects.toThrow()
    })
  })

  describe('logout', () => {
    it('should clear user and token', async () => {
      localStorageMock.getItem.mockReturnValue('valid-token')
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
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
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

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      localStorageMock.getItem.mockReturnValue('valid-token')
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
      mockPost.mockResolvedValueOnce({
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
        await result.current.updateProfile({ name: 'New Name' })
      })

      expect(result.current.user?.name).toBe('New Name')
    })
  })
})
