import axios from 'axios'

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

/**
 * Read the _csrf cookie value set by the backend on login.
 * The cookie is NOT httpOnly so that this function can access it.
 * Returns null in SSR context (no document).
 */
export function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(/(?:^|;\s*)_csrf=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Required for HttpOnly cookies
  timeout: 10000,
})

// ─── CSRF request interceptor ─────────────────────────────────────────────────
// Attach the _csrf cookie value as X-CSRF-Token header on all mutating requests.
// GET/HEAD/OPTIONS are safe methods and don't need it.
const SAFE_METHODS = new Set(['get', 'head', 'options'])
api.interceptors.request.use((config) => {
  if (!SAFE_METHODS.has((config.method ?? 'get').toLowerCase())) {
    const token = getCsrfToken()
    if (token) {
      config.headers['X-CSRF-Token'] = token
    }
  }
  return config
})

// ─── Token refresh state ──────────────────────────────────────────────────────
// When the accessToken expires, we attempt a silent refresh ONCE before
// redirecting to login. Multiple concurrent 401s queue up and retry together
// after the single refresh completes.

let isRefreshing = false
let refreshQueue: Array<(success: boolean) => void> = []

function drainRefreshQueue(success: boolean) {
  refreshQueue.forEach((cb) => cb(success))
  refreshQueue = []
}

function redirectToLogin() {
  if (
    typeof window !== 'undefined' &&
    !window.location.pathname.startsWith('/login') &&
    !window.location.pathname.startsWith('/get-started') &&
    !window.location.pathname.startsWith('/auth/oauth') &&
    window.location.pathname !== '/'
  ) {
    const from = encodeURIComponent(window.location.pathname + window.location.search)
    window.location.href = `/login?from=${from}`
  }
}

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't retry the refresh endpoint itself — avoids infinite loops
      if (originalRequest.url?.includes('/auth/refresh-token')) {
        redirectToLogin()
        return Promise.reject(error)
      }

      if (isRefreshing) {
        // Queue this request to retry after the in-progress refresh completes
        return new Promise((resolve, reject) => {
          refreshQueue.push((success) => {
            if (success) resolve(api(originalRequest))
            else reject(error)
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Attempt a silent token refresh using the HttpOnly refreshToken cookie
        await api.post('/auth/refresh-token')
        isRefreshing = false
        drainRefreshQueue(true)
        return api(originalRequest)
      } catch {
        isRefreshing = false
        drainRefreshQueue(false)
        redirectToLogin()
        return Promise.reject(error)
      }
    }

    if (error.response?.status === 403) {
      console.warn('Access forbidden:', error.response.data?.message)
    }

    return Promise.reject(error)
  }
)

export default api
