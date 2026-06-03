/// <reference types="express" />

/**
 * Extends Express's Request interface globally so req.user and req.requestId
 * are fully typed across all controllers and middleware without (req as any) casts.
 *
 * Compatible with Express v5 + @types/express v5
 */
declare global {
  namespace Express {
    interface Request {
      /**
       * Set by requestContext middleware — unique ID for log correlation.
       * Always present after requestContext middleware runs.
       */
      requestId?: string;

      /**
       * Alias for requestId — legacy name.
       * @deprecated Use requestId instead
       */
      correlationId?: string;

      /**
       * Express Session ID (set by express-session if used).
       */
      sessionID?: string;

      /**
       * Request timestamp for performance tracking
       */
      requestTime?: Date;
    }
  }
}

/**
 * Helper type for route params (cast req.params to this).
 * Express v5 @types/express uses ParamsDictionary with string | string[] values.
 * This app only uses singular string params, so we override per-route.
 */
export type RouteParams = Record<string, string>;

export {};
