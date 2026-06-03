import { Router } from 'express';
import { authenticate, optionalAuth } from '../middleware/auth';
import { checkCredits } from '../middleware/credits';
import * as ctrl from '../controllers/tutorials.controller';

const router = Router();

// Public browsing (with optional auth to capture progress for logged-in users)
router.get('/',           optionalAuth, ctrl.listTutorials);
router.get('/search',     optionalAuth, ctrl.searchTutorials);
router.get('/:slug',      optionalAuth, ctrl.getTutorial);

// Authenticated actions
router.post('/',                  authenticate, ctrl.createTutorial);       // Teacher+
router.post('/:id/progress',      authenticate, ctrl.markSectionComplete);
router.post('/:id/run-code',      authenticate, checkCredits, ctrl.runCode);
router.post('/:id/behavior-events', authenticate, ctrl.createTutorialBehaviorEvent);
router.get('/:id/adaptive-guidance', authenticate, ctrl.getTutorialAdaptiveGuidance);

export default router;
