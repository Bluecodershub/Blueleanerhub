import { Router } from 'express';
import { getMyAchievements, getLeaderboard } from '../controllers/gamification.controller';
import { authenticate } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';

const router = Router();

router.get('/achievements', authenticate, getMyAchievements);
router.get('/leaderboard',  apiLimiter, getLeaderboard);

export default router;
