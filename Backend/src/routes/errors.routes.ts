import { Router } from 'express';
import {
  reportError,
  getErrorStats,
  cleanupOldErrors,
  errorReportValidation
} from '../controllers/errors';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
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
 * @desc    Get error statistics (authenticated users)
 * @access  Authenticated
 */
router.get(
  '/stats',
  authenticate,
  getErrorStats
);

/**
 * @route   DELETE /api/errors/cleanup
 * @desc    Clean up old error logs
 * @access  Authenticated
 */
router.delete(
  '/cleanup',
  authenticate,
  strictLimiter,
  cleanupOldErrors
);

export default router;