import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import logger from '../utils/logger';

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

  if (apiKey !== internalApiKey) {
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

/**
 * Service Token Verification
 * Used for verifying tokens from other microservices
 */
export interface ServiceTokenPayload {
  serviceId: string;
  serviceName: string;
  permissions: string[];
  issuedAt: number;
  expiresAt: number;
}

export const verifyServiceToken = (token: string): ServiceTokenPayload | null => {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());
    
    if (!payload.serviceId || !payload.serviceName) {
      return null;
    }

    if (payload.expiresAt && Date.now() > payload.expiresAt) {
      return null;
    }

    return payload as ServiceTokenPayload;
  } catch {
    return null;
  }
};

export const serviceTokenAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.headers['x-service-token'] as string;

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Service token required',
      code: 'MISSING_SERVICE_TOKEN',
    });
    return;
  }

  const payload = verifyServiceToken(token);
  if (!payload) {
    res.status(403).json({
      success: false,
      message: 'Invalid or expired service token',
      code: 'INVALID_SERVICE_TOKEN',
    });
    return;
  }

  req.headers['x-service-id'] = payload.serviceId;
  req.headers['x-service-name'] = payload.serviceName;
  next();
};

/**
 * Webhook Signature Verification
 * Used for payment webhooks (Stripe, etc.)
 */
export const verifyWebhookSignature = (
  payload: string,
  signature: string,
  secret: string
): boolean => {
  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');
  
  return signature === `sha256=${expectedSignature}`;
};
