import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import logger from '../utils/logger';
import { config } from '../config';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this);
  }
}

// Validation Error
export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed') {
    super(message, 400);
  }
}

// Authentication Error
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401);
  }
}

// Authorization Error
export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403);
  }
}

// Not Found Error
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

// Conflict Error
export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409);
  }
}

// Rate Limit Error
export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429);
  }
}

export const errorHandler: ErrorRequestHandler = (err: any, req: Request, res: Response, _next: NextFunction): void => {
  let error = { ...err };
  error.message = err.message;

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new NotFoundError(message);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new ConflictError(message);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val: any) => val.message).join(', ');
    error = new ValidationError(message);
  }

  // Database connection errors (pg-pool AggregateError / ECONNREFUSED)
  if (err.code === 'ECONNREFUSED' || err.name === 'AggregateError' ||
      (err.errors && err.errors[0]?.code === 'ECONNREFUSED')) {
    error = new AppError('Service temporarily unavailable. Please try again shortly.', 503);
  }

  // PostgreSQL errors
  if (err.code) {
    switch (err.code) {
      case '23505': // Unique violation
        error = new ConflictError('Resource already exists');
        break;
      case '23502': // Not null violation
        error = new ValidationError('Required field is missing');
        break;
      case '23503': // Foreign key violation
        error = new ValidationError('Referenced resource does not exist');
        break;
      case '42P01': // Undefined table
        error = new AppError('Database table not found — run migrations first', 500);
        break;
    }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new AuthenticationError('Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    error = new AuthenticationError('Token expired');
  }

  // Rate limiting errors
  if (err.type === 'entity.too.large') {
    error = new ValidationError('File too large');
  }

  // Log error for debugging
  const logData = {
    error: {
      name: err.name,
      message: err.message,
      stack: config.nodeEnv === 'development' ? err.stack : undefined,
    },
    request: {
      requestId: req.requestId,
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      user: req.user?.id || 'anonymous',
    },
    timestamp: new Date().toISOString(),
  };

  if (error.statusCode >= 500) {
    logger.error('Server Error:', logData);
  } else if (error.statusCode >= 400) {
    logger.warn('Client Error:', logData);
  }

  // Send error response — never expose internals outside localhost
  const isLocal = config.nodeEnv === 'development' && (req.ip === '127.0.0.1' || req.ip === '::1');
  const responseError: Record<string, unknown> = {
    success: false,
    message: error.statusCode < 500 ? error.message : 'An internal error occurred',
    requestId: req.requestId,
  };
  if (isLocal) {
    responseError.detail = error.message;
    responseError.stack  = err.stack;
  }

  res.status(error.statusCode || 500).json(responseError);
}

export function notFound(req: Request, res: Response) {
  const message = `Route ${req.originalUrl} not found`;
  
  logger.warn('Route not found:', {
    requestId: req.requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  res.status(404).json({
    success: false,
    message,
    requestId: req.requestId,
  });
}

// Async error handler wrapper
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
