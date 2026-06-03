/**
 * Certificates Controller
 * =======================
 * Issues, verifies, and delivers certificates for course completions,
 * track completions, and hackathon wins.
 *
 * Routes:
 *   GET  /api/certificates/me                 — user's certificates
 *   GET  /api/certificates/verify/:credentialId — public verification
 *   POST /api/certificates/issue              — system issues certificate
 */

import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Certificate, User } from '../db/models';
import mongoose from 'mongoose';
import logger from '../utils/logger';

// ─── GET MY CERTIFICATES ─────────────────────────────────────────────────────

export const getMyCertificates = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const rows = await Certificate.find({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ issuedAt: -1 })
      .lean();
    res.json({ success: true, data: rows });
  } catch (err) {
    logger.error('getMyCertificates error', err);
    res.status(500).json({ success: false, message: 'Failed to load certificates' });
  }
};

// ─── PUBLIC VERIFICATION ─────────────────────────────────────────────────────

export const verifyCertificate = async (req: Request, res: Response) => {
  try {
    const verificationCode = String(req.params.credentialId);

    const cert = await Certificate.findOne({ verificationCode })
      .populate<{ userId: { fullName: string } }>('userId', 'fullName')
      .lean();

    if (!cert) {
      return res.status(404).json({
        success: false,
        valid:   false,
        message: 'Certificate not found or invalid credential ID',
      });
    }

    const isExpired = cert.expiresAt && new Date(cert.expiresAt) < new Date();
    const recipientName = (cert.userId as any)?.fullName || 'Unknown';

    res.json({
      success: true,
      valid:   !isExpired,
      data: {
        credentialId:  cert.verificationCode,
        title:         cert.title,
        issuedFor:     cert.title,
        issuerName:    'BluelearnerHub',
        recipientName,
        issuedAt:      cert.issuedAt,
        expiresAt:     cert.expiresAt,
        status:        isExpired ? 'expired' : 'valid',
      },
    });
  } catch (err) {
    logger.error('verifyCertificate error', err);
    res.status(500).json({ success: false, message: 'Verification failed' });
  }
};

// ─── ISSUE CERTIFICATE (internal / admin only) ────────────────────────────────

export const issueCertificate = async (req: Request, res: Response) => {
  try {
    const { userId, title, issuedFor, expiresAt } = req.body;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Valid userId is required' });
    }

    const user = await User.findById(userId).select('fullName').lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const verificationCode = uuidv4();
    const baseUrl = process.env.FRONTEND_URL || 'https://bluelearnerhub.com';
    const verificationUrl = `${baseUrl}/certificates/verify/${verificationCode}`;

    const cert = await Certificate.create({
      userId:           new mongoose.Types.ObjectId(userId),
      title:            title || issuedFor || 'Certificate',
      type:             'COURSE',
      verificationCode,
      expiresAt:        expiresAt ? new Date(expiresAt) : undefined,
    });

    res.status(201).json({
      success: true,
      data: {
        ...cert.toObject(),
        verificationUrl,
        credentialId:  verificationCode,
        recipientName: (user as any).fullName,
        issuedFor:     issuedFor || title,
      },
    });
  } catch (err) {
    logger.error('issueCertificate error', err);
    res.status(500).json({ success: false, message: 'Failed to issue certificate' });
  }
};
