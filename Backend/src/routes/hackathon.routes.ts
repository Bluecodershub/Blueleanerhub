import { Router } from 'express';
import { HackathonController } from '../controllers/hackathon.controller';
import { hackathonValidators, commonValidators } from '../utils/validators';
import { validate } from '../middleware/validate';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';

const router = Router();
const controller = new HackathonController();

// Only CORPORATE users and ADMINs may create hackathons
router.post('/', apiLimiter, authenticate, authorize('CORPORATE', 'ADMIN'), hackathonValidators.createHackathon, validate, controller.createHackathon.bind(controller));
router.get('/', apiLimiter, optionalAuth, commonValidators.pagination, validate, controller.getHackathons.bind(controller));
router.get('/hosted', apiLimiter, authenticate, controller.getHostedHackathons.bind(controller));
router.get('/:id', apiLimiter, optionalAuth, commonValidators.idParam, validate, controller.getHackathonById.bind(controller));
router.get('/:id/leaderboard', apiLimiter, commonValidators.idParam, validate, controller.getLeaderboard.bind(controller));
router.get('/:id/registrations', apiLimiter, authenticate, commonValidators.idParam, validate, controller.getRegistrations.bind(controller));
router.post('/:id/register', apiLimiter, authenticate, commonValidators.idParam, validate, controller.register.bind(controller));
router.post('/:id/pay', apiLimiter, authenticate, commonValidators.idParam, validate, controller.processPayment.bind(controller));
router.post('/:id/teams', apiLimiter, authenticate, commonValidators.idParam, validate, controller.createTeam.bind(controller));
router.post('/:id/teams/join', apiLimiter, authenticate, commonValidators.idParam, validate, controller.joinTeam.bind(controller));
router.post('/:id/submit', apiLimiter, authenticate, commonValidators.idParam, hackathonValidators.submitCode, validate, controller.submitCode.bind(controller));
router.post('/:id/run', apiLimiter, authenticate, commonValidators.idParam, hackathonValidators.runCode, validate, controller.runCode.bind(controller));
router.get('/:id/submissions', apiLimiter, authenticate, commonValidators.idParam, validate, controller.getUserSubmissions.bind(controller));
router.get('/:id/matches', apiLimiter, authenticate, commonValidators.idParam, validate, controller.getPotentialMatches.bind(controller));
router.post('/:id/teams/transfer-leadership', apiLimiter, authenticate, commonValidators.idParam, validate, controller.transferTeamLeadership.bind(controller));
router.post('/:id/behavior-events', apiLimiter, authenticate, commonValidators.idParam, hackathonValidators.behaviorEvent, validate, controller.createBehaviorEvent.bind(controller));
router.get('/:id/adaptive-guidance', apiLimiter, authenticate, commonValidators.idParam, validate, controller.getAdaptiveGuidance.bind(controller));

export default router;
