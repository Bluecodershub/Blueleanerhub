'use strict';
const logger = require('../utils/logger');

const INTERNAL_SECRET = process.env.INTERNAL_SERVICE_SECRET;

/**
 * Middleware that restricts routes to internal backend-to-worker calls.
 * The backend must send the shared secret in the X-Internal-Service header.
 * Falls through without blocking when the secret is not configured (dev mode).
 */
function internalAuth(req, res, next) {
  // If no secret is configured, block in production; warn loudly in dev.
  if (!INTERNAL_SECRET) {
    if (process.env.NODE_ENV === 'production') {
      logger.error('INTERNAL_SERVICE_SECRET is not set in production — blocking request');
      return res.status(500).json({ success: false, error: 'Service misconfigured' });
    }
    logger.warn('[internalAuth] INTERNAL_SERVICE_SECRET is not set — all requests are allowed (dev mode only). Set this secret before deploying.');
    return next();
  }

  const provided = req.headers['x-internal-service'];
  if (!provided || provided !== INTERNAL_SECRET) {
    logger.warn('Unauthorized AI service request', {
      ip: req.ip,
      url: req.originalUrl,
      hasHeader: !!provided,
    });
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  next();
}

module.exports = internalAuth;
