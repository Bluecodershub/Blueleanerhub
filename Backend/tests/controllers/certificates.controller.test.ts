import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { getMyCertificates, verifyCertificate } from '../../src/controllers/certificates.controller';
import { Certificate } from '../../src/db/models';

jest.mock('../../src/db/models', () => ({
  Certificate: {
    find: jest.fn(),
    findOne: jest.fn(),
  },
  User: {},
}));
jest.mock('../../src/utils/logger');

const mockCertificate = Certificate as jest.Mocked<typeof Certificate>;

describe('Certificates Controller', () => {
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

  describe('getMyCertificates', () => {
    it('returns user certificates successfully', async () => {
      const userId = new mongoose.Types.ObjectId().toHexString();
      const certs = [
        {
          _id: new mongoose.Types.ObjectId(),
          userId,
          title: 'Course Completion',
          issuedAt: new Date(),
        },
      ];

      mockRequest.user = { id: userId, email: 'test@example.com', fullName: 'Test User', role: 'STUDENT' };
      (mockCertificate.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(certs),
      });

      await getMyCertificates(mockRequest as Request, mockResponse as Response);

      expect(mockCertificate.find).toHaveBeenCalledWith({
        userId: expect.any(mongoose.Types.ObjectId),
      });
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: certs,
      });
    });

    it('handles database errors', async () => {
      const userId = new mongoose.Types.ObjectId().toHexString();
      mockRequest.user = { id: userId, email: 'test@example.com', fullName: 'Test User', role: 'STUDENT' };
      (mockCertificate.find as jest.Mock).mockImplementation(() => {
        throw new Error('DB Error');
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
    it('verifies a valid certificate', async () => {
      const issuedAt = new Date();
      const cert = {
        verificationCode: 'cred123',
        title: 'Course Completion',
        userId: { fullName: 'Test User' },
        issuedAt,
        expiresAt: null,
      };

      mockRequest.params = { credentialId: 'cred123' };
      (mockCertificate.findOne as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(cert),
      });

      await verifyCertificate(mockRequest as Request, mockResponse as Response);

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        valid: true,
        data: {
          credentialId: 'cred123',
          title: 'Course Completion',
          issuedFor: 'Course Completion',
          issuerName: 'BluelearnerHub',
          recipientName: 'Test User',
          issuedAt,
          expiresAt: null,
          status: 'valid',
        },
      });
    });

    it('returns 404 for non-existent certificate', async () => {
      mockRequest.params = { credentialId: 'nonexistent' };
      (mockCertificate.findOne as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(null),
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
