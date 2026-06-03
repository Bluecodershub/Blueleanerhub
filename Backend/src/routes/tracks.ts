import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as ctrl from '../controllers/tracks.controller';

const router = Router();

router.get('/',             ctrl.listTracks);                    // Public list
router.get('/:slug',        ctrl.getTrack);                      // Public detail (enrollment state via optional auth)
router.post('/:id/enroll',  authenticate, ctrl.enrollInTrack);   // Enroll
router.get('/:id/progress',  authenticate, ctrl.getTrackProgress); // My progress
router.post('/:id/complete', authenticate, ctrl.completeTrack);    // Mark complete + issue cert

export default router;
