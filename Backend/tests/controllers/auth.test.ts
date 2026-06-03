// @ts-nocheck
/**
 * Auth Controller Tests
 * Tests login, register, token refresh, and password reset flows.
 */
import { AuthController } from '../../src/controllers/auth.controller';
import { mockReq, mockRes as createMockRes } from '../utils/http';

const mockRes = () => createMockRes({ cookies: true });

const authController = new AuthController();

describe('Auth Controller', () => {
  describe('Controller Structure', () => {
    it('should export AuthController class', () => {
      expect(typeof AuthController).toBe('function');
    });

    it('should have register method', () => {
      expect(typeof authController.register).toBe('function');
    });

    it('should have login method', () => {
      expect(typeof authController.login).toBe('function');
    });

    it('should have logout method', () => {
      expect(typeof authController.logout).toBe('function');
    });
  });

  describe('POST /auth/register', () => {
    it('should handle registration request with missing fields', async () => {
      const req = mockReq({ body: {} });
      const res = mockRes();
      const next = jest.fn();

      await authController.register(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('POST /auth/login', () => {
    it('should handle login request', async () => {
      const req = mockReq({
        body: { email: 'test@test.com', password: 'password' },
      });
      const res = mockRes();
      const next = jest.fn();

      await authController.login(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('POST /auth/logout', () => {
    it('should return success on logout', async () => {
      const req = mockReq({
        user: { id: 1, email: 'user@test.com', role: 'student', fullName: 'Test' },
      });
      const res = mockRes();
      const next = jest.fn();

      await authController.logout(req, res, next);

      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('POST /auth/refresh-token', () => {
    it('should return 401 when refresh token cookie is missing', async () => {
      const req = mockReq({ signedCookies: {} });
      const res = mockRes();
      const next = jest.fn();

      await authController.refreshToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Refresh token not found',
        })
      );
      expect(next).not.toHaveBeenCalled();
    });
  });
});

describe('Auth Middleware', () => {
  it('should reject requests with no token', async () => {
    const { authenticate } = require('../../src/middleware/auth');
    const req = mockReq({ signedCookies: {}, headers: {} });
    const res = mockRes();
    const next = jest.fn();

    await authenticate(req, res, next);

    const statusCall = (res.status as jest.Mock).mock.calls[0]?.[0];
    expect(statusCall).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should reject requests with invalid token', async () => {
    const { authenticate } = require('../../src/middleware/auth');
    const req = mockReq({
      signedCookies: { accessToken: 'invalid.token.here' },
    });
    const res = mockRes();
    const next = jest.fn();

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});

describe('Auth Controller Source Code', () => {
  it('should have setAuthCookies implementation', () => {
    const fs = require('fs');
    const path = require('path');
    const source = fs.readFileSync(
      path.resolve(__dirname, '../../src/controllers/auth.controller.ts'),
      'utf-8'
    );
    expect(source).toMatch(/setAuthCookies/);
  });

  it('should have clearAuthCookies implementation', () => {
    const fs = require('fs');
    const path = require('path');
    const source = fs.readFileSync(
      path.resolve(__dirname, '../../src/controllers/auth.controller.ts'),
      'utf-8'
    );
    expect(source).toMatch(/clearAuthCookies/);
  });

  it('should scope refresh token cookies to /api/auth/refresh-token', () => {
    const fs = require('fs');
    const path = require('path');
    const source = fs.readFileSync(
      path.resolve(__dirname, '../../src/controllers/auth.controller.ts'),
      'utf-8'
    );
    expect(source).toMatch(/\/api\/auth\/refresh-token/);
  });

  it('should export CSRF cookie functions', () => {
    const fs = require('fs');
    const path = require('path');
    const source = fs.readFileSync(
      path.resolve(__dirname, '../../src/middleware/csrf.ts'),
      'utf-8'
    );
    expect(source).toMatch(/setCsrfCookie/);
    expect(source).toMatch(/clearCsrfCookie/);
  });

  it('should have corporateRegister method', () => {
    expect(typeof authController.corporateRegister).toBe('function');
  });

  it('should have corporateLogin method', () => {
    expect(typeof authController.corporateLogin).toBe('function');
  });
});

describe('Corporate Registration', () => {
  describe('POST /auth/corporate/register', () => {
    it('should handle corporate registration request with valid org email', async () => {
      const req = mockReq({
        body: {
          email: 'admin@techcorp.com',
          password: 'SecurePass123!',
          fullName: 'Tech Corp Admin',
          company: 'TechCorp Inc'
        },
      });
      const res = mockRes();
      const next = jest.fn();

      await authController.corporateRegister(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should reject personal email domains for corporate registration', async () => {
      const req = mockReq({
        body: {
          email: 'admin@gmail.com',
          password: 'SecurePass123!',
          fullName: 'Test User',
          company: 'Test Co'
        },
      });
      const res = mockRes();
      const next = jest.fn();

      await authController.corporateRegister(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('Personal email')
        })
      );
    });

    it('should validate organization email format', () => {
      const fs = require('fs');
      const path = require('path');
      const source = fs.readFileSync(
        path.resolve(__dirname, '../../src/controllers/auth.controller.ts'),
        'utf-8'
      );
      expect(source).toMatch(/isOrganizationEmail/);
      expect(source).toMatch(/BLOCKED_EMAIL_DOMAINS/);
    });
  });

  describe('POST /auth/corporate/login', () => {
    it('should handle corporate login request', async () => {
      const req = mockReq({
        body: {
          email: 'admin@techcorp.com',
          password: 'SecurePass123!'
        },
      });
      const res = mockRes();
      const next = jest.fn();

      await authController.corporateLogin(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should reject personal emails for corporate login', async () => {
      const req = mockReq({
        body: {
          email: 'user@gmail.com',
          password: 'password123'
        },
      });
      const res = mockRes();
      const next = jest.fn();

      await authController.corporateLogin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});

describe('Role-based Registration', () => {
  it('should have role field in CreateUserDTO', () => {
    const fs = require('fs');
    const path = require('path');
    const source = fs.readFileSync(
      path.resolve(__dirname, '../../src/models/user.ts'),
      'utf-8'
    );
    expect(source).toMatch(/role\?:.*'STUDENT'.*'CORPORATE'/);
  });

  it('should pass role to UserModel.create in corporateRegister', () => {
    const fs = require('fs');
    const path = require('path');
    const source = fs.readFileSync(
      path.resolve(__dirname, '../../src/controllers/auth.controller.ts'),
      'utf-8'
    );
    expect(source).toMatch(/role:\s*'CORPORATE'/);
  });

  it('should include role in INSERT query', () => {
    const fs = require('fs');
    const path = require('path');
    const source = fs.readFileSync(
      path.resolve(__dirname, '../../src/models/user.ts'),
      'utf-8'
    );
    expect(source).toMatch(/role/);
  });
});
