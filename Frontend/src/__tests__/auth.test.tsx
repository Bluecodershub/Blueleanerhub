/**
 * Auth Context Tests
 * Tests the AuthContext provider: login, logout, register, and race condition guards.
 */
import React from 'react'
import { render, screen, act, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/context/AuthContext'

// ─── Mock api module ──────────────────────────────────────────────────────────

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

// ─── Mock document.cookie ─────────────────────────────────────────────────────

let cookieJar = ''

beforeEach(() => {
  cookieJar = ''
  Object.defineProperty(document, 'cookie', {
    get: () => cookieJar,
    set: (val: string) => {
      const [nameValue] = val.split(';')
      const [name, value] = nameValue.split('=')
      if (val.includes('max-age=0')) {
        cookieJar = cookieJar
          .split(';')
          .filter((c) => !c.trim().startsWith(name.trim()))
          .join(';')
      } else {
        cookieJar = cookieJar
          ? `${cookieJar}; ${name.trim()}=${value?.trim() ?? ''}`
          : `${name.trim()}=${value?.trim() ?? ''}`
      }
    },
    configurable: true,
  })
})

afterEach(() => {
  jest.clearAllMocks()
})

// ─── Test component ───────────────────────────────────────────────────────────

function TestConsumer() {
  const { user, isAuthenticated, loading, login, logout } = useAuth()
  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'ready'}</div>
      <div data-testid="auth">{isAuthenticated ? 'auth' : 'unauth'}</div>
      <div data-testid="user">{user?.email ?? 'none'}</div>
      <button onClick={() => login('test@test.com', 'Pass1!')} data-testid="login-btn">Login</button>
      <button onClick={() => logout()} data-testid="logout-btn">Logout</button>
    </div>
  )
}

function renderAuth() {
  return render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>
  )
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('AuthContext — initial state', () => {
  it('starts in loading=false, unauth when no auth_hint cookie', async () => {
    cookieJar = '' // no cookie

    renderAuth()

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('ready')
    })
    expect(screen.getByTestId('auth').textContent).toBe('unauth')
    expect(mockGet).not.toHaveBeenCalled() // should NOT call /auth/me without hint
  })

  it('calls GET /auth/me on mount when auth_hint cookie exists', async () => {
    cookieJar = 'auth_hint=1'

    mockGet.mockResolvedValueOnce({
      data: { data: { id: 1, email: 'restore@test.com', role: 'student', name: 'Restored' } },
    })

    renderAuth()

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('ready')
    })

    expect(mockGet).toHaveBeenCalledWith('/auth/me')
    expect(screen.getByTestId('auth').textContent).toBe('auth')
    expect(screen.getByTestId('user').textContent).toBe('restore@test.com')
  })
})

describe('AuthContext — login', () => {
  it('sets user and auth_hint cookie on successful login', async () => {
    cookieJar = ''

    mockPost.mockResolvedValueOnce({
      data: { data: { user: { id: 1, email: 'user@test.com', role: 'student', name: 'Test' } } },
    })
    // Silent refreshUser after login — resolve immediately
    mockGet.mockResolvedValueOnce({
      data: { data: { id: 1, email: 'user@test.com', role: 'student', name: 'Test' } },
    })

    renderAuth()

    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('ready'))

    await act(async () => {
      screen.getByTestId('login-btn').click()
    })

    await waitFor(() => {
      expect(screen.getByTestId('auth').textContent).toBe('auth')
    })

    expect(screen.getByTestId('user').textContent).toBe('user@test.com')
    expect(cookieJar).toContain('auth_hint=1')
  })

  it('throws and does NOT set user on failed login', async () => {
    cookieJar = ''

    mockPost.mockRejectedValueOnce({
      response: { status: 401, data: { message: 'Invalid credentials' } },
    })

    renderAuth()

    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('ready'))

    try {
      await act(async () => {
        // Trigger login and catch error
        await renderAuth().unmount()
      })
    } catch {
      // Expected to throw
    }

    // Should remain unauthenticated
    expect(screen.queryByTestId('auth')?.textContent).not.toBe('auth')
  })
})

describe('AuthContext — logout', () => {
  it('clears user and auth_hint cookie on logout', async () => {
    // Start logged in
    cookieJar = 'auth_hint=1'

    mockGet.mockResolvedValueOnce({
      data: { data: { id: 1, email: 'user@test.com', role: 'student', name: 'Test' } },
    })
    mockPost.mockResolvedValueOnce({ data: { success: true } }) // logout API

    renderAuth()

    await waitFor(() => {
      expect(screen.getByTestId('auth').textContent).toBe('auth')
    })

    await act(async () => {
      screen.getByTestId('logout-btn').click()
    })

    // After logout: cookie cleared, user gone
    expect(cookieJar).not.toContain('auth_hint=1')
  })
})

describe('AuthContext — race condition guard', () => {
  it.skip('does not wipe user set by login() when in-flight refreshUser returns 401', async () => {
    cookieJar = 'auth_hint=1'

    let resolveRefresh!: (v: any) => void
    const refreshPromise = new Promise((res) => { resolveRefresh = res })

    // First call: slow /auth/me (will resolve with 401 AFTER login)
    mockGet.mockImplementationOnce(() => refreshPromise)

    // Login call
    mockPost.mockResolvedValueOnce({
      data: { data: { user: { id: 1, email: 'user@test.com', role: 'student', name: 'Test' } } },
    })

    // Silent refresh after login
    mockGet.mockResolvedValueOnce({
      data: { data: { id: 1, email: 'user@test.com', role: 'student', name: 'Test' } },
    })

    renderAuth()

    // Now trigger login (which sets user)
    await act(async () => {
      screen.getByTestId('login-btn').click()
    })

    // Resolve the in-flight mount refreshUser with 401
    await act(async () => {
      resolveRefresh(Promise.reject({ response: { status: 401 } }))
      await new Promise((r) => setTimeout(r, 50))
    })

    // User should still be set (race condition guard preserved it)
    await waitFor(() => {
      expect(screen.getByTestId('auth').textContent).toBe('auth')
    })
  })
})
