import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { UserRole } from '../../src/utils/jwt';

jest.mock('../../src/db', () => ({
  __esModule: true,
  LearningTrack: {
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  },
  TrackCourse: {
    find: jest.fn(),
  },
  TrackEnrollment: {
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    create: jest.fn(),
  },
  Course: {
    find: jest.fn(),
  },
  Certificate: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('../../src/services/gamification.service', () => ({
  __esModule: true,
  GamificationService: {
    awardXP: jest.fn(),
  },
}));

jest.mock('../../src/utils/logger', () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    info: jest.fn(),
  },
}));

import { LearningTrack, TrackCourse, TrackEnrollment, Course } from '../../src/db';
import { GamificationService } from '../../src/services/gamification.service';
import { listTracks, getTrack, enrollInTrack, getTrackProgress } from '../../src/controllers/tracks.controller';

jest.setTimeout(30000);

let mockLearningTrack: {
  find: jest.Mock;
  findOne: jest.Mock;
  findById: jest.Mock;
  findByIdAndUpdate: jest.Mock;
};
let mockTrackCourse: {
  find: jest.Mock;
};
let mockTrackEnrollment: {
  findOne: jest.Mock;
  create: jest.Mock;
};
let mockCourse: {
  find: jest.Mock;
};
let mockAwardXP: jest.Mock;

const chain = (value: unknown) => ({
  sort: jest.fn().mockReturnThis(),
  lean: jest.fn().mockResolvedValue(value),
});

describe('Tracks Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockLearningTrack = {
      find: LearningTrack.find as jest.Mock,
      findOne: LearningTrack.findOne as jest.Mock,
      findById: LearningTrack.findById as jest.Mock,
      findByIdAndUpdate: LearningTrack.findByIdAndUpdate as jest.Mock,
    };
    mockTrackCourse = {
      find: TrackCourse.find as jest.Mock,
    };
    mockTrackEnrollment = {
      findOne: TrackEnrollment.findOne as jest.Mock,
      create: TrackEnrollment.create as jest.Mock,
    };
    mockCourse = {
      find: Course.find as jest.Mock,
    };
    mockAwardXP = GamificationService.awardXP as jest.Mock;
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnThis();
    mockResponse = {
      json: jsonMock,
      status: statusMock,
    };
    mockRequest = {};
  });

  describe('listTracks', () => {
    it('returns tracks list successfully', async () => {
      const mockTracks = [
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'Web Development Track',
          slug: 'web-development',
          domain: 'Technology',
          difficulty: 'beginner',
          isPublished: true,
          enrollmentCount: 100,
        },
      ];

      mockRequest.query = {};
      mockLearningTrack.find.mockReturnValue(chain(mockTracks));

      await listTracks(mockRequest as Request, mockResponse as Response);

      expect(mockLearningTrack.find).toHaveBeenCalledWith({ isPublished: true });
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockTracks,
      });
    });

    it('handles database errors', async () => {
      mockRequest.query = {};
      mockLearningTrack.find.mockImplementation(() => {
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
    it('returns single track with courses and enrollment', async () => {
      const trackId = new mongoose.Types.ObjectId();
      const courseId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId().toHexString();
      const mockTrack = {
        _id: trackId,
        title: 'Web Development Track',
        slug: 'web-development',
        domain: 'Technology',
        difficulty: 'beginner',
        isPublished: true,
        enrollmentCount: 100,
      };
      const trackCourses = [{ courseId, orderIndex: 1, isRequired: true }];
      const courses = [{ _id: courseId, title: 'HTML Basics' }];
      const enrollment = { _id: new mongoose.Types.ObjectId(), userId, trackId };

      mockRequest.params = { slug: 'web-development' };
      mockRequest.user = { id: userId, email: 'test@example.com', fullName: 'Test User', role: 'STUDENT' as UserRole };

      mockLearningTrack.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockTrack) });
      mockTrackCourse.find.mockReturnValue(chain(trackCourses));
      mockCourse.find.mockReturnValue({ lean: jest.fn().mockResolvedValue(courses) });
      mockTrackEnrollment.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(enrollment) });

      await getTrack(mockRequest as Request, mockResponse as Response);

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: {
          ...mockTrack,
          courses: [{ course: courses[0], orderIndex: 1, isRequired: true }],
          enrollment,
        },
      });
    });

    it('returns 404 for non-existent track', async () => {
      mockRequest.params = { slug: 'non-existent' };
      mockLearningTrack.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });

      await getTrack(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Track not found',
      });
    });
  });

  describe('enrollInTrack', () => {
    it('enrolls user in track successfully', async () => {
      const userId = new mongoose.Types.ObjectId().toHexString();
      const trackId = new mongoose.Types.ObjectId().toHexString();
      const mockUser = { id: userId, email: 'test@example.com', fullName: 'Test User', role: 'STUDENT' as UserRole };
      const enrollment = { _id: new mongoose.Types.ObjectId(), userId, trackId, progressPercentage: 0 };

      mockRequest.user = mockUser;
      mockRequest.params = { id: trackId };

      mockLearningTrack.findById.mockReturnValue({ lean: jest.fn().mockResolvedValue({ _id: trackId }) });
      mockTrackEnrollment.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
      mockTrackEnrollment.create.mockResolvedValue(enrollment);
      mockLearningTrack.findByIdAndUpdate.mockResolvedValue({});
      mockAwardXP.mockResolvedValue(undefined);

      await enrollInTrack(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: enrollment,
      });
      expect(mockAwardXP).toHaveBeenCalledWith(userId, 10, 'TRACK_ENROLLED');
    });

    it('returns existing enrollment if already enrolled', async () => {
      const userId = new mongoose.Types.ObjectId().toHexString();
      const trackId = new mongoose.Types.ObjectId().toHexString();
      const existing = { _id: new mongoose.Types.ObjectId(), userId, trackId, progressPercentage: 25 };

      mockRequest.user = { id: userId, email: 'test@example.com', fullName: 'Test User', role: 'STUDENT' as UserRole };
      mockRequest.params = { id: trackId };

      mockLearningTrack.findById.mockReturnValue({ lean: jest.fn().mockResolvedValue({ _id: trackId }) });
      mockTrackEnrollment.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(existing) });

      await enrollInTrack(mockRequest as Request, mockResponse as Response);

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: existing,
        alreadyEnrolled: true,
      });
    });

    it('returns 400 for invalid track id', async () => {
      mockRequest.user = {
        id: new mongoose.Types.ObjectId().toHexString(),
        email: 'test@example.com',
        fullName: 'Test User',
        role: 'STUDENT' as UserRole,
      };
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
    it('returns track progress for enrolled user', async () => {
      const userId = new mongoose.Types.ObjectId().toHexString();
      const trackId = new mongoose.Types.ObjectId().toHexString();
      const enrollment = { _id: new mongoose.Types.ObjectId(), userId, trackId, progressPercentage: 25 };

      mockRequest.user = { id: userId, email: 'test@example.com', fullName: 'Test User', role: 'STUDENT' as UserRole };
      mockRequest.params = { id: trackId };
      mockTrackEnrollment.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(enrollment) });

      await getTrackProgress(mockRequest as Request, mockResponse as Response);

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: enrollment,
      });
    });

    it('returns 404 for non-enrolled user', async () => {
      mockRequest.user = {
        id: new mongoose.Types.ObjectId().toHexString(),
        email: 'test@example.com',
        fullName: 'Test User',
        role: 'STUDENT' as UserRole,
      };
      mockRequest.params = { id: new mongoose.Types.ObjectId().toHexString() };
      mockTrackEnrollment.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });

      await getTrackProgress(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Not enrolled',
      });
    });
  });
});
