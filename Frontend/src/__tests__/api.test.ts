/**
 * API Client Tests
 * Tests the Axios API client with interceptors for CSRF, token refresh, and error handling.
 */
/* eslint-disable @typescript-eslint/no-require-imports */
import { InternalAxiosRequestConfig } from 'axios'

const makeAxiosInstance = () => ({
  defaults: { headers: { common: {} } },
  interceptors: {
    request: {
      use: jest.fn((handler) => {
        mockAxiosInstance.requestHandlers = mockAxiosInstance.requestHandlers || []
        mockAxiosInstance.requestHandlers.push(handler)
        return handler
      }),
    },
    response: {
      use: jest.fn((success, error) => {
        mockAxiosInstance.responseSuccessHandler = success
        mockAxiosInstance.responseErrorHandler = error
        return { success, error }
      }),
    },
  },
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
  request: jest.fn(),
})

let mockAxiosInstance: any
let mockCreate: jest.Mock

function loadApiModule() {
  jest.resetModules()
  mockAxiosInstance = makeAxiosInstance()
  mockCreate = jest.fn(() => mockAxiosInstance)
  jest.doMock('axios', () => ({
    __esModule: true,
    default: { create: mockCreate },
    create: mockCreate,
  }))
  return require('@/lib/api')
}

describe('API Client', () => {
  beforeEach(() => {
    document.cookie = ''
  })

  afterEach(() => {
    jest.dontMock('axios')
    jest.resetModules()
  })

  describe('CSRF Token Handling', () => {
    it('attaches CSRF token on mutating requests', async () => {
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: '_csrf=test-token-123',
        configurable: true,
      })

      loadApiModule()

      const config: InternalAxiosRequestConfig = {
        method: 'post',
        url: '/api/test',
        headers: {},
      } as InternalAxiosRequestConfig

      const result = await mockAxiosInstance.requestHandlers[0](config)
      expect(result.headers['X-CSRF-Token']).toBe('test-token-123')
    })

    it('does not attach CSRF token on GET requests', async () => {
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: '_csrf=test-token-123',
        configurable: true,
      })

      loadApiModule()

      const config: InternalAxiosRequestConfig = {
        method: 'get',
        url: '/api/test',
        headers: {},
      } as InternalAxiosRequestConfig

      const result = await mockAxiosInstance.requestHandlers[0](config)
      expect(result.headers['X-CSRF-Token']).toBeUndefined()
    })

    it('handles missing CSRF cookie gracefully', async () => {
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: 'other=value',
        configurable: true,
      })

      loadApiModule()

      const config: InternalAxiosRequestConfig = {
        method: 'post',
        url: '/api/test',
        headers: {},
      } as InternalAxiosRequestConfig

      const result = await mockAxiosInstance.requestHandlers[0](config)
      expect(result.headers['X-CSRF-Token']).toBeUndefined()
    })
  })

  describe('Error Response Handling', () => {
    it('registers a response interceptor for 401 refresh handling', () => {
      loadApiModule()

      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled()
      expect(mockAxiosInstance.responseErrorHandler).toEqual(expect.any(Function))
    })

    it('handles 403 forbidden errors through the response interceptor', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
      loadApiModule()

      const error = {
        response: { status: 403, data: { message: 'Access denied' } },
        config: { url: '/api/admin' },
      }

      await expect(mockAxiosInstance.responseErrorHandler(error)).rejects.toBe(error)
      expect(consoleSpy).toHaveBeenCalledWith('Access forbidden:', 'Access denied')
      consoleSpy.mockRestore()
    })

    it('passes through network errors', async () => {
      loadApiModule()
      const error = new Error('Network Error')

      await expect(mockAxiosInstance.responseErrorHandler(error)).rejects.toBe(error)
    })
  })

  describe('API Configuration', () => {
    it('creates axios instance with correct base URL', () => {
      loadApiModule()

      expect(mockCreate).toHaveBeenCalled()
      const createCall = mockCreate.mock.calls[0][0]
      expect(createCall).toHaveProperty('baseURL')
      expect(createCall).toHaveProperty('timeout', 10000)
      expect(createCall).toHaveProperty('withCredentials', true)
    })
  })
})

describe('getCsrfToken helper', () => {
  afterEach(() => {
    jest.dontMock('axios')
    jest.resetModules()
  })

  it('extracts CSRF token from cookie', () => {
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '_csrf=abc123; other=value',
      configurable: true,
    })

    const { getCsrfToken } = loadApiModule()
    expect(getCsrfToken()).toBe('abc123')
  })

  it('returns null when no CSRF cookie present', () => {
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: 'other=value',
      configurable: true,
    })

    const { getCsrfToken } = loadApiModule()
    expect(getCsrfToken()).toBeNull()
  })

  it('handles SSR context', () => {
    const originalDocument = global.document
    // @ts-expect-error test SSR branch
    global.document = undefined

    const { getCsrfToken } = loadApiModule()
    expect(getCsrfToken()).toBeNull()

    global.document = originalDocument
  })
})
