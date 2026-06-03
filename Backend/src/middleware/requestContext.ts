import { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'crypto';

const REQUEST_ID_HEADER = 'x-request-id';
const CORRELATION_ID_HEADER = 'x-correlation-id';

export const requestContext = (req: Request, res: Response, next: NextFunction) => {
  // Use incoming request ID or generate new one
  const incoming = req.header(REQUEST_ID_HEADER);
  const requestId = (incoming && incoming.trim()) || randomUUID();

  // Correlation ID tracks the entire user journey across multiple requests
  const correlationId = req.header(CORRELATION_ID_HEADER) || requestId;

  req.requestId = requestId;
  req.correlationId = correlationId;

  // Set headers on response
  res.setHeader(REQUEST_ID_HEADER, requestId);
  res.setHeader(CORRELATION_ID_HEADER, correlationId);

  next();
};
