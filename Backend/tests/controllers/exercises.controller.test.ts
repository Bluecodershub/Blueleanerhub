import { Request, Response } from 'express';
import { listExercises, getExercise } from '../../src/controllers/exercises.controller';
import { db } from '../../src/db';

jest.mock('../../src/db');
jest.mock('../../src/utils/logger');

const mockDb = db as jest.Mocked<typeof db>;

describe('Exercises Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    mockResponse = {
      json: jsonMock,
      status: statusMock,
    };
    mockRequest = {};
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('listExercises', () => {
    it('should return exercises list successfully', async () => {
      const mockRows = [
        {
          id: 1,
          title: 'Basic Programming Quiz',
          difficulty: 1,
          moduleTitle: 'Introduction to Programming',
          courseTitle: 'Computer Science Basics',
          domainName: 'Technology',
          domainType: 'TECHNICAL',
          specializationName: 'Software Development',
        },
      ];

      mockRequest.query = { page: '1', limit: '20' };
      mockDb.select = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            innerJoin: jest.fn().mockReturnValue({
              innerJoin: jest.fn().mockReturnValue({
                innerJoin: jest.fn().mockReturnValue({
                  where: jest.fn().mockReturnValue({
                    orderBy: jest.fn().mockReturnValue({
                      limit: jest.fn().mockReturnValue({
                        offset: jest.fn().mockResolvedValue(mockRows),
                      }),
                    }),
                  }),
                }),
              }),
            }),
          }),
        }),
      });

      await listExercises(mockRequest as Request, mockResponse as Response);

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: [
          {
            id: '1',
            title: 'Basic Programming Quiz',
            domain: 'Technology',
            subDomain: 'Software Development',
            difficulty: 'Easy',
            points: 30,
            successRate: null,
            solved: false,
          },
        ],
        meta: { page: 1, limit: 20, total: 1 },
      });
    });

    it('should handle database errors', async () => {
      mockRequest.query = { page: '1', limit: '20' };
      mockDb.select = jest.fn().mockImplementation(() => {
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
    it('should return single exercise with questions', async () => {
      const mockQuiz = {
        id: 1,
        title: 'Basic Programming Quiz',
        difficulty: 1,
      };

      const mockQuestions = [
        {
          id: 1,
          quizId: 1,
          question: 'What is a variable?',
          options: ['A storage location', 'A function', 'A loop'],
          correctAnswer: 0,
          explanation: 'Variables store data',
        },
      ];

      mockRequest.params = { id: '1' };
      mockDb.select = jest.fn()
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([mockQuiz]),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue(mockQuestions),
          }),
        });

      await getExercise(mockRequest as Request, mockResponse as Response);

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: {
          ...mockQuiz,
          difficulty: 'Easy',
          points: 30,
          questions: [
            {
              id: 1,
              quizId: 1,
              question: 'What is a variable?',
              options: ['A storage location', 'A function', 'A loop'],
              explanation: 'Variables store data',
            },
          ],
        },
      });
    });

    it('should return 400 for invalid exercise id', async () => {
      mockRequest.params = { id: 'invalid' };

      await getExercise(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid exercise id',
      });
    });

    it('should return 404 for non-existent exercise', async () => {
      mockRequest.params = { id: '999' };
      mockDb.select = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
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