import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as ctrl from '../controllers/organizations.controller';

const router = Router();

// Organization CRUD
router.get('/',              ctrl.listOrganizations);
router.get('/:slug',         ctrl.getOrganization);
router.post('/',             authenticate, ctrl.createOrganization);

// Member management
router.post('/:id/members',  authenticate, ctrl.inviteMember);

// Talent Pool
router.get('/:id/talent',    authenticate, ctrl.listTalentPool);
router.post('/:id/talent',   authenticate, ctrl.addToTalentPool);

// Innovation Challenges
router.get('/challenges',    ctrl.listChallenges);
router.post('/:id/challenges', authenticate, ctrl.createChallenge);

export default router;

