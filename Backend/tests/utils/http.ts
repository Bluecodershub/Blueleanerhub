import { Request, Response } from 'express';

type MockResponseOptions = {
  send?: boolean;
  cookies?: boolean;
};

export const mockRes = (options: MockResponseOptions = {}) => {
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  if (options.send) {
    res.send = jest.fn().mockReturnThis();
  }

  if (options.cookies) {
    res.cookie = jest.fn().mockReturnThis();
    res.clearCookie = jest.fn().mockReturnThis();
  }

  return res as Response;
};

export const mockReq = (overrides: Partial<Request> = {}): Request => ({
  body: {},
  params: {},
  query: {},
  headers: {},
  signedCookies: {},
  cookies: {},
  ip: '127.0.0.1',
  requestId: 'test-req-id',
  ...overrides,
} as unknown as Request);
