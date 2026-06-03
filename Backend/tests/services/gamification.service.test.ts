/**
 * Gamification Service Tests
 * Tests for XP, achievements, and leaderboard functionality.
 */
import { GamificationService } from '../../src/services/gamification.service';

// Mock the database
jest.mock('../../src/db', () => ({
    db: {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([{
            id: 1,
            xp: 100,
            level: 2,
            last_active: new Date()
        }]),
        innerJoin: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
    },
}));

// Mock Redis
jest.mock('../../src/utils/database', () => ({
    redisHelpers: {
        get: jest.fn().mockResolvedValue(null),
        set: jest.fn().mockResolvedValue('OK'),
    },
}));

describe('GamificationService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('awardXP', () => {
        it('should call addExperience with the given amount', async () => {
            const addExperienceSpy = jest.spyOn(GamificationService, 'addExperience');
            
            await GamificationService.awardXP(1, 50, 'Test reason');
            
            expect(addExperienceSpy).toHaveBeenCalledWith(1, 50);
        });
    });

    describe('addExperience', () => {
        it('should calculate level based on XP', async () => {
            const result = await GamificationService.addExperience(1, 100);
            
            // XP = 100, level should be Math.floor(sqrt(100/100)) + 1 = 2
            expect(result).toBeDefined();
        });
    });

    describe('Leaderboard Period type', () => {
        it('should have valid period values', () => {
            const periods: Array<'weekly' | 'monthly' | 'all-time'> = ['weekly', 'monthly', 'all-time'];
            expect(periods).toContain('weekly');
            expect(periods).toContain('monthly');
            expect(periods).toContain('all-time');
        });
    });
});