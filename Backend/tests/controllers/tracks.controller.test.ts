import { Request, Response } from 'express';
import { listTracks, getTrack, enrollInTrack, getTrackProgress } from '../../src/controllers/tracks.controller';
import { db } from '../../src/db';
import { GamificationService } from '../../src/services/gamification.service';
import { UserRole } from '../../src/utils/jwt';

jest.mock('../../src/db');
jest.mock('../../src/services/gamification.service');
jest.mock('../../src/utils/logger');

const mockDb = db as jest.Mocked<typeof db>;
const mockGamificationService = GamificationService as jest.Mocked<typeof GamificationService>;

describe('Tracks Controller', () => {
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

  describe('listTracks', () => {
    it('should return tracks list successfully', async () => {
      const mockTracks = [
        {
          id: 1,
          title: 'Web Development Track',
          slug: 'web-development',
          domain: 'Technology',
          difficulty: 'beginner',
          isPublished: true,
          enrollmentCount: 100,
        },
      ];

      mockRequest.query = {};
      mockDb.select = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockResolvedValue(mockTracks),
          }),
        }),
      });

      await listTracks(mockRequest as Request, mockResponse as Response);

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockTracks,
      });
    });

    it('should handle database errors', async () => {
      mockRequest.query = {};
      mockDb.select = jest.fn().mockImplementation(() => {
        throw new Error('Database error');
      });

      await listTracks(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to load tracks',
      });
    });
  });

  describe('getTrack', () => {
    it('should return single track with courses and enrollment', async () => {
      const mockTrack = {
        id: 1,
        title: 'Web Development Track',
        slug: 'web-development',
        domain: 'Technology',
        difficulty: 'beginner',
        isPublished: true,
        enrollmentCount: 100,
      };

      const mockCourses = [
        {
          course: { id: 1, title: 'HTML Basics' },
          orderIndex: 1,
          isRequired: true,
        },
      ];

      const mockEnrollment = {
        id: 1,
        userId: 1,
        trackId: 1,
        progressPercentage: 25,
      };

      mockRequest.params = { slug: 'web-development' };
      mockRequest.user = { id: 1, email: 'test@example.com', fullName: 'Test User', role: 'STUDENT' as UserRole };

      mockDb.select = jest.fn()
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([mockTrack]),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            leftJoin: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnValue({
                orderBy: jest.fn().mockResolvedValue(mockCourses),
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([mockEnrollment]),
          }),
        });

      await getTrack(mockRequest as Request, mockResponse as Response);

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: {
          ...mockTrack,
          courses: mockCourses,
          enrollment: mockEnrollment,
        },
      });
    });

    it('should return 404 for non-existent track', async () => {
      mockRequest.params = { slug: 'non-existent' };
      mockDb.select = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });

      await getTrack(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Track not found',
      });
    });
  });

  describe('enrollInTrack', () => {
    it('should enroll user in track successfully', async () => {
      const mockUser: { id: number; email: string; fullName: string; role: UserRole } = { id: 1, email: 'test@example.com', fullName: 'Test User', role: 'STUDENT' };
      const mockEnrollment = { id: 1, userId: 1, trackId: 1, progressPercentage: 0 };

      mockRequest.user = mockUser;
      mockRequest.params = { id: '1' };

      mockDb.select = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });

      mockDb.insert = jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockEnrollment]),
        }),
      });

      mockDb.update = jest.fn().mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });

      mockGamificationService.awardXP = jest.fn().mockResolvedValue(undefined);

      await enrollInTrack(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockEnrollment,
      });
      expect(mockGamificationService.awardXP).toHaveBeenCalledWith(1, 10, 'TRACK_ENROLLED');
    });

    it('should return existing enrollment if already enrolled', async () => {
      const mockUser: { id: number; email: string; fullName: string; role: UserRole } = { id: 1, email: 'test@example.com', fullName: 'Test User', role: 'STUDENT' };
      const mockExistingEnrollment = { id: 1, userId: 1, trackId: 1, progressPercentage: 25 };

      mockRequest.user = mockUser;
      mockRequest.params = { id: '1' };

      mockDb.select = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockExistingEnrollment]),
        }),
      });

      await enrollInTrack(mockRequest as Request, mockResponse as Response);

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockExistingEnrollment,
        alreadyEnrolled: true,
      });
    });

    it('should return 400 for invalid track id', async () => {
      const mockUser: { id: number; email: string; fullName: string; role: UserRole } = { id: 1, email: 'test@example.com', fullName: 'Test User', role: 'STUDENT' };

      mockRequest.user = mockUser;
      mockRequest.params = { id: 'invalid' };

      await enrollInTrack(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid track id',
      });
    });
  });

  describe('getTrackProgress', () => {
    it('should return track progress for enrolled user', async () => {
      const mockUser: { id: number; email: string; fullName: string; role: UserRole } = { id: 1, email: 'test@example.com', fullName: 'Test User', role: 'STUDENT' };
      const mockEnrollment = { id: 1, userId: 1, trackId: 1, progressPercentage: 25 };

      mockRequest.user = mockUser;
      mockRequest.params = { id: '1' };

      mockDb.select = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockEnrollment]),
        }),
      });

      await getTrackProgress(mockRequest as Request, mockResponse as Response);

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockEnrollment,
      });
    });

    it('should return 404 for non-enrolled user', async () => {
      const mockUser: { id: number; email: string; fullName: string; role: UserRole } = { id: 1, email: 'test@example.com', fullName: 'Test User', role: 'STUDENT' };

      mockRequest.user = mockUser;
      mockRequest.params = { id: '1' };

      mockDb.select = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });

      await getTrackProgress(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Not enrolled',
      });
    });
  });
});