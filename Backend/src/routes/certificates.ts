import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as ctrl from '../controllers/certificates.controller';

const router = Router();

router.get('/me',                  authenticate, ctrl.getMyCertificates);
router.get('/verify/:credentialId',              ctrl.verifyCertificate);   // Public
router.post('/issue',              authenticate, authorize('ADMIN', 'MENTOR'), ctrl.issueCertificate);

export default router;
