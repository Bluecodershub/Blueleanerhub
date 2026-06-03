/**
 * Auth Middleware Tests
 * Tests for authentication and authorization middleware.
 */
import { Request, Response, NextFunction } from 'express';
import { authenticate, authorize, optionalAuth } from '../../src/middleware/auth';

// Mock dependencies
jest.mock('../../src/db', () => ({
    db: {
        query: {
            users: {
                findFirst: jest.fn(),
            },
        },
    },
}));

jest.mock('../../src/utils/jwt', () => ({
    verifyAccessToken: jest.fn(),
    TokenPayload: { userId: 1, role: 'STUDENT' },
}));

jest.mock('../../src/utils/logger', () => ({
    default: {
        error: jest.fn(),
        warn: jest.fn(),
        info: jest.fn(),
    },
}));

describe('Auth Middleware', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
        jest.clearAllMocks();
        mockReq = {
            headers: {},
            signedCookies: {},
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
        mockNext = jest.fn();
    });

    describe('authorize', () => {
        it('should return 401 if no user is authenticated', () => {
            mockReq.user = undefined;
            
            authorize('ADMIN')(mockReq as Request, mockRes as Response, mockNext);
            
            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Authentication required',
            });
        });

        it('should return 403 if user role is not authorized', () => {
            mockReq.user = { id: 1, email: 'test@test.com', fullName: 'Test', role: 'STUDENT' };
            
            authorize('ADMIN', 'MENTOR')(mockReq as Request, mockRes as Response, mockNext);
            
            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Access denied. Insufficient permissions.',
            });
        });

        it('should call next if user is authorized with ADMIN role', () => {
            mockReq.user = { id: 1, email: 'test@test.com', fullName: 'Test', role: 'ADMIN' };
            
            authorize('ADMIN')(mockReq as Request, mockRes as Response, mockNext);
            
            expect(mockNext).toHaveBeenCalled();
        });

        it('should call next if user role matches allowed role', () => {
            mockReq.user = { id: 1, email: 'test@test.com', fullName: 'Test', role: 'MENTOR' };
            
            authorize('MENTOR')(mockReq as Request, mockRes as Response, mockNext);
            
            expect(mockNext).toHaveBeenCalled();
        });
    });

    describe('optionalAuth', () => {
        it('should call next without user if no token', async () => {
            await optionalAuth(mockReq as Request, mockRes as Response, mockNext);
            
            expect(mockNext).toHaveBeenCalled();
        });
    });
});