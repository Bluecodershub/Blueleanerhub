import { Request, Response } from 'express';
import { body } from 'express-validator';
import crypto from 'crypto';
import { asyncHandler } from '../middleware/error.middleware';
import { FrontendError } from '../db/models';
import logger from '../utils/logger';

const ENABLE_FULL_PII_LOGGING = process.env.ENABLE_FULL_PII_LOGGING === 'true';
const DEFAULT_RETENTION_DAYS  = 30;
const MAX_RETENTION_DAYS      = 3650;

const pseudonymize = (value: string | null | undefined): string | null => {
  if (!value) return null;
  return crypto.createHash('sha256').update(value).digest('hex');
};

const getSinceDateForRange = (timeRange: string): { since: Date; normalizedRange: '1h' | '24h' | '7d' | '30d' } => {
  const now = Date.now();
  switch (timeRange) {
    case '1h':  return { since: new Date(now - 60 * 60 * 1000),            normalizedRange: '1h'  };
    case '7d':  return { since: new Date(now - 7  * 24 * 60 * 60 * 1000), normalizedRange: '7d'  };
    case '30d': return { since: new Date(now - 30 * 24 * 60 * 60 * 1000), normalizedRange: '30d' };
    case '24h':
    default:    return { since: new Date(now - 24 * 60 * 60 * 1000),       normalizedRange: '24h' };
  }
};

// Validation rules for error reports
export const errorReportValidation = [
  body('error.name').optional().isString().trim().isLength({ max: 255 }),
  body('error.message').isString().trim().isLength({ max: 2000 }),
  body('error.stack').optional().isString().trim().isLength({ max: 10000 }),
  body('errorInfo.componentStack').optional().isString().trim().isLength({ max: 5000 }),
  body('context.component').optional().isString().trim().isLength({ max: 255 }),
  body('context.level').optional().isIn(['page', 'section', 'component']),
  body('context.timestamp').isISO8601(),
  body('context.userAgent').optional().isString().trim().isLength({ max: 1000 }),
  body('context.url').optional().isURL().isLength({ max: 2000 }),
  body('errorId').optional().isString().trim().isLength({ max: 100 }),
];

/**
 * Report frontend errors to the backend
 * POST /api/errors/report
 */
export const reportError = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { error, errorInfo, context, errorId } = req.body;

  try {
    const userId    = req.user?.id    || null;
    const userEmail = req.user?.email || null;
    const ipAddress = req.ip          || null;

    const doc = await FrontendError.create({
      errorId:        errorId || `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      errorName:      error?.name    || 'Unknown Error',
      errorMessage:   error?.message || 'No error message provided',
      errorStack:     error?.stack   || undefined,
      componentStack: errorInfo?.componentStack || undefined,
      componentName:  context?.component        || undefined,
      errorLevel:     context?.level            || 'unknown',
      url:            context?.url              || undefined,
      userAgent:      context?.userAgent        || req.get('User-Agent') || undefined,
      userId:         userId  || undefined,
      userEmail:      ENABLE_FULL_PII_LOGGING ? (userEmail || undefined) : undefined,
      ipAddress:      ENABLE_FULL_PII_LOGGING ? (ipAddress || undefined) : undefined,
      sessionId:      (req as any).sessionID    || undefined,
      metadata: {
        referer:  req.get('Referer'),
        origin:   req.get('Origin'),
        headers: {
          'accept-language': req.get('Accept-Language'),
          'accept-encoding': req.get('Accept-Encoding'),
        },
        piiMode:        ENABLE_FULL_PII_LOGGING ? 'full' : 'pseudonymized',
        userEmailHash:  pseudonymize(userEmail),
        ipAddressHash:  pseudonymize(ipAddress),
        context,
      },
    });

    const logLevel = doc.errorLevel === 'page' ? 'error' : 'warn';
    logger.log(logLevel, 'Frontend error reported:', {
      errorId:   doc.errorId,
      component: doc.componentName,
      level:     doc.errorLevel,
      message:   doc.errorMessage,
      userId:    userId || 'anonymous',
      url:       doc.url,
    });

    await checkErrorPatterns(doc.errorMessage);

    if (doc.errorLevel === 'page') {
      logger.error('Critical page error detected:', {
        errorId:   doc.errorId,
        component: doc.componentName,
        url:       doc.url,
        message:   doc.errorMessage,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Error reported successfully',
      data: { errorId: doc.errorId, reportId: doc._id },
    });
  } catch (err) {
    logger.error('Failed to save frontend error report:', err);
    logger.error('Original frontend error (fallback logging):', {
      error, errorInfo, context, user: req.user?.id || 'anonymous',
    });
    res.status(500).json({ success: false, message: 'Failed to process error report' });
  }
});

/**
 * Get error statistics and patterns
 * GET /api/errors/stats
 */
export const getErrorStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const requestedRange = req.query.range as string || '24h';
  const { since, normalizedRange } = getSinceDateForRange(requestedRange);

  try {
    const [total, byLevel, topErrors, byComponent, overTime] = await Promise.all([
      FrontendError.countDocuments({ createdAt: { $gte: since } }),

      FrontendError.aggregate([
        { $match:   { createdAt: { $gte: since } } },
        { $group:   { _id: '$errorLevel', count: { $sum: 1 } } },
        { $sort:    { count: -1 } },
        { $project: { error_level: '$_id', count: 1, _id: 0 } },
      ]),

      FrontendError.aggregate([
        { $match:   { createdAt: { $gte: since } } },
        { $group:   { _id: { name: '$errorName', msg: '$errorMessage' }, count: { $sum: 1 } } },
        { $sort:    { count: -1 } },
        { $limit:   10 },
        { $project: { error_name: '$_id.name', error_message: '$_id.msg', count: 1, _id: 0 } },
      ]),

      FrontendError.aggregate([
        { $match:   { createdAt: { $gte: since }, componentName: { $ne: null } } },
        { $group:   { _id: '$componentName', count: { $sum: 1 } } },
        { $sort:    { count: -1 } },
        { $limit:   10 },
        { $project: { component_name: '$_id', count: 1, _id: 0 } },
      ]),

      // Hourly buckets via $dateToString (compatible with MongoDB 4.x+)
      FrontendError.aggregate([
        { $match:   { createdAt: { $gte: since } } },
        { $group:   { _id: { $dateToString: { format: '%Y-%m-%dT%H:00:00', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort:    { _id: -1 } },
        { $limit:   24 },
        { $project: { hour: '$_id', count: 1, _id: 0 } },
      ]),
    ]);

    res.json({
      success: true,
      data: { total, byLevel, topErrors, byComponent, overTime, timeRange: normalizedRange },
    });
  } catch (err) {
    logger.error('Failed to fetch error stats:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch error stats' });
  }
});

async function checkErrorPatterns(errorMessage: string) {
  try {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    const count = await FrontendError.countDocuments({ errorMessage, createdAt: { $gte: fiveMinAgo } });
    if (count >= 5) {
      logger.error('Frontend error spike detected:', { errorMessage, count, timeWindow: '5 minutes' });
    }
  } catch (err) {
    logger.error('Error pattern analysis failed:', err);
  }
}

/**
 * Clear old error logs (cleanup job)
 * DELETE /api/errors/cleanup
 */
export const cleanupOldErrors = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const parsedDays = Number.parseInt(String(req.query.days ?? DEFAULT_RETENTION_DAYS), 10);
  if (!Number.isInteger(parsedDays) || parsedDays < 1 || parsedDays > MAX_RETENTION_DAYS) {
    res.status(400).json({
      success: false,
      message: `days must be an integer between 1 and ${MAX_RETENTION_DAYS}`,
    });
    return;
  }

  try {
    const cutoff = new Date(Date.now() - parsedDays * 24 * 60 * 60 * 1000);
    const result = await FrontendError.deleteMany({ createdAt: { $lt: cutoff } });

    logger.info(`Cleaned up ${result.deletedCount} old frontend error records`);
    res.json({
      success: true,
      message: `Cleaned up ${result.deletedCount} error records older than ${parsedDays} days`,
    });
  } catch (err) {
    logger.error('Failed to cleanup old frontend errors:', err);
    res.status(500).json({ success: false, message: 'Failed to cleanup old errors' });
  }
});
