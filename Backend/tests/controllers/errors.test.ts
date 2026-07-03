// @ts-nocheck
import request from 'supertest';
import express, { Application } from 'express';
import { reportError, getErrorStats, cleanupOldErrors } from '../../src/controllers/errors';
import { FrontendError } from '../../src/db/models';

jest.mock('../../src/db/models', () => ({
  FrontendError: {
    create: jest.fn(),
    countDocuments: jest.fn(),
    aggregate: jest.fn(),
    deleteMany: jest.fn(),
  },
}));
jest.mock('../../src/utils/logger');

const mockFrontendError = FrontendError as jest.Mocked<typeof FrontendError>;

describe('Error Controller', () => {
  let app: Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.post('/errors/report', reportError);
    app.get('/errors/stats', getErrorStats);
    app.delete('/errors/cleanup', cleanupOldErrors);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockFrontendError.countDocuments.mockResolvedValue(0);
  });

  describe('POST /errors/report', () => {
    const validErrorReport = {
      error: {
        name: 'TypeError',
        message: 'Cannot read property of undefined',
        stack: 'TypeError: Cannot read property of undefined\n    at Component.render',
      },
      errorInfo: {
        componentStack: 'in Component\n    in App',
      },
      context: {
        component: 'UserProfile',
        level: 'section',
        timestamp: new Date().toISOString(),
        userAgent: 'Mozilla/5.0 Test Browser',
        url: 'http://localhost:3000/profile',
      },
      errorId: 'error_123456789',
    };

    it('successfully reports a frontend error', async () => {
      mockFrontendError.create.mockResolvedValueOnce({
        _id: 'report-id-1',
        errorId: 'error_123456789',
        errorLevel: 'section',
        errorMessage: 'Cannot read property of undefined',
        componentName: 'UserProfile',
        url: 'http://localhost:3000/profile',
      });

      const response = await request(app)
        .post('/errors/report')
        .send(validErrorReport)
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        message: 'Error reported successfully',
        data: {
          errorId: 'error_123456789',
          reportId: 'report-id-1',
        },
      });

      expect(mockFrontendError.create).toHaveBeenCalledWith(expect.objectContaining({
        errorId: 'error_123456789',
        errorName: 'TypeError',
        errorMessage: 'Cannot read property of undefined',
        componentStack: 'in Component\n    in App',
        componentName: 'UserProfile',
        errorLevel: 'section',
        userEmail: undefined,
        ipAddress: undefined,
      }));
    });

    it('handles missing optional fields', async () => {
      mockFrontendError.create.mockResolvedValueOnce({
        _id: 'report-id-2',
        errorId: 'generated-error-id',
        errorLevel: 'unknown',
        errorMessage: 'Test error',
      });

      const response = await request(app)
        .post('/errors/report')
        .send({
          error: { message: 'Test error' },
          context: { timestamp: new Date().toISOString() },
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(mockFrontendError.create).toHaveBeenCalledWith(expect.objectContaining({
        errorName: 'Unknown Error',
        errorMessage: 'Test error',
        errorLevel: 'unknown',
      }));
    });

    it('returns 500 when database insert fails', async () => {
      mockFrontendError.create.mockRejectedValueOnce(new Error('Database connection failed'));

      const response = await request(app)
        .post('/errors/report')
        .send(validErrorReport)
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        message: 'Failed to process error report',
      });
    });

    it('generates error ID if not provided', async () => {
      mockFrontendError.create.mockImplementationOnce(async (payload) => ({
        _id: 'report-id-3',
        ...payload,
      }));

      const response = await request(app)
        .post('/errors/report')
        .send({
          ...validErrorReport,
          errorId: undefined,
        })
        .expect(201);

      expect(response.body.data.errorId).toMatch(/^error_\d+_[a-z0-9]+$/);
    });

    it('pseudonymizes authenticated user data by default', async () => {
      const authApp = express();
      authApp.use(express.json());
      authApp.use((req, _res, next) => {
        req.user = {
          id: 'user-123',
          email: 'user@example.com',
          role: 'STUDENT',
          fullName: 'Test User',
        };
        next();
      });
      authApp.post('/errors/report', reportError);

      mockFrontendError.create.mockResolvedValueOnce({
        _id: 'report-id-4',
        errorId: 'error_123456789',
        errorLevel: 'section',
        errorMessage: 'Cannot read property of undefined',
      });

      await request(authApp)
        .post('/errors/report')
        .send(validErrorReport)
        .expect(201);

      expect(mockFrontendError.create).toHaveBeenCalledWith(expect.objectContaining({
        userId: 'user-123',
        userEmail: undefined,
        ipAddress: undefined,
        metadata: expect.objectContaining({
          piiMode: 'pseudonymized',
          userEmailHash: expect.any(String),
        }),
      }));
    });
  });

  describe('GET /errors/stats', () => {
    beforeEach(() => {
      mockFrontendError.countDocuments.mockResolvedValue(42);
      mockFrontendError.aggregate
        .mockResolvedValueOnce([
          { error_level: 'page', count: 15 },
          { error_level: 'section', count: 20 },
          { error_level: 'component', count: 7 },
        ])
        .mockResolvedValueOnce([
          { error_name: 'TypeError', error_message: 'Cannot read property of undefined', count: 10 },
          { error_name: 'ReferenceError', error_message: 'Variable not defined', count: 5 },
        ])
        .mockResolvedValueOnce([
          { component_name: 'UserProfile', count: 8 },
          { component_name: 'Dashboard', count: 6 },
        ])
        .mockResolvedValueOnce([
          { hour: '2023-12-01T10:00:00', count: 3 },
          { hour: '2023-12-01T09:00:00', count: 5 },
        ]);
    });

    it('returns error statistics for default time range', async () => {
      const response = await request(app)
        .get('/errors/stats')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          total: 42,
          byLevel: [
            { error_level: 'page', count: 15 },
            { error_level: 'section', count: 20 },
            { error_level: 'component', count: 7 },
          ],
          topErrors: [
            { error_name: 'TypeError', error_message: 'Cannot read property of undefined', count: 10 },
            { error_name: 'ReferenceError', error_message: 'Variable not defined', count: 5 },
          ],
          byComponent: [
            { component_name: 'UserProfile', count: 8 },
            { component_name: 'Dashboard', count: 6 },
          ],
          overTime: [
            { hour: '2023-12-01T10:00:00', count: 3 },
            { hour: '2023-12-01T09:00:00', count: 5 },
          ],
          timeRange: '24h',
        },
      });
    });

    it('handles different time ranges', async () => {
      const response = await request(app)
        .get('/errors/stats?range=7d')
        .expect(200);

      expect(response.body.data.timeRange).toBe('7d');
      expect(mockFrontendError.countDocuments).toHaveBeenCalledWith({
        createdAt: { $gte: expect.any(Date) },
      });
    });

    it('handles database errors gracefully', async () => {
      mockFrontendError.countDocuments.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app)
        .get('/errors/stats')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Failed to fetch error stats');
    });
  });

  describe('DELETE /errors/cleanup', () => {
    it('cleans up old error records', async () => {
      mockFrontendError.deleteMany.mockResolvedValueOnce({ deletedCount: 150 });

      const response = await request(app)
        .delete('/errors/cleanup?days=30')
        .expect(200);

      expect(mockFrontendError.deleteMany).toHaveBeenCalledWith({
        createdAt: { $lt: expect.any(Date) },
      });
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('150');
    });

    it('uses default retention period if not specified', async () => {
      mockFrontendError.deleteMany.mockResolvedValueOnce({ deletedCount: 75 });

      const response = await request(app)
        .delete('/errors/cleanup')
        .expect(200);

      expect(response.body.message).toContain('30 days');
    });

    it('validates retention days range', async () => {
      const response = await request(app)
        .delete('/errors/cleanup?days=0')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('days must be an integer between 1 and');
      expect(mockFrontendError.deleteMany).not.toHaveBeenCalled();
    });

    it('handles database errors', async () => {
      mockFrontendError.deleteMany.mockRejectedValueOnce(new Error('Cleanup failed'));

      const response = await request(app)
        .delete('/errors/cleanup')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Failed to cleanup old errors');
    });
  });
});
