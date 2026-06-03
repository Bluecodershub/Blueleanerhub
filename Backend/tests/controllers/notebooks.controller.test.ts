// @ts-nocheck
import axios from 'axios';
import * as notebooksController from '@/controllers/notebooks.controller';
import { db } from '@/db';

jest.mock('axios');
jest.mock('@/db', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    execute: jest.fn(),
  },
}));

describe('Notebooks Controller hardening', () => {
  const mockedAxios = axios as jest.Mocked<typeof axios>;
  const mockedDb = db as jest.Mocked<typeof db>;

  const makeRes = () => {
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
    };
    return res;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (mockedAxios.isAxiosError as jest.Mock).mockReturnValue(true);
  });

  describe('getNotebooksHealth', () => {
    it('proxies health response and forwards request ids', async () => {
      const req: any = {
        requestId: 'req-123',
        user: { id: 1 },
      };
      const res = makeRes();

      mockedAxios.get.mockResolvedValueOnce({
        data: { status: 'ok', service: 'ai-notebooks' },
        headers: { 'x-request-id': 'upstream-456' },
      } as any);

      await notebooksController.getNotebooksHealth(req, res);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/v1\/notebooks\/health$/),
        expect.objectContaining({
          timeout: expect.any(Number),
          headers: { 'x-request-id': 'req-123' },
        }),
      );
      expect(res.setHeader).toHaveBeenCalledWith('x-upstream-request-id', 'upstream-456');
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        requestId: 'req-123',
        upstreamRequestId: 'upstream-456',
      }));
    });

    it('returns 504 on upstream timeout', async () => {
      const req: any = { requestId: 'req-timeout', user: { id: 1 } };
      const res = makeRes();

      mockedAxios.get.mockRejectedValueOnce({
        isAxiosError: true,
        code: 'ECONNABORTED',
      });

      await notebooksController.getNotebooksHealth(req, res);

      expect(res.status).toHaveBeenCalledWith(504);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        requestId: 'req-timeout',
        error: 'AI notebooks health check timed out',
      }));
    });
  });

  describe('upstream error mapping for AI endpoints', () => {
    it('returns 504 for chat upstream timeout', async () => {
      const req: any = {
        requestId: 'chat-timeout-1',
        user: { id: 7 },
        params: { id: '99' },
        body: { message: 'Summarize this' },
      };
      const res = makeRes();

      // Ownership check
      mockedDb.select.mockImplementationOnce(() => ({
        from: () => ({ where: () => Promise.resolve([{ id: 99, title: 'Notebook' }]) }),
      }) as any);

      // Existing chat row
      mockedDb.select.mockImplementationOnce(() => ({
        from: () => ({ where: () => ({ limit: () => Promise.resolve([{ id: 1, messages: [] }]) }) }),
      }) as any);

      mockedAxios.post.mockRejectedValueOnce({
        isAxiosError: true,
        code: 'ECONNABORTED',
      });

      await notebooksController.chat(req, res);

      expect(res.status).toHaveBeenCalledWith(504);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: 'AI service timed out while answering chat',
      }));
    });

    it('returns 504 for generate upstream timeout', async () => {
      const req: any = {
        requestId: 'gen-timeout-1',
        user: { id: 7 },
        params: { id: '99' },
        body: { type: 'summary' },
      };
      const res = makeRes();

      mockedDb.select.mockImplementationOnce(() => ({
        from: () => ({ where: () => Promise.resolve([{ id: 99, title: 'Notebook' }]) }),
      }) as any);

      mockedAxios.post.mockRejectedValueOnce({
        isAxiosError: true,
        code: 'ECONNABORTED',
      });

      await notebooksController.generate(req, res);

      expect(res.status).toHaveBeenCalledWith(504);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: 'AI service timed out while generating content',
      }));
    });
  });
});
