import { comparePassword, hashPassword } from '../utils/encryption';
import { signAccessToken, signRefreshToken } from '../utils/jwt';
import { AppError } from '../middleware/error';
import { db, RefreshToken } from '../db';
import logger from '../utils/logger';

export class AuthService {
  async register(data: { email: string; password: string; fullName: string; collegeName?: string; company?: string; role?: string }) {
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
    // Verify refresh token exists and is not revoked
    const tokenData = await RefreshToken.findOne({
      token: refreshToken,
      revoked: false,
      expiresAt: { $gt: new Date() },
    });

    if (!tokenData) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    const user = await db.query.users.findFirst({ _id: tokenData.userId });

    if (!user || !user.isActive) {
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

    // Invalidate old refresh token
    await RefreshToken.updateOne({ token: refreshToken }, { revoked: true });

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
