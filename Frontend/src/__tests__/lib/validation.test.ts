/**
 * Form Validation Tests
 */

// Email validation
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Password validation (min 8 chars, at least 1 uppercase, 1 lowercase, 1 number, 1 special)
const isValidPassword = (password: string): boolean => {
  if (password.length < 8 || password.length > 128) return false
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSpecial = /[@$!%*?&]/.test(password)
  return hasUppercase && hasLowercase && hasNumber && hasSpecial
}

// URL validation
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Required field validation
const isRequired = (value: string | null | undefined): boolean => {
  return value !== null && value !== undefined && value.trim().length > 0
}

// Length validation
const isValidLength = (value: string, min: number, max: number): boolean => {
  return value.length >= min && value.length <= max
}

// Phone number validation (basic)
const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s-]{10,}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

// Username validation (alphanumeric, underscore, hyphen)
const isValidUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/
  return usernameRegex.test(username)
}

describe('Validation Functions', () => {
  describe('isValidEmail', () => {
    it('returns true for valid emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true)
      expect(isValidEmail('user+tag@example.com')).toBe(true)
    })

    it('returns false for invalid emails', () => {
      expect(isValidEmail('')).toBe(false)
      expect(isValidEmail('test')).toBe(false)
      expect(isValidEmail('@example.com')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
      expect(isValidEmail('test@.com')).toBe(false)
    })
  })

  describe('isValidPassword', () => {
    it('returns true for valid passwords', () => {
      expect(isValidPassword('Password123!')).toBe(true)
      expect(isValidPassword('MyP@ssw0rd')).toBe(true)
      expect(isValidPassword('C0mplex!Pass')).toBe(true)
    })

    it('returns false for invalid passwords', () => {
      expect(isValidPassword('')).toBe(false)
      expect(isValidPassword('short1!')).toBe(false) // Too short
      expect(isValidPassword('password123!')).toBe(false) // No uppercase
      expect(isValidPassword('PASSWORD123!')).toBe(false) // No lowercase
      expect(isValidPassword('Password!')).toBe(false) // No number
      expect(isValidPassword('Password123')).toBe(false) // No special char
    })
  })

  describe('isValidUrl', () => {
    it('returns true for valid URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true)
      expect(isValidUrl('http://localhost:3000')).toBe(true)
      expect(isValidUrl('https://sub.domain.com/path?query=1')).toBe(true)
    })

    it('returns false for invalid URLs', () => {
      expect(isValidUrl('')).toBe(false)
      expect(isValidUrl('not-a-url')).toBe(false)
      expect(isValidUrl('http://')).toBe(false)
    })
  })

  describe('isRequired', () => {
    it('returns true for valid values', () => {
      expect(isRequired('text')).toBe(true)
      expect(isRequired('a')).toBe(true)
      expect(isRequired('  text  ')).toBe(true)
    })

    it('returns false for invalid values', () => {
      expect(isRequired('')).toBe(false)
      expect(isRequired('   ')).toBe(false)
      expect(isRequired(null)).toBe(false)
      expect(isRequired(undefined)).toBe(false)
    })
  })

  describe('isValidLength', () => {
    it('validates string length correctly', () => {
      expect(isValidLength('hello', 3, 10)).toBe(true)
      expect(isValidLength('hi', 3, 10)).toBe(false) // Too short
      expect(isValidLength('this is a very long string', 3, 10)).toBe(false) // Too long
    })
  })

  describe('isValidPhone', () => {
    it('returns true for valid phone numbers', () => {
      expect(isValidPhone('+1-555-123-4567')).toBe(true)
      expect(isValidPhone('+91 98765 43210')).toBe(true)
      expect(isValidPhone('1234567890')).toBe(true)
    })

    it('returns false for invalid phone numbers', () => {
      expect(isValidPhone('')).toBe(false)
      expect(isValidPhone('123')).toBe(false) // Too short
      expect(isValidPhone('abc')).toBe(false)
    })
  })

  describe('isValidUsername', () => {
    it('returns true for valid usernames', () => {
      expect(isValidUsername('john_doe')).toBe(true)
      expect(isValidUsername('user-123')).toBe(true)
      expect(isValidUsername('abc')).toBe(true) // Minimum length
    })

    it('returns false for invalid usernames', () => {
      expect(isValidUsername('')).toBe(false)
      expect(isValidUsername('ab')).toBe(false) // Too short
      expect(isValidUsername('user@name')).toBe(false) // Invalid character
      expect(isValidUsername('a'.repeat(31))).toBe(false) // Too long
    })
  })
})
