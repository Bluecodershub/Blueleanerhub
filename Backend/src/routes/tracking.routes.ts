import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as ctrl from '../controllers/tracking.controller';

const router = Router();

// Wishlist / Save Lesson
router.post('/wishlist', authenticate, ctrl.saveLesson);
router.get('/wishlist', authenticate, ctrl.getSavedLessons);
router.delete('/wishlist/:tutorialId/:lessonId', authenticate, ctrl.removeSavedLesson);

// Telemetry Progress & Views
router.post('/progress', authenticate, ctrl.trackProgress);
router.post('/view', authenticate, ctrl.logLessonView);

// Learning Sessions heartbeats
router.post('/session', authenticate, ctrl.heartbeatSession);

// Smart Continue Point
router.get('/continue', authenticate, ctrl.getContinueLearning);

// Domain Recommendations
router.get('/recommendations', authenticate, ctrl.getRecommendations);

// High-fidelity Stats & XP Logs
router.get('/stats', authenticate, ctrl.getStats);

export default router;
