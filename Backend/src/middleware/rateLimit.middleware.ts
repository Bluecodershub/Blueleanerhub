/**
 * Legacy re-export shim — all rate limiter definitions live in rateLimiter.ts.
 * This file is kept for backwards compatibility with any imports referencing this path.
 * Import directly from './rateLimiter' in new code.
 */
export {
  generalLimiter,
  authLimiter,
  apiLimiter,
  uploadLimiter,
  strictLimiter,
  webhookLimiter,
  passwordResetLimiter,
  notebookAiLimiter,
  notebookIngestLimiter,
} from './rateLimiter';
