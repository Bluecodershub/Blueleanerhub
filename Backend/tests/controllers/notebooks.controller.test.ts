// @ts-nocheck
import axios from 'axios';
import mongoose from 'mongoose';
import * as notebooksController from '@/controllers/notebooks.controller';
import { Notebook } from '@/db/models';

jest.mock('axios');
jest.mock('@/db/models', () => ({
  Notebook: {
    findOne: jest.fn(),
  },
}));

describe('Notebooks Controller hardening', () => {
  const mockedAxios = axios as jest.Mocked<typeof axios>;
  const mockedNotebook = Notebook as jest.Mocked<typeof Notebook>;

  const makeRes = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
  } as any);

  beforeEach(() => {
    jest.clearAllMocks();
    (mockedAxios.isAxiosError as jest.Mock).mockReturnValue(true);
  });

  describe('getNotebooksHealth', () => {
    it('proxies health response and forwards request ids', async () => {
      const req: any = {
        requestId: 'req-123',
        user: { id: new mongoose.Types.ObjectId().toHexString() },
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
      const req: any = {
        requestId: 'req-timeout',
        user: { id: new mongoose.Types.ObjectId().toHexString() },
      };
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
      const notebookId = new mongoose.Types.ObjectId().toHexString();
      const userId = new mongoose.Types.ObjectId().toHexString();
      const req: any = {
        requestId: 'chat-timeout-1',
        user: { id: userId },
        params: { id: notebookId },
        body: { message: 'Summarize this' },
      };
      const res = makeRes();

      mockedNotebook.findOne.mockReturnValueOnce({
        lean: jest.fn().mockResolvedValue({ _id: notebookId, title: 'Notebook' }),
      } as any);
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
      const notebookId = new mongoose.Types.ObjectId().toHexString();
      const userId = new mongoose.Types.ObjectId().toHexString();
      const req: any = {
        requestId: 'gen-timeout-1',
        user: { id: userId },
        params: { id: notebookId },
        body: { type: 'summary' },
      };
      const res = makeRes();

      mockedNotebook.findOne.mockReturnValueOnce({
        lean: jest.fn().mockResolvedValue({ _id: notebookId, title: 'Notebook' }),
      } as any);
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
