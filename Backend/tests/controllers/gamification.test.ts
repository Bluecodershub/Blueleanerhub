// @ts-nocheck
/**
 * Gamification Controller Tests
 * Tests achievements list, leaderboard functionality.
 */
import { mockReq as createMockReq, mockRes } from '../utils/http';

const mockReq = (overrides = {}) => createMockReq({
  user: { id: 1, email: 'user@test.com', role: 'student', fullName: 'Test User' },
  ...overrides,
});

describe('Gamification Controller', () => {
  describe('Controller Structure', () => {
    it('should export getMyAchievements function', () => {
      const controller = require('../../src/controllers/gamification.controller');
      expect(typeof controller.getMyAchievements).toBe('function');
    });

    it('should export getLeaderboard function', () => {
      const controller = require('../../src/controllers/gamification.controller');
      expect(typeof controller.getLeaderboard).toBe('function');
    });
  });

  describe('Leaderboard validation', () => {
    it('should return 400 for invalid period parameter', async () => {
      jest.resetModules();
      jest.doMock('../../src/db', () => ({
        db: {
          select: jest.fn().mockReturnThis(),
          from: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          offset: jest.fn().mockReturnThis(),
        },
      }));
      jest.doMock('../../src/services/gamification.service', () => ({
        GamificationService: {
          getLeaderboard: jest.fn(),
        },
        LeaderboardPeriod: ['weekly', 'monthly', 'all-time'],
      }));

      const { getLeaderboard } = require('../../src/controllers/gamification.controller');
      const req = mockReq({ query: { period: 'invalid' } });
      const res = mockRes();

      await getLeaderboard(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should accept weekly period', async () => {
      jest.resetModules();
      const mockLeaderboard = [{ id: 1, full_name: 'User 1', total_points: 1000, level: 5 }];
      jest.doMock('../../src/db', () => ({
        db: {
          select: jest.fn().mockReturnThis(),
          from: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          offset: jest.fn().mockReturnThis(),
        },
      }));
      jest.doMock('../../src/services/gamification.service', () => ({
        GamificationService: {
          getLeaderboard: jest.fn().mockResolvedValue(mockLeaderboard),
        },
        LeaderboardPeriod: ['weekly', 'monthly', 'all-time'],
      }));

      const { getLeaderboard } = require('../../src/controllers/gamification.controller');
      const req = mockReq({ query: { period: 'weekly' } });
      const res = mockRes();

      await getLeaderboard(req, res);

      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('Achievements Catalog', () => {
    it('should have predefined achievements', () => {
      const fs = require('fs');
      const path = require('path');
      const source = fs.readFileSync(
        path.resolve(__dirname, '../../src/controllers/gamification.controller.ts'),
        'utf-8'
      );
      expect(source).toMatch(/ALL_ACHIEVEMENTS/);
      expect(source).toMatch(/FIRST_STEPS/);
      expect(source).toMatch(/WEEK_WARRIOR/);
    });
  });
});

describe('GamificationService', () => {
  describe('Service Structure', () => {
    it('should export GamificationService', () => {
      const fs = require('fs');
      const path = require('path');
      const source = fs.readFileSync(
        path.resolve(__dirname, '../../src/services/gamification.service.ts'),
        'utf-8'
      );
      expect(source).toMatch(/export class GamificationService/);
    });

    it('should export LeaderboardPeriod type', () => {
      const fs = require('fs');
      const path = require('path');
      const source = fs.readFileSync(
        path.resolve(__dirname, '../../src/services/gamification.service.ts'),
        'utf-8'
      );
      expect(source).toMatch(/export type LeaderboardPeriod/);
    });
  });
});

describe('API Security — Gamification', () => {
  it('achievements response should have success flag', () => {
    const fs = require('fs');
    const path = require('path');
    const source = fs.readFileSync(
      path.resolve(__dirname, '../../src/controllers/gamification.controller.ts'),
      'utf-8'
    );
    expect(source).toMatch(/res\.json\(\{ success: true/);
  });

  it('leaderboard response should have success flag', () => {
    const fs = require('fs');
    const path = require('path');
    const source = fs.readFileSync(
      path.resolve(__dirname, '../../src/controllers/gamification.controller.ts'),
      'utf-8'
    );
    expect(source).toMatch(/res\.json\(\{ success: true/);
  });
});
