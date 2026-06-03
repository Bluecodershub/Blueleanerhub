/**
 * Re-export shim — AppError and all error classes live in error.middleware.ts.
 * This file exists so legacy imports (`from '../middleware/error'`) keep working.
 * Import directly from './error.middleware' in new code.
 */
export {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  errorHandler,
  notFound,
  asyncHandler,
} from './error.middleware';
