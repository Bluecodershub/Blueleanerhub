import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { listExercises, getExercise } from '../../src/controllers/exercises.controller';
import { Exercise } from '../../src/db/models';

jest.mock('../../src/db/models', () => ({
  Exercise: {
    find: jest.fn(),
    countDocuments: jest.fn(),
    findById: jest.fn(),
  },
}));
jest.mock('../../src/utils/logger');

const mockExercise = Exercise as jest.Mocked<typeof Exercise>;

const chain = (value: unknown) => ({
  sort: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  lean: jest.fn().mockResolvedValue(value),
});

describe('Exercises Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnThis();
    mockResponse = {
      json: jsonMock,
      status: statusMock,
    };
    mockRequest = {};
  });

  describe('listExercises', () => {
    it('returns exercises list successfully', async () => {
      const id = new mongoose.Types.ObjectId();
      const rows = [
        {
          _id: id,
          title: 'Basic Programming Quiz',
          category: 'Technology',
          tags: ['Software Development'],
          difficulty: 'EASY',
        },
      ];

      mockRequest.query = { page: '1', limit: '20' };
      (mockExercise.find as jest.Mock).mockReturnValue(chain(rows));
      (mockExercise.countDocuments as jest.Mock).mockResolvedValue(1);

      await listExercises(mockRequest as Request, mockResponse as Response);

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: [
          {
            id: String(id),
            title: 'Basic Programming Quiz',
            domain: 'Technology',
            subDomain: 'Software Development',
            difficulty: 'EASY',
            points: 30,
            successRate: null,
            solved: false,
          },
        ],
        meta: { page: 1, limit: 20, total: 1 },
      });
    });

    it('handles database errors', async () => {
      mockRequest.query = { page: '1', limit: '20' };
      (mockExercise.find as jest.Mock).mockImplementation(() => {
        throw new Error('Database error');
      });

      await listExercises(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to load exercises',
      });
    });
  });

  describe('getExercise', () => {
    it('returns a single exercise without solution', async () => {
      const id = new mongoose.Types.ObjectId();
      const exercise = {
        _id: id,
        title: 'Basic Programming Quiz',
        difficulty: 'EASY',
        solution: 'hidden',
      };

      mockRequest.params = { id: String(id) };
      (mockExercise.findById as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(exercise),
      });

      await getExercise(mockRequest as Request, mockResponse as Response);

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: {
          _id: id,
          title: 'Basic Programming Quiz',
          difficulty: 'EASY',
          id: String(id),
          points: 30,
        },
      });
    });

    it('returns 400 for invalid exercise id', async () => {
      mockRequest.params = { id: 'invalid' };

      await getExercise(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid exercise id',
      });
    });

    it('returns 404 for non-existent exercise', async () => {
      const id = new mongoose.Types.ObjectId().toHexString();
      mockRequest.params = { id };
      (mockExercise.findById as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      await getExercise(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Exercise not found',
      });
    });
  });
});
