import { Request, Response, NextFunction } from 'express';
import { body, query, param } from 'express-validator';
import logger from '../utils/logger';
import { redisClient } from '../utils/database';

// XSS Protection middleware
// Regex has no /g flag — avoids .lastIndex drift across recursive calls.
// Catches: script tags, JS protocol, SVG/iframe/object/embed,
// all on* event handlers (case-insensitive), and data: URIs in src/href.
const XSS_PATTERN = /<script[\s\S]*?>[\s\S]*?<\/script>|javascript\s*:|on[a-z]+\s*=|<\s*(iframe|object|embed|svg|math)[\s>]|data\s*:\s*[^,]*\/[^,]*,/i;

export const xssProtection = (req: Request, res: Response, next: NextFunction): void => {
  const checkXSS = (obj: any, path: string = '', visited = new Set<object>()): boolean => {
    if (typeof obj === 'string') {
      if (XSS_PATTERN.test(obj)) {
        logger.warn('XSS attempt detected:', {
          path,
          value: obj,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          url: req.originalUrl,
        });
        return true;
      }
    } else if (Array.isArray(obj)) {
      if (visited.has(obj)) return false;
      visited.add(obj);
      for (let i = 0; i < obj.length; i++) {
        if (checkXSS(obj[i], `${path}[${i}]`, visited)) {
          return true;
        }
      }
    } else if (obj && typeof obj === 'object') {
      if (visited.has(obj)) return false;
      visited.add(obj);
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (checkXSS(obj[key], path ? `${path}.${key}` : key, visited)) {
            return true;
          }
        }
      }
    }
    return false;
  };

  // Check body, query, and params for XSS
  if (checkXSS(req.body, 'body') || checkXSS(req.query, 'query') || checkXSS(req.params, 'params')) {
    res.status(400).json({
      success: false,
      message: 'Potentially malicious content detected',
    });
    return;
  }

  next();
};

// Request monitoring and anomaly detection
export const requestMonitoring = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!redisClient) return next();

  try {
    const clientId = req.ip;
    const timestamp = Date.now();
    const windowSize = 60 * 1000; // 1 minute window
    const maxRequests = 100; // Max requests per minute per IP

    const key = `req_monitor:${clientId}`;
    const requests = await redisClient.get(key);

    if (requests) {
      const requestData = JSON.parse(requests);
      const recentRequests = requestData.filter((ts: number) => timestamp - ts < windowSize);

      if (recentRequests.length >= maxRequests) {
        logger.warn('Suspicious request pattern detected:', {
          ip: clientId,
          requests: recentRequests.length,
          timeWindow: windowSize,
          url: req.originalUrl,
        });

        res.status(429).json({
          success: false,
          message: 'Request pattern anomaly detected',
        });
        return;
      }

      recentRequests.push(timestamp);
      await redisClient.setex(key, 300, JSON.stringify(recentRequests));
    } else {
      await redisClient.setex(key, 300, JSON.stringify([timestamp]));
    }

    next();
  } catch (error) {
    logger.error('Request monitoring error:', error);
    next();
  }
};

// Module-level constants — no /g flag to avoid .lastIndex state leaking between requests.
// Note: "base64" is intentionally omitted — far too many false positives on a learning
// platform (code examples, file previews, etc.). The XSS middleware already catches
// the dangerous subset of base64 (data: URIs in src/href attributes).
const SUSPICIOUS_PATTERNS = [
  /\.\.\//i,        // directory traversal
  /%2e%2e%2f/i,     // URL-encoded directory traversal
  /etc\/passwd/i,   // system file access
  /cmd\.exe/i,      // command execution
  /powershell\s+-/i, // PowerShell with flags (avoids matching the word in tutorials)
  /<\?php/i,        // PHP injection
];

// Suspicious activity detection
export const suspiciousActivityDetection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const requestString = JSON.stringify({
      url: req.originalUrl,
      query: req.query,
      body: req.body,
      headers: req.headers,
    });

    const matchedPatterns = SUSPICIOUS_PATTERNS.filter(pattern => pattern.test(requestString));

    if (matchedPatterns.length > 0) {
      logger.error('Suspicious activity detected:', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
        method: req.method,
        patterns: matchedPatterns.map(p => p.source),
        user: req.user?.id || 'anonymous',
      });

      if (redisClient) {
        const suspiciousKey = `suspicious:${req.ip}`;
        await redisClient.incr(suspiciousKey);
        await redisClient.expire(suspiciousKey, 3600);
      }

      res.status(400).json({
        success: false,
        message: 'Request blocked for security reasons',
      });
      return;
    }

    next();
  } catch (error) {
    logger.error('Suspicious activity detection error:', error);
    next();
  }
};

// Common validation rules
export const commonValidation = {
  id: param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer'),

  email: body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),

  password: body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),

  name: body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters')
    .matches(/^[a-zA-Z\s.'-]+$/)
    .withMessage('Name contains invalid characters'),

  page: query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  limit: query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),

  search: query('q').optional().isLength({ max: 100 }).withMessage('Search query too long'),

  fileSize: (maxSize: number) =>
    body('file').custom((_value, { req }) => {
      if (req.file && req.file.size > maxSize) {
        throw new Error(`File size exceeds ${maxSize} bytes`);
      }
      return true;
    }),
};

// IP whitelist/blacklist middleware
export const ipFilter = (whitelist?: string[], blacklist?: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const clientIP = req.ip || '';

    if (blacklist && blacklist.includes(clientIP)) {
      logger.warn('Blocked request from blacklisted IP:', { ip: clientIP });
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    if (whitelist && whitelist.length > 0 && !whitelist.includes(clientIP)) {
      logger.warn('Blocked request from non-whitelisted IP:', { ip: clientIP });
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    next();
  };
};
