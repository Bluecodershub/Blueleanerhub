import { comparePassword, hashPassword } from '../utils/encryption';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AppError } from '../middleware/error';
import { db, RefreshToken } from '../db';
import { CURRENT_POLICY_VERSION } from '../config/legal';
import logger from '../utils/logger';

export interface RegisterConsents {
  terms?: boolean;
  privacy?: boolean;
  dataProcessing?: boolean;
  marketing?: boolean;
  guardianConsent?: boolean;
}

export interface RegisterMeta {
  ipAddress?: string;
  userAgent?: string;
}

export class AuthService {
  async register(data: { email: string; password: string; fullName: string; collegeName?: string; company?: string; role?: string; consents?: RegisterConsents; meta?: RegisterMeta }) {
    // Check if user exists
    const existingUser = await db.query.users.findFirst({ email: data.email.toLowerCase() });
    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    const hashedPassword = await hashPassword(data.password);

    // Create user with MongoDB
    const user = await db.query.users.create({
      email: data.email.toLowerCase(),
      fullName: data.fullName,
      passwordHash: hashedPassword,
      role: data.role || 'STUDENT',
      isActive: true,
      avatarUrl: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Generate tokens with role
    const accessToken = signAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role || 'STUDENT',
    });

    const refreshToken = signRefreshToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role || 'STUDENT',
    });

    // Store refresh token in MongoDB
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    await RefreshToken.findOneAndUpdate(
      { token: refreshToken },
      { userId: user._id.toString(), token: refreshToken, expiresAt, revoked: false },
      { upsert: true, new: true }
    );

    // Record consent as an append-only audit trail (DPDP 2023). Best-effort —
    // a consent-logging failure must not block account creation.
    try {
      await this.recordRegistrationConsents(user._id.toString(), data.consents, data.meta);
    } catch (err: any) {
      logger.error('Failed to record registration consent', { userId: user._id.toString(), error: err?.message });
    }

    logger.info(`New user registered: ${user.email}`);

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        role: user.role || 'STUDENT',
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Writes one ConsentRecord row per consent the user gave at signup. Terms,
   * Privacy, and DataProcessing are mandatory for account creation; Marketing
   * and Guardian consent are optional and only recorded when granted.
   */
  private async recordRegistrationConsents(userId: string, consents?: RegisterConsents, meta?: RegisterMeta) {
    if (!consents) return;
    const base = {
      userId,
      policyVersion: CURRENT_POLICY_VERSION,
      context: 'REGISTRATION',
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
      createdAt: new Date(),
    };
    const rows: Array<{ consentType: string; granted: boolean }> = [
      { consentType: 'TERMS', granted: !!consents.terms },
      { consentType: 'PRIVACY', granted: !!consents.privacy },
      { consentType: 'DATA_PROCESSING', granted: !!consents.dataProcessing },
    ];
    if (consents.marketing) rows.push({ consentType: 'MARKETING_COMMS', granted: true });
    if (consents.guardianConsent) rows.push({ consentType: 'GUARDIAN_CONSENT', granted: true });

    await Promise.all(rows.map((r) => db.query.consentRecords.create({ ...base, ...r })));
  }

  async login(email: string, password: string) {
    // Find user (normalize email to lowercase)
    const user = await db.query.users.findFirst({ email: email.toLowerCase().trim() });
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AppError('Account is inactive', 403);
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate tokens with role
    const accessToken = signAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role || 'STUDENT',
    });

    const refreshToken = signRefreshToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role || 'STUDENT',
    });

    // Store refresh token
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await RefreshToken.findOneAndUpdate(
      { token: refreshToken },
      { userId: user._id.toString(), token: refreshToken, expiresAt, revoked: false },
      { upsert: true, new: true }
    );

    // Update last login
    await db.query.users.updateById(user._id, { lastLoginAt: new Date() });

    logger.info(`User logged in: ${user.email}`);

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        role: user.role || 'STUDENT',
      },
      accessToken,
      refreshToken,
    };
  }

  async logout(userId: string, _refreshToken?: string) {
    // Revoke ALL refresh tokens for this user
    await RefreshToken.updateMany({ userId }, { revoked: true });
    logger.info(`User logged out: ${userId}`);
  }

  async refreshAccessToken(refreshToken: string) {
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    // Atomically consume the refresh token so parallel refreshes cannot mint
    // multiple valid replacement tokens from the same old token.
    const tokenData = await RefreshToken.findOneAndUpdate(
      {
        token: refreshToken,
        userId: decoded.userId,
        revoked: false,
        expiresAt: { $gt: new Date() },
      },
      { $set: { revoked: true } },
      { new: false },
    ).lean();

    if (!tokenData) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    const user = await db.query.users.findFirst({ _id: tokenData.userId });

    if (!user || !user.isActive || user.isBanned) {
      throw new AppError('User account is not active', 403);
    }

    // Generate new tokens (IMPORTANT: Rotate refresh token for security)
    const newAccessToken = signAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role || 'STUDENT',
    });

    const newRefreshToken = signRefreshToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role || 'STUDENT',
    });

    // Store new refresh token
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await RefreshToken.create({
      userId: user._id.toString(),
      token: newRefreshToken,
      expiresAt,
      revoked: false,
    });

    logger.info(`Token refreshed for user: ${user._id}`);

    return { 
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async getCurrentUser(userId: string) {
    const user = await db.query.users.findFirst({ _id: userId });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    return {
      id: user._id.toString(),
      email: user.email,
      fullName: user.fullName,
      role: user.role || 'STUDENT',
      avatarUrl: user.avatarUrl,
      isActive: user.isActive,
    };
  }
}
