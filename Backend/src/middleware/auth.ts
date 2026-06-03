import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload, UserRole } from '../utils/jwt';
import { db } from '../db';
import { redisHelpers } from '../utils/database';
import logger from '../utils/logger';

const USER_CACHE_TTL = 60; // seconds

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        fullName: string;
        role: UserRole;
        domain?: string;
        level?: number;
        isActive?: boolean;
      };
    }
  }
}

function extractToken(req: Request): string | undefined {
  if (req.signedCookies?.accessToken) return req.signedCookies.accessToken;
  if (req.headers.authorization?.startsWith('Bearer ')) return req.headers.authorization.substring(7);
  return undefined;
}

async function resolveUser(token: string): Promise<Express.Request['user'] | null> {
  const decoded: TokenPayload = verifyAccessToken(token);

  const cacheKey = `user:auth:${decoded.userId}`;
  const cached = await redisHelpers.get(cacheKey);
  if (cached) return cached as Express.Request['user'];

  const result = await (db.query.users as any).findFirst({ _id: decoded.userId });
  if (!result || !result.isActive || result.isBanned) return null;

  const user: Express.Request['user'] = {
    id: String(result._id),
    email: result.email,
    fullName: result.fullName,
    role: result.role,
  };
  await redisHelpers.set(cacheKey, user, USER_CACHE_TTL);
  return user;
}

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = extractToken(req);
    if (!token) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const user = await resolveUser(token);
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid or expired token' });
      return;
    }
    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'Insufficient permissions' });
      return;
    }
    next();
  };
};

/** Evict a user's auth cache entry immediately (call after ban or deactivation). */
export async function invalidateUserAuthCache(userId: string): Promise<void> {
  await redisHelpers.clearPattern(`user:auth:${userId}`);
}

export const optionalAuth = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = extractToken(req);
    if (!token) return next();
    const user = await resolveUser(token);
    if (user) req.user = user;
    next();
  } catch {
    next();
  }
};
