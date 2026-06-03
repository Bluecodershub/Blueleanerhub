import { API_URL, getCsrfToken } from '@/lib/api'

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${API_URL}/api/v1${normalizedPath}`
}

export function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const method = (init.method ?? 'GET').toUpperCase()
  const headers = new Headers(init.headers)

  if (init.body && !headers.has('Content-Type') && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  if (!SAFE_METHODS.has(method)) {
    const csrfToken = getCsrfToken()
    if (csrfToken) headers.set('X-CSRF-Token', csrfToken)
  }

  return fetch(apiUrl(path), {
    ...init,
    method,
    headers,
    credentials: init.credentials ?? 'include',
  })
}
