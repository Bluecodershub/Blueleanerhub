import { cn, formatDate, formatDuration, slugify, getStorageItem, setStorageItem, removeStorageItem } from '../lib/utils'

describe('cn', () => {
  it('merges class names correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes', () => {
    const cond = true
    expect(cn('foo', cond && 'bar')).toBe('foo bar')
    expect(cn('foo', false && 'bar')).toBe('foo')
  })

  it('handles empty inputs', () => {
    expect(cn()).toBe('')
    expect(cn('', 'foo')).toBe('foo')
  })
})

describe('formatDate', () => {
  it('formats Date objects', () => {
    const result = formatDate(new Date('2024-03-15'))
    expect(result).toContain('Mar')
    expect(result).toContain('15')
    expect(result).toContain('2024')
  })

  it('formats string dates', () => {
    const result = formatDate('2024-01-01')
    expect(result).toContain('Jan')
  })
})

describe('formatDuration', () => {
  it('formats minutes only', () => {
    expect(formatDuration(300)).toBe('5m')
    expect(formatDuration(60)).toBe('1m')
  })

  it('formats hours and minutes', () => {
    expect(formatDuration(3660)).toBe('1h 1m')
    expect(formatDuration(7200)).toBe('2h 0m')
  })
})

describe('slugify', () => {
  it('converts text to lowercase slug', () => {
    expect(slugify('Hello World')).toBe('hello-world')
    expect(slugify('React JS')).toBe('react-js')
  })

  it('removes special characters', () => {
    expect(slugify('Test @#$%')).toBe('test')
  })

  it('handles underscores and hyphens', () => {
    expect(slugify('foo_bar-baz')).toBe('foo-bar-baz')
  })

  it('trims leading/trailing hyphens', () => {
    expect(slugify('  test  ')).toBe('test')
  })
})

describe('getStorageItem', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('returns parsed item from localStorage', () => {
    localStorage.setItem('test', JSON.stringify({ foo: 'bar' }))
    expect(getStorageItem('test', {})).toEqual({ foo: 'bar' })
  })

  it('returns fallback when item not found', () => {
    expect(getStorageItem('nonexistent', 'default')).toBe('default')
  })

  it('returns fallback when JSON parse fails', () => {
    localStorage.setItem('invalid', 'not-valid-json')
    expect(getStorageItem('invalid', [])).toEqual([])
  })

  it('handles localStorage errors gracefully', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage error')
    })
    expect(getStorageItem('key', 'fallback')).toBe('fallback')
  })
})

describe('setStorageItem', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('stores item in localStorage', () => {
    setStorageItem('test', { data: 'value' })
    expect(localStorage.getItem('test')).toBe(JSON.stringify({ data: 'value' }))
  })

  it('handles storage errors silently', () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage full')
    })
    // Should not throw
    expect(() => setStorageItem('key', 'value')).not.toThrow()
  })
})

describe('removeStorageItem', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('removes item from localStorage', () => {
    localStorage.setItem('test', 'value')
    removeStorageItem('test')
    expect(localStorage.getItem('test')).toBeNull()
  })

  it('handles storage errors silently', () => {
    jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('Storage error')
    })
    // Should not throw
    expect(() => removeStorageItem('key')).not.toThrow()
  })
})
