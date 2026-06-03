import { Request, Response } from 'express';
import { getMyCertificates, verifyCertificate } from '../../src/controllers/certificates.controller';
import { db } from '../../src/db';
import { certificates } from '../../src/db/schema-v2';

// Mock dependencies
jest.mock('../../src/db');
jest.mock('../../src/db/schema-v2');
jest.mock('../../src/utils/logger');

const mockDb = db as jest.Mocked<typeof db>;

describe('Certificates Controller', () => {
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

  describe('getMyCertificates', () => {
    it('should return user certificates successfully', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        fullName: 'Test User',
        role: 'STUDENT' as const,
      };
      const mockCertificates = [
        {
          id: 'cert1',
          userId: 'user123',
          title: 'Course Completion',
          issuedAt: new Date(),
        },
      ];

      mockRequest.user = mockUser;
      mockDb.select = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockResolvedValue(mockCertificates),
          }),
        }),
      });

      await getMyCertificates(mockRequest as Request, mockResponse as Response);

      expect(mockDb.select).toHaveBeenCalled();
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockCertificates,
      });
    });

    it('should handle database errors', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        fullName: 'Test User',
        role: 'STUDENT' as const,
      };
      mockRequest.user = mockUser;

      mockDb.select = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockRejectedValue(new Error('DB Error')),
          }),
        }),
      });

      await getMyCertificates(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to load certificates',
      });
    });
  });

  describe('verifyCertificate', () => {
    it('should verify a valid certificate', async () => {
      const mockCertificate = {
        cert: {
          credentialId: 'cred123',
          title: 'Course Completion',
          issuedFor: 'user123',
          issuerName: 'BlueLearner',
          recipientName: 'Test User',
          issuedAt: new Date(),
          expiresAt: null,
        },
        recipientName: 'Test User',
      };

      mockRequest.params = { credentialId: 'cred123' };
      mockDb.select = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          leftJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([mockCertificate]),
          }),
        }),
      });

      await verifyCertificate(mockRequest as Request, mockResponse as Response);

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        valid: true,
        data: {
          credentialId: 'cred123',
          title: 'Course Completion',
          issuedFor: 'user123',
          issuerName: 'BlueLearner',
          recipientName: 'Test User',
          issuedAt: mockCertificate.cert.issuedAt,
          expiresAt: null,
          status: 'valid',
        },
      });
    });

    it('should return 404 for non-existent certificate', async () => {
      mockRequest.params = { credentialId: 'nonexistent' };
      mockDb.select = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          leftJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      await verifyCertificate(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        valid: false,
        message: 'Certificate not found or invalid credential ID',
      });
    });
  });
});