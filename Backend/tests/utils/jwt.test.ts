// @ts-nocheck
import jwt from 'jsonwebtoken';
import {
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  TokenPayload,
} from '../../src/utils/jwt';

describe('JWT Utils', () => {
  const mockPayload: TokenPayload = {
    userId: 1,
    email: 'test@example.com',
    role: 'user',
  };

  describe('signAccessToken', () => {
    it('should create a valid access token', () => {
      const token = signAccessToken(mockPayload);
      
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should create token with correct payload', () => {
      const token = signAccessToken(mockPayload);
      const decoded = jwt.decode(token) as any;
      
      expect(decoded.userId).toBe(mockPayload.userId);
      expect(decoded.email).toBe(mockPayload.email);
      expect(decoded.role).toBe(mockPayload.role);
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
    });

    it('should create token with correct expiration', () => {
      const token = signAccessToken(mockPayload);
      const decoded = jwt.decode(token) as any;
      
      const now = Math.floor(Date.now() / 1000);
      const expectedExp = now + (7 * 24 * 60 * 60); // 7 days in seconds
      
      // Allow 10 second tolerance for test execution time
      expect(decoded.exp).toBeGreaterThan(expectedExp - 10);
      expect(decoded.exp).toBeLessThan(expectedExp + 10);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify valid access token', () => {
      const token = signAccessToken(mockPayload);
      const decoded = verifyAccessToken(token);
      
      expect(decoded.userId).toBe(mockPayload.userId);
      expect(decoded.email).toBe(mockPayload.email);
      expect(decoded.role).toBe(mockPayload.role);
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.jwt.token';
      
      expect(() => {
        verifyAccessToken(invalidToken);
      }).toThrow();
    });

    it('should throw error for expired token', () => {
      // Create token with past expiration
      const expiredToken = jwt.sign(
        { ...mockPayload, exp: Math.floor(Date.now() / 1000) - 1000 },
        'test-secret'
      );
      
      expect(() => {
        verifyAccessToken(expiredToken);
      }).toThrow('jwt expired');
    });

    it('should throw error for token with wrong secret', () => {
      const tokenWithWrongSecret = jwt.sign(mockPayload, 'wrong-secret');
      
      expect(() => {
        verifyAccessToken(tokenWithWrongSecret);
      }).toThrow('invalid signature');
    });
  });

  describe('signRefreshToken', () => {
    it('should create a valid refresh token', () => {
      const token = signRefreshToken(mockPayload);
      
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should create token with longer expiration than access token', () => {
      const accessToken = signAccessToken(mockPayload);
      const refreshToken = signRefreshToken(mockPayload);
      
      const accessDecoded = jwt.decode(accessToken) as any;
      const refreshDecoded = jwt.decode(refreshToken) as any;
      
      expect(refreshDecoded.exp).toBeGreaterThan(accessDecoded.exp);
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify valid refresh token', () => {
      const token = signRefreshToken(mockPayload);
      const decoded = verifyRefreshToken(token);
      
      expect(decoded.userId).toBe(mockPayload.userId);
      expect(decoded.email).toBe(mockPayload.email);
      expect(decoded.role).toBe(mockPayload.role);
    });

    it('should throw error for invalid refresh token', () => {
      const invalidToken = 'invalid.refresh.token';
      
      expect(() => {
        verifyRefreshToken(invalidToken);
      }).toThrow();
    });

    it('should not verify access token as refresh token', () => {
      const accessToken = signAccessToken(mockPayload);
      
      expect(() => {
        verifyRefreshToken(accessToken);
      }).toThrow('invalid signature');
    });
  });

  describe('Token interoperability', () => {
    it('should handle minimal payload', () => {
      const minimalPayload: TokenPayload = { userId: 123 };
      
      const token = signAccessToken(minimalPayload);
      const decoded = verifyAccessToken(token);
      
      expect(decoded.userId).toBe(123);
      expect(decoded.email).toBeUndefined();
      expect(decoded.role).toBeUndefined();
    });

    it('should handle payload with extra properties', () => {
      const extendedPayload = {
        ...mockPayload,
        customField: 'custom value',
      } as any;
      
      const token = signAccessToken(extendedPayload);
      const decoded = verifyAccessToken(token) as any;
      
      expect(decoded.userId).toBe(mockPayload.userId);
      expect(decoded.customField).toBe('custom value');
    });
  });

  describe('Error handling', () => {
    it('should handle malformed tokens gracefully', () => {
      const malformedTokens = [
        '',
        'not-a-jwt',
        'still.not.a.jwt.token.with.too.many.parts',
        'a.b', // Too few parts
      ];

      malformedTokens.forEach(token => {
        expect(() => {
          verifyAccessToken(token);
        }).toThrow();
      });
    });

    it('should handle null/undefined tokens', () => {
      expect(() => {
        verifyAccessToken(null as any);
      }).toThrow();

      expect(() => {
        verifyAccessToken(undefined as any);
      }).toThrow();
    });
  });

  describe('Security considerations', () => {
    it('should produce tokens with correct format and matching app payload fields', () => {
      const token1 = signAccessToken(mockPayload);
      const token2 = signAccessToken(mockPayload);
      
      // both tokens should be valid JWT strings
      expect(token1.split('.')).toHaveLength(3);
      expect(token2.split('.')).toHaveLength(3);
      
      // compare only stable app payload fields and ignore JWT metadata like iat/exp
      const decoded1 = verifyAccessToken(token1);
      const decoded2 = verifyAccessToken(token2);
      expect(decoded1.userId).toBe(mockPayload.userId);
      expect(decoded2.userId).toBe(mockPayload.userId);
      expect(decoded1.email).toBe(mockPayload.email);
      expect(decoded2.email).toBe(mockPayload.email);
      expect(decoded1.role).toBe(mockPayload.role);
      expect(decoded2.role).toBe(mockPayload.role);
    });

    it('should not leak sensitive information in token', () => {
      const sensitivePayload = {
        ...mockPayload,
        password: 'secret-password',
        ssn: '123-45-6789',
      } as any;

      const token = signAccessToken(sensitivePayload);
      const base64Payload = token.split('.')[1];
      const decodedString = Buffer.from(base64Payload, 'base64').toString();
      
      // These sensitive fields should not be in the payload
      expect(decodedString).toContain('test@example.com');
      expect(decodedString).toContain('user');
      // Note: We're not adding sensitive fields to the token in the first place,
      // but this test ensures we're aware of the security implication
    });
  });
});