import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticate, authorize } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';

const router = Router();
const controller = new AnalyticsController();

router.get('/user/stats',      apiLimiter, authenticate,                          controller.getUserStats.bind(controller));
router.get('/user/progress',   apiLimiter, authenticate,                          controller.getUserProgress.bind(controller));
router.get('/user/strengths',  apiLimiter, authenticate,                          controller.getStrengthsWeaknesses.bind(controller));
router.get('/platform',        apiLimiter, authenticate, authorize('ADMIN'),      controller.getPlatformAnalytics.bind(controller));

export default router;
