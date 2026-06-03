import { Router } from 'express';
import { authenticate, optionalAuth } from '../middleware/auth';
import * as ctrl from '../controllers/repositories.controller';
import { commonValidators } from '../utils/validators';
import { validate } from '../middleware/validate';

const router = Router();

router.get('/:id/files',        authenticate,                                   ctrl.getFileContent);
router.get('/:id/file',         authenticate,                                   ctrl.getFileContent);
router.get('/:username',                          ctrl.getUserRepositories);
router.get('/:username/:slug',                    ctrl.getRepository);

router.post('/',                authenticate, ctrl.createRepository);
router.post('/:id/commits',    authenticate, ctrl.createCommit);
router.get('/:id/issues',      optionalAuth, commonValidators.pagination, validate, ctrl.listIssues);
router.post('/:id/issues',     authenticate, ctrl.createIssue);
router.get('/:id/pulls',       optionalAuth, commonValidators.pagination, validate, ctrl.listPullRequests);
router.post('/:id/pulls',      authenticate, ctrl.createPullRequest);
router.post('/:id/pulls/:prId/review', authenticate, ctrl.requestAIReview);
router.post('/:id/star',       authenticate, ctrl.toggleStar);

export default router;
