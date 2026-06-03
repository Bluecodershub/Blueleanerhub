// @ts-nocheck
import request from 'supertest';
import express, { Application } from 'express';
import { reportError, getErrorStats, cleanupOldErrors } from '../../src/controllers/errors';
import { pool } from '../../src/utils/database';

// Mock the database pool
const mockPool = pool as jest.Mocked<typeof pool>;

describe('Error Controller', () => {
  let app: Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    
    // Set up routes for testing
    app.post('/errors/report', reportError);
    app.get('/errors/stats', getErrorStats);
    app.delete('/errors/cleanup', cleanupOldErrors);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockPool.query.mockReset();
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

    it('should successfully report a frontend error', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [{ id: 1 }],
        command: 'INSERT',
        rowCount: 1,
        oid: 0,
        fields: [],
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
          reportId: 1,
        },
      });

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO frontend_errors'),
        expect.arrayContaining([
          'error_123456789',
          'TypeError',
          'Cannot read property of undefined',
          expect.any(String), // stack
          expect.any(String), // component stack
          'UserProfile',
          'section',
          expect.any(String), // url
          expect.any(String), // user agent
            null, // user_id (no auth)
          null, // user_email (no auth)
            null, // ip_address
          null, // session_id
          expect.any(String), // metadata JSON
          expect.any(Date), // timestamp
        ])
      );
    });

    it('should handle missing optional fields', async () => {
      const minimalErrorReport = {
        error: {
          message: 'Test error',
        },
        context: {
          timestamp: new Date().toISOString(),
        },
      };

      mockPool.query.mockResolvedValueOnce({
        rows: [{ id: 2 }],
        command: 'INSERT',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      const response = await request(app)
        .post('/errors/report')
        .send(minimalErrorReport)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO frontend_errors'),
        expect.arrayContaining([
          expect.any(String), // generated error_id
          'Unknown Error',
          'Test error',
          null, // no stack
          null, // no component stack
          null, // no component name
          'unknown', // default level
          null, // no url
          expect.any(String), // user agent from headers
          null, // no user_id
          null, // no user_email
          null, // ip_address
          null, // no session_id
          expect.any(String), // metadata JSON
          expect.any(Date), // timestamp
        ])
      );
    });

    it('should return 500 when database insert fails', async () => {
      mockPool.query.mockRejectedValueOnce(new Error('Database connection failed'));

      const response = await request(app)
        .post('/errors/report')
        .send(validErrorReport)
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        message: 'Failed to process error report',
      });
    });

    it('should generate error ID if not provided', async () => {
      const reportWithoutId = { ...validErrorReport };
      delete (reportWithoutId as any).errorId;

      mockPool.query.mockResolvedValueOnce({
        rows: [{ id: 3 }],
        command: 'INSERT',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      const response = await request(app)
        .post('/errors/report')
        .send(reportWithoutId)
        .expect(201);

      expect(response.body.data.errorId).toMatch(/^error_\d+_[a-z0-9]+$/);
    });

    it('should handle authenticated user errors', async () => {
      // Mock authenticated request
      const authApp = express();
      authApp.use(express.json());
      authApp.use((req, res, next) => {
        req.user = {
          id: 123,
          email: 'user@example.com',
          role: 'user',
          fullName: 'Test User',
        };
        next();
      });
      authApp.post('/errors/report', reportError);

      mockPool.query.mockResolvedValueOnce({
        rows: [{ id: 4 }],
        command: 'INSERT',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      const response = await request(authApp)
        .post('/errors/report')
        .send(validErrorReport)
        .expect(201);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO frontend_errors'),
        expect.arrayContaining([
          expect.any(String), // error_id
          expect.any(String), // error_name
          expect.any(String), // error_message
          expect.any(String), // error_stack
          expect.any(String), // component_stack
          expect.any(String), // component_name
          expect.any(String), // error_level
          expect.any(String), // url
          expect.any(String), // user_agent
          123, // user_id
          null, // user_email (pseudonymized by default)
          null, // ip_address (pseudonymized by default)
          null, // session_id
          expect.any(String), // metadata
          expect.any(Date), // timestamp
        ])
      );
    });
  });

  describe('GET /errors/stats', () => {
    beforeEach(() => {
      // Mock all the stat queries
      mockPool.query
        .mockResolvedValueOnce({ rows: [{ total: '42' }], command: 'SELECT', rowCount: 1, oid: 0, fields: [] })
        .mockResolvedValueOnce({ 
          rows: [
            { error_level: 'page', count: '15' },
            { error_level: 'section', count: '20' },
            { error_level: 'component', count: '7' },
          ], 
          command: 'SELECT', rowCount: 3, oid: 0, fields: [] 
        })
        .mockResolvedValueOnce({ 
          rows: [
            { error_name: 'TypeError', error_message: 'Cannot read property of undefined', count: '10' },
            { error_name: 'ReferenceError', error_message: 'Variable not defined', count: '5' },
          ], 
          command: 'SELECT', rowCount: 2, oid: 0, fields: [] 
        })
        .mockResolvedValueOnce({ 
          rows: [
            { component_name: 'UserProfile', count: '8' },
            { component_name: 'Dashboard', count: '6' },
          ], 
          command: 'SELECT', rowCount: 2, oid: 0, fields: [] 
        })
        .mockResolvedValueOnce({ 
          rows: [
            { hour: '2023-12-01T10:00:00Z', count: '3' },
            { hour: '2023-12-01T09:00:00Z', count: '5' },
          ], 
          command: 'SELECT', rowCount: 2, oid: 0, fields: [] 
        });
    });

    it('should return error statistics for default time range', async () => {
      const response = await request(app)
        .get('/errors/stats')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          total: 42,
          byLevel: [
            { error_level: 'page', count: '15' },
            { error_level: 'section', count: '20' },
            { error_level: 'component', count: '7' },
          ],
          topErrors: [
            { error_name: 'TypeError', error_message: 'Cannot read property of undefined', count: '10' },
            { error_name: 'ReferenceError', error_message: 'Variable not defined', count: '5' },
          ],
          byComponent: [
            { component_name: 'UserProfile', count: '8' },
            { component_name: 'Dashboard', count: '6' },
          ],
          overTime: [
            { hour: '2023-12-01T10:00:00Z', count: '3' },
            { hour: '2023-12-01T09:00:00Z', count: '5' },
          ],
          timeRange: '24h',
        },
      });

      expect(mockPool.query).toHaveBeenCalledTimes(5);
    });

    it('should handle different time ranges', async () => {
      const response = await request(app)
        .get('/errors/stats?range=7d')
        .expect(200);

      expect(response.body.data.timeRange).toBe('7d');

      // Verify the time filter is passed as a parameterized Date
      const calls = mockPool.query.mock.calls;
      calls.forEach(([query, params]) => {
        if (query.includes('WHERE')) {
          expect(Array.isArray(params)).toBe(true);
          expect(params[0]).toBeInstanceOf(Date);
        }
      });
    });

    it('should handle database errors gracefully', async () => {
      mockPool.query.mockReset();
      mockPool.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app)
        .get('/errors/stats')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Failed to fetch error stats');
    });
  });

  describe('DELETE /errors/cleanup', () => {
    it('should clean up old error records', async () => {
      mockPool.query.mockResolvedValueOnce({
        rowCount: 150,
        command: 'DELETE',
        rows: [],
        oid: 0,
        fields: [],
      });

      // controller returns 200 for this scenario
      const response = await request(app)
        .delete('/errors/cleanup?days=30')
        .expect(200);

      // ensure we still called the query
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM frontend_errors'),
        [30],
      );
      expect(response.body.success).toBe(true);
    });

    it('should use default retention period if not specified', async () => {
      mockPool.query.mockResolvedValueOnce({
        rowCount: 75,
        command: 'DELETE',
        rows: [],
        oid: 0,
        fields: [],
      });

      const response = await request(app)
        .delete('/errors/cleanup')
        .expect(200);

      expect(response.body.message).toContain('30 days');
    });

    it('should validate retention days range', async () => {
      const response = await request(app)
        .delete('/errors/cleanup?days=0')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('days must be an integer between 1 and');
      expect(mockPool.query).not.toHaveBeenCalled();
    });

    // TODO(issue): Align cleanup/stats DB-failure policy across error-reporting endpoints.
    it('should handle database errors', async () => {
      mockPool.query.mockRejectedValueOnce(new Error('Cleanup failed'));

      const response = await request(app)
        .delete('/errors/cleanup')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Failed to cleanup old errors');
    });
  });
});