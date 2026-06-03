import { Router } from 'express';
import { captureLeadEmail } from '../controllers/leads.controller';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

// POST /api/leads/capture — store newsletter email (rate-limited, no auth required)
router.post('/capture', authLimiter, captureLeadEmail);

export default router;
