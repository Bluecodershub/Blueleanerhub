import { Request, Response, NextFunction } from 'express';
import { timingSafeEqual } from 'crypto';
import { config } from '../config';
import logger from '../utils/logger';

/** Constant-time string comparison that is safe against length leaks. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * Internal API Key Authentication
 * Used for service-to-service communication (Backend-to-Backend)
 */
export const internalApiKeyAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const apiKey = req.headers['x-internal-api-key'] as string;
  const internalApiKey = config.internalApiKey;

  if (!internalApiKey) {
    // Fail CLOSED in production: an unconfigured key must never expose the
    // internal/service API (user CRUD, role changes, bulk ban, data export).
    if (config.nodeEnv === 'production') {
      logger.error('INTERNAL_API_KEY not configured — rejecting internal API request in production');
      res.status(500).json({
        success: false,
        message: 'Service misconfigured',
        code: 'INTERNAL_API_KEY_MISSING',
      });
      return;
    }
    logger.warn('INTERNAL_API_KEY not configured - allowing request in development');
    return next();
  }

  if (!apiKey) {
    res.status(401).json({
      success: false,
      message: 'Internal API key required',
      code: 'MISSING_API_KEY',
    });
    return;
  }

  if (!safeEqual(apiKey, internalApiKey)) {
    logger.warn(`Invalid internal API key attempt from IP: ${req.ip}`);
    res.status(403).json({
      success: false,
      message: 'Invalid internal API key',
      code: 'INVALID_API_KEY',
    });
    return;
  }

  next();
};
