import { Request, Response, NextFunction } from 'express';
import { randomBytes, createHash } from 'crypto';
import { AuthService } from '../services/auth';
import { db } from '../db';
import { PasswordResetToken, User } from '../db/models';
import logger from '../utils/logger';
import { config } from '../config';
import { sendEmail, buildPasswordResetEmail } from '../utils/email';
import { setCsrfCookie, clearCsrfCookie } from '../middleware/csrf';
import { comparePassword, hashPassword } from '../utils/encryption';

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

// Blocked email domains for organization registration
const BLOCKED_EMAIL_DOMAINS = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com',
  'msn.com', 'aol.com', 'icloud.com', 'me.com', 'mac.com',
  'zoho.com', 'protonmail.com', 'mail.com', 'ymail.com',
  'yandex.com', 'gmx.com', 'inbox.com', 'fastmail.com',
  'qq.com', '163.com', '126.com', 'rediffmail.com',
  'indiatimes.com', 'sify.com', 'hotmail.co.uk', 'hotmail.fr',
];

export const isOrganizationEmail = (email: string): { valid: boolean; reason?: string } => {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) {
    return { valid: false, reason: 'Please enter a valid email address' };
  }
  if (BLOCKED_EMAIL_DOMAINS.includes(domain)) {
    return {
      valid: false,
      reason: `Personal email addresses are not allowed for organization registration. Please use your organization email (e.g., name@company.com)`,
    };
  }
  if (!domain.includes('.')) {
    return { valid: false, reason: 'Please enter a valid organization email' };
  }
  return { valid: true };
};

const authService = new AuthService();

const setAuthCookies = (res: Response, accessToken: string, refreshToken: string) => {
  const isProduction = config.nodeEnv === 'production';
  const refreshPath = '/api/v1/auth/refresh-token';

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 15 * 60 * 1000, // 15 minutes — matches JWT exp; refresh token extends the session
    signed: true,
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: refreshPath,
    signed: true,
  });
};

const clearAuthCookies = (res: Response) => {
  const isProduction = config.nodeEnv === 'production';
  const baseOpts = {
    httpOnly: true,
    secure: isProduction,
    sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
    signed: true,
  };
  res.clearCookie('accessToken', { ...baseOpts, path: '/' });
  res.clearCookie('refreshToken', { ...baseOpts, path: '/api/v1/auth/refresh-token' });
};

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, fullName, collegeName, company, consents } = req.body;

      const result = await authService.register({
        email,
        password,
        fullName,
        collegeName,
        company,
        consents,
        meta: { ipAddress: req.ip, userAgent: req.get('user-agent') || undefined },
      });

      setAuthCookies(res, result.accessToken, result.refreshToken);
      setCsrfCookie(res);

      // Fire-and-forget email verification (non-blocking)
      sendVerificationEmail(result.user.id, result.user.email).catch((err) => {
        logger.error('Failed to send verification email', { userId: result.user.id, error: err?.message });
      });

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: { user: result.user },
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      const result = await authService.login(email, password);

      setAuthCookies(res, result.accessToken, result.refreshToken);
      setCsrfCookie(res);

      res.json({
        success: true,
        message: 'Login successful',
        data: { user: result.user },
      });
    } catch (error) {
      next(error);
    }
  }

  async corporateLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      const emailValidation = isOrganizationEmail(email);
      if (!emailValidation.valid) {
        res.status(400).json({ success: false, message: emailValidation.reason });
        return;
      }

      const result = await authService.login(email, password);
      if (!['CORPORATE', 'ADMIN'].includes(result.user.role)) {
        await authService.logout(result.user.id, result.refreshToken);
        res.status(403).json({ success: false, message: 'This account does not have corporate access' });
        return;
      }

      setAuthCookies(res, result.accessToken, result.refreshToken);
      setCsrfCookie(res);

      res.json({ success: true, message: 'Login successful', data: { user: result.user } });
    } catch (error) {
      next(error);
    }
  }

  async corporateRegister(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(403).json({
        success: false,
        message: 'Corporate accounts must be created or approved by an administrator.',
      });
    } catch (error) {
      next(error);
    }
  }

  async mentorLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      if (!['MENTOR', 'ADMIN'].includes(result.user.role)) {
        await authService.logout(result.user.id, result.refreshToken);
        res.status(403).json({ success: false, message: 'This account does not have mentor access' });
        return;
      }

      setAuthCookies(res, result.accessToken, result.refreshToken);
      setCsrfCookie(res);

      res.json({ success: true, message: 'Login successful', data: { user: result.user } });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.signedCookies?.refreshToken;

      if (req.user) {
        try {
          await authService.logout(req.user.id, refreshToken);
        } catch (err: any) {
          logger.warn('Failed to revoke refresh tokens during logout', {
            userId: req.user.id,
            error: err?.message,
          });
        }
      }

      clearAuthCookies(res);
      clearCsrfCookie(res);

      res.json({ success: true, message: 'Logout successful' });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.signedCookies?.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({ success: false, message: 'Refresh token not found' });
      }

      const result = await authService.refreshAccessToken(refreshToken);

      setAuthCookies(res, result.accessToken, result.refreshToken);
      setCsrfCookie(res);

      res.json({ success: true, message: 'Token refreshed successfully' });
    } catch (error) {
      next(error);
    }
  }

  async getCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const user = await authService.getCurrentUser(userId);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const {
        fullName, bio, location, profilePicture, educationLevel, collegeName,
        graduationYear, currentPosition, company, yearsExperience,
        linkedinUrl, githubUrl, portfolioUrl, avatarConfig, domain, phone, preferences,
      } = req.body;

      const updates: Record<string, any> = {};
      if (fullName !== undefined) updates.fullName = fullName;
      if (bio !== undefined) updates.bio = bio;
      if (location !== undefined) updates.location = location;
      if (profilePicture !== undefined) updates.profilePicture = profilePicture;
      if (educationLevel !== undefined) updates.educationLevel = educationLevel;
      if (collegeName !== undefined) updates.collegeName = collegeName;
      if (graduationYear !== undefined) updates.graduationYear = graduationYear;
      if (currentPosition !== undefined) updates.currentPosition = currentPosition;
      if (company !== undefined) updates.company = company;
      if (yearsExperience !== undefined) updates.yearsExperience = yearsExperience;
      if (linkedinUrl !== undefined) updates.linkedinUrl = linkedinUrl;
      if (githubUrl !== undefined) updates.githubUrl = githubUrl;
      if (portfolioUrl !== undefined) updates.portfolioUrl = portfolioUrl;
      if (avatarConfig !== undefined) updates.avatarConfig = avatarConfig;
      if (domain !== undefined) updates.domain = domain;
      if (phone !== undefined) updates.phone = phone;
      if (preferences !== undefined && typeof preferences === 'object') {
        updates.preferences = preferences;
      }
      updates.updatedAt = new Date();

      const user = await db.query.users.updateById(userId, updates);

      res.json({ success: true, message: 'Profile updated successfully', data: user });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      if (!email || typeof email !== 'string') {
        return res.status(400).json({ success: false, message: 'Email is required.' });
      }

      const normalizedEmail = email.toLowerCase().trim();

      // Always return success to prevent email enumeration
      const user = await db.query.users.findFirst({ email: normalizedEmail });
      if (!user) {
        return res.json({ success: true, message: 'If that email is registered, a reset link has been sent.' });
      }

      // Invalidate any existing active tokens for this email
      await PasswordResetToken.updateMany({ email: normalizedEmail, used: false }, { used: true });

      const rawToken = randomBytes(32).toString('hex');
      const tokenHash = createHash('sha256').update(rawToken).digest('hex');
      const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

      await PasswordResetToken.create({ email: normalizedEmail, tokenHash, expiresAt, used: false });

      const resetUrl = `${config.frontendUrl}/reset-password?token=${rawToken}`;
      await sendEmail(buildPasswordResetEmail(normalizedEmail, resetUrl));

      if (config.nodeEnv !== 'production') {
        logger.info(`[DEV] Password reset URL for ${normalizedEmail}: ${resetUrl}`);
      }

      logger.info(`Password reset requested for ${normalizedEmail}`);
      res.json({ success: true, message: 'If that email is registered, a reset link has been sent.' });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password } = req.body;
      if (!token || !password) {
        return res.status(400).json({ success: false, message: 'Token and new password are required.' });
      }
      if (typeof password !== 'string' || password.length < 8) {
        return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
      }

      const tokenHash = createHash('sha256').update(token).digest('hex');
      const resetRecord = await PasswordResetToken.findOne({ tokenHash });

      if (!resetRecord) {
        return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
      }

      if (resetRecord.used || resetRecord.expiresAt < new Date()) {
        return res.status(400).json({ success: false, message: 'Reset token has expired. Please request a new one.' });
      }

      const hashedPassword = await hashPassword(password);

      await db.query.users.update({ email: resetRecord.email }, { passwordHash: hashedPassword, updatedAt: new Date() });
      await PasswordResetToken.updateOne({ tokenHash }, { used: true });

      logger.info(`Password reset completed for ${resetRecord.email}`);
      res.json({ success: true, message: 'Password has been reset successfully. You can now log in.' });
    } catch (error) {
      next(error);
    }
  }

  async updatePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { currentPassword, newPassword } = req.body;

      const user = await db.query.users.findById(userId);

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const isValid = await comparePassword(currentPassword, (user as any).passwordHash);

      if (!isValid) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }

      const hashedPassword = await hashPassword(newPassword);
      await db.query.users.updateById(userId, { passwordHash: hashedPassword, updatedAt: new Date() });

      res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.query as { token: string };
      if (!token) {
        return res.status(400).json({ success: false, message: 'Verification token is required.' });
      }

      const tokenHash = createHash('sha256').update(token).digest('hex');
      const user = await User.findOne({
        emailVerificationToken: tokenHash,
        emailVerificationExpires: { $gt: new Date() },
      });

      if (!user) {
        return res.status(400).json({ success: false, message: 'Invalid or expired verification link.' });
      }

      user.emailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save();

      logger.info(`Email verified for user: ${user.email}`);
      res.json({ success: true, message: 'Email verified successfully.' });
    } catch (error) {
      next(error);
    }
  }

  async resendVerification(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      if (user.emailVerified) {
        return res.status(400).json({ success: false, message: 'Email is already verified.' });
      }

      await sendVerificationEmail(userId, user.email);
      res.json({ success: true, message: 'Verification email resent.' });
    } catch (error) {
      next(error);
    }
  }
}

// ─── Helper: issue and send an email verification token ───────────────────────
const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

async function sendVerificationEmail(userId: string, email: string): Promise<void> {
  const rawToken = randomBytes(32).toString('hex');
  const tokenHash = createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + VERIFICATION_TTL_MS);

  await User.findByIdAndUpdate(userId, {
    $set: { emailVerificationToken: tokenHash, emailVerificationExpires: expiresAt },
  });

  const verifyUrl = `${config.frontendUrl}/verify-email?token=${rawToken}`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0f1e;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:40px auto;padding:0 16px;">
    <div style="background:#111827;border:1px solid #1f2937;border-radius:16px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#3b82f6,#8b5cf6);padding:32px 40px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:24px;font-weight:900;">BlueLearnerHub</h1>
        <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">Verify your email address</p>
      </div>
      <div style="padding:40px;">
        <p style="color:#9ca3af;font-size:15px;line-height:1.6;margin:0 0 24px;">
          Welcome! Click the button below to verify your email address.
          This link expires in <strong style="color:#e5e7eb;">24 hours</strong>.
        </p>
        <div style="text-align:center;margin:32px 0;">
          <a href="${verifyUrl}"
             style="display:inline-block;background:linear-gradient(135deg,#3b82f6,#8b5cf6);color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 36px;border-radius:12px;">
            Verify Email
          </a>
        </div>
        <p style="color:#6b7280;font-size:13px;">
          Or copy this link: <a href="${verifyUrl}" style="color:#3b82f6;word-break:break-all;">${verifyUrl}</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;

  await sendEmail({
    to: email,
    subject: 'Verify your BlueLearnerHub email',
    html,
    text: `Verify your email: ${verifyUrl}`,
  });

  if (config.nodeEnv !== 'production') {
    logger.info(`[DEV] Email verification URL for ${email}: ${verifyUrl}`);
  }
}
