/**
 * Error Middleware Tests
 * Tests for custom error classes and error handling middleware.
 */
import {
    AppError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ConflictError,
} from '../../src/middleware/error.middleware';

describe('Error Middleware', () => {
    describe('Custom Error Classes', () => {
        describe('AppError', () => {
            it('should create error with message and status code', () => {
                const error = new AppError('Test error', 500);
                
                expect(error.message).toBe('Test error');
                expect(error.statusCode).toBe(500);
                expect(error.isOperational).toBe(true);
            });

            it('should default to 500 status code', () => {
                const error = new AppError('Test error');
                
                expect(error.statusCode).toBe(500);
            });
        });

        describe('ValidationError', () => {
            it('should create with 400 status code', () => {
                const error = new ValidationError('Invalid input');
                
                expect(error.message).toBe('Invalid input');
                expect(error.statusCode).toBe(400);
            });

            it('should have default message', () => {
                const error = new ValidationError();
                
                expect(error.message).toBe('Validation failed');
            });
        });

        describe('AuthenticationError', () => {
            it('should create with 401 status code', () => {
                const error = new AuthenticationError('Please login');
                
                expect(error.message).toBe('Please login');
                expect(error.statusCode).toBe(401);
            });
        });

        describe('AuthorizationError', () => {
            it('should create with 403 status code', () => {
                const error = new AuthorizationError('Access denied');
                
                expect(error.message).toBe('Access denied');
                expect(error.statusCode).toBe(403);
            });
        });

        describe('NotFoundError', () => {
            it('should create with 404 status code', () => {
                const error = new NotFoundError('Resource not found');
                
                expect(error.message).toBe('Resource not found');
                expect(error.statusCode).toBe(404);
            });
        });

        describe('ConflictError', () => {
            it('should create with 409 status code', () => {
                const error = new ConflictError('Already exists');
                
                expect(error.message).toBe('Already exists');
                expect(error.statusCode).toBe(409);
            });
        });
    });
});