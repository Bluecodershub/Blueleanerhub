import { Router } from 'express';
import {
  reportError,
  getErrorStats,
  cleanupOldErrors,
  errorReportValidation
} from '../controllers/errors';
import { validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import { apiLimiter, strictLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

/**
 * @route   POST /api/errors/report
 * @desc    Report frontend errors
 * @access  Public (but with rate limiting)
 */
router.post(
  '/report',
  apiLimiter,
  errorReportValidation,
  validate,
  reportError
);

/**
 * @route   GET /api/errors/stats
 * @desc    Get error statistics
 * @access  Admin only (operational data must not be exposed to all users)
 */
router.get(
  '/stats',
  authenticate,
  authorize('ADMIN'),
  getErrorStats
);

/**
 * @route   DELETE /api/errors/cleanup
 * @desc    Clean up old error logs
 * @access  Admin only (purging logs is an audit-sensitive operation)
 */
router.delete(
  '/cleanup',
  authenticate,
  authorize('ADMIN'),
  strictLimiter,
  cleanupOldErrors
);

export default router;