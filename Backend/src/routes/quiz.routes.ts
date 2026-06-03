import { Router } from 'express';
import { QuizController } from '../controllers/quiz.controller';
import { commonValidators } from '../utils/validators';
import { validate } from '../middleware/validate';
import { authenticate, optionalAuth } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';

const router = Router();
const controller = new QuizController();

router.get('/', apiLimiter, optionalAuth, controller.getQuizzes.bind(controller));
router.get('/daily', apiLimiter, optionalAuth, controller.getDailyQuiz.bind(controller));
router.get('/attempts/me', apiLimiter, authenticate, controller.getUserAttempts.bind(controller));
router.get('/leaderboard/:type', apiLimiter, controller.getLeaderboard.bind(controller));
router.post('/generate', apiLimiter, authenticate, controller.generateAIQuiz.bind(controller));
router.get('/:id', apiLimiter, optionalAuth, commonValidators.idParam, validate, controller.getQuizById.bind(controller));
router.post('/:id/submit', apiLimiter, authenticate, commonValidators.idParam, validate, controller.submitQuiz.bind(controller));
router.post('/:id/behavior-events', apiLimiter, authenticate, commonValidators.idParam, validate, controller.createBehaviorEvent.bind(controller));
router.get('/:id/adaptive-guidance', apiLimiter, authenticate, commonValidators.idParam, validate, controller.getAdaptiveGuidance.bind(controller));

export default router;
