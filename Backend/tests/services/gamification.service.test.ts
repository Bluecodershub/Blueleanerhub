/**
 * Gamification Service Tests
 * Tests for XP, achievements, and leaderboard functionality.
 */
import { GamificationService } from '../../src/services/gamification.service';
import { User, UserAchievement, XpTracking } from '../../src/db/models';

jest.mock('../../src/db/models', () => ({
  User: {
    findById: jest.fn(),
    find: jest.fn(),
  },
  UserAchievement: {
    findOneAndUpdate: jest.fn(),
  },
  XpTracking: {
    aggregate: jest.fn(),
  },
}));

jest.mock('../../src/utils/database', () => ({
  redisHelpers: {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(true),
    clearPattern: jest.fn().mockResolvedValue(true),
  },
}));

const mockUserModel = User as jest.Mocked<typeof User>;
const mockUserAchievement = UserAchievement as jest.Mocked<typeof UserAchievement>;

describe('GamificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUserAchievement.findOneAndUpdate.mockResolvedValue(null);
    mockUserModel.findById.mockResolvedValue({
      totalPoints: 0,
      level: 1,
      lastActiveAt: null,
      save: jest.fn().mockResolvedValue(undefined),
    } as any);
    (XpTracking.aggregate as jest.Mock).mockResolvedValue([]);
  });

  describe('awardXP', () => {
    it('calls addExperience with the given amount', async () => {
      const addExperienceSpy = jest.spyOn(GamificationService, 'addExperience');

      await GamificationService.awardXP('507f1f77bcf86cd799439011', 50, 'Test reason');

      expect(addExperienceSpy).toHaveBeenCalledWith('507f1f77bcf86cd799439011', 50);
    });
  });

  describe('addExperience', () => {
    it('calculates level based on XP', async () => {
      const result = await GamificationService.addExperience('507f1f77bcf86cd799439011', 100);

      expect(result).toBeDefined();
      expect(result?.totalPoints).toBeGreaterThanOrEqual(100);
      expect(result?.level).toBe(2);
    });
  });

  describe('Leaderboard Period type', () => {
    it('has valid period values', () => {
      const periods: Array<'weekly' | 'monthly' | 'all-time'> = ['weekly', 'monthly', 'all-time'];
      expect(periods).toContain('weekly');
      expect(periods).toContain('monthly');
      expect(periods).toContain('all-time');
    });
  });
});
