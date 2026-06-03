import { Router } from 'express';
import { JobController } from '../controllers/job.controller';
import { jobValidators, commonValidators } from '../utils/validators';
import { validate } from '../middleware/validate';
import { authenticate, optionalAuth } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';

const router = Router();
const controller = new JobController();

router.get('/', apiLimiter, optionalAuth, commonValidators.pagination, validate, controller.getJobs.bind(controller));
router.get('/:id', apiLimiter, optionalAuth, commonValidators.idParam, validate, controller.getJobById.bind(controller));

router.post('/:id/apply', apiLimiter, authenticate, commonValidators.idParam, jobValidators.apply, validate, controller.applyForJob.bind(controller));
router.get('/applications/me', apiLimiter, authenticate, controller.getUserApplications.bind(controller));

router.post('/', apiLimiter, authenticate, jobValidators.createJob, validate, controller.createJob.bind(controller));
router.get('/:id/candidates', apiLimiter, authenticate, commonValidators.idParam, validate, controller.getCandidates.bind(controller));
router.post('/:id/rank', apiLimiter, authenticate, commonValidators.idParam, validate, controller.rankCandidates.bind(controller));

export default router;
