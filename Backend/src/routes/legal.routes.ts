import { Router, Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { strictLimiter, apiLimiter } from '../middleware/rateLimiter';
import { db } from '../db';
import { CURRENT_POLICY_VERSION } from '../config/legal';
import logger from '../utils/logger';

const router = Router();

/**
 * POST /api/v1/legal/grievance
 * Public grievance submission (IT Rules / DPDP grievance redressal).
 * Rate-limited to deter spam; userId attached when the request is authenticated.
 */
router.post(
  '/grievance',
  strictLimiter,
  [
    body('name').trim().isLength({ min: 2, max: 120 }).withMessage('Name is required'),
    body('email').trim().isEmail().normalizeEmail().withMessage('A valid email is required'),
    body('category').isIn(['PRIVACY', 'PAYMENT', 'CONTENT', 'HARASSMENT', 'ACCOUNT', 'CERTIFICATE', 'OTHER']),
    body('subject').trim().isLength({ min: 3, max: 200 }).withMessage('Subject is required'),
    body('message').trim().isLength({ min: 10, max: 5000 }).withMessage('Please describe your grievance (min 10 characters)'),
  ],
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, category, subject, message } = req.body;
      const ticketId = `GRV-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

      // Grievances are intentionally email-keyed so guests (and parents/guardians
      // of minors) can file them without an account.
      const ticket = await db.query.grievanceTickets.create({
        ticketId,
        name,
        email,
        category,
        subject,
        message,
        status: 'OPEN',
        ipAddress: req.ip,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      logger.info('Grievance ticket created', { ticketId, category });
      res.status(201).json({
        success: true,
        message: 'Your grievance has been recorded. Our Grievance Officer will respond within 30 days.',
        data: { ticketId: ticket.ticketId, status: ticket.status },
      });
    } catch (err) {
      next(err);
    }
  },
);

// All routes below require authentication.
router.use(authenticate);

/**
 * GET /api/v1/legal/consent
 * Returns the calling user's consent history (DPDP right to access consent).
 */
router.get('/consent', apiLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const records = await db.query.consentRecords.findMany({ userId: new mongoose.Types.ObjectId(req.user!.id) });
    res.json({ success: true, data: { policyVersion: CURRENT_POLICY_VERSION, records } });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/legal/consent
 * Records a granular consent action (e.g. AI review, leaderboard display,
 * hackathon data sharing) or a withdrawal. Append-only audit trail.
 */
router.post(
  '/consent',
  apiLimiter,
  [
    body('consentType').isIn([
      'TERMS', 'PRIVACY', 'DATA_PROCESSING', 'MARKETING_COMMS', 'AI_REVIEW',
      'PLAGIARISM_CHECK', 'LEADERBOARD_DISPLAY', 'HACKATHON_DATA_SHARING',
      'GUARDIAN_CONSENT', 'ORG_VERIFICATION',
    ]),
    body('granted').isBoolean().toBoolean(),
    body('context').optional().isString().trim().isLength({ max: 120 }),
  ],
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { consentType, granted, context } = req.body;
      const record = await db.query.consentRecords.create({
        userId: new mongoose.Types.ObjectId(req.user!.id),
        consentType,
        granted,
        policyVersion: CURRENT_POLICY_VERSION,
        context: context || 'USER_ACTION',
        withdrawnAt: granted ? undefined : new Date(),
        ipAddress: req.ip,
        userAgent: req.get('user-agent') || undefined,
        createdAt: new Date(),
      });
      res.status(201).json({ success: true, data: record });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
