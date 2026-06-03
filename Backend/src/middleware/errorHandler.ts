/**
 * Re-export shim — canonical error handling lives in error.middleware.ts.
 * This file exists for backwards compatibility only.
 */
export { errorHandler, notFound, asyncHandler, AppError } from './error.middleware';
