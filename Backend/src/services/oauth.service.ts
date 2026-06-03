import axios from 'axios';
import { db } from '../db';
import { hashPassword } from '../utils/encryption';
import { signAccessToken, signRefreshToken } from '../utils/jwt';
import { config } from '../config';
import logger from '../utils/logger';
import mongoose from 'mongoose';

export interface OAuthProfile {
  providerId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  provider: 'github' | 'google';
}

// ─── GitHub OAuth helpers ──────────────────────────────────────────────────

export async function exchangeGithubCode(code: string): Promise<string> {
  const res = await axios.post(
    'https://github.com/login/oauth/access_token',
    {
      client_id: config.oauth.github.clientId,
      client_secret: config.oauth.github.clientSecret,
      code,
      redirect_uri: config.oauth.github.callbackUrl,
    },
    { headers: { Accept: 'application/json' } },
  );
  const accessToken = res.data?.access_token;
  if (!accessToken) throw new Error('GitHub did not return an access token');
  return accessToken;
}

export async function fetchGithubProfile(accessToken: string): Promise<OAuthProfile> {
  const [userRes, emailRes] = await Promise.all([
    axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}`, 'User-Agent': 'BlueLearnerHub' },
    }),
    axios.get('https://api.github.com/user/emails', {
      headers: { Authorization: `Bearer ${accessToken}`, 'User-Agent': 'BlueLearnerHub' },
    }),
  ]);

  const primaryEmail =
    emailRes.data?.find((e: any) => e.primary && e.verified)?.email ||
    emailRes.data?.[0]?.email ||
    userRes.data?.email;

  if (!primaryEmail) throw new Error('GitHub account has no verified email address');

  return {
    providerId: String(userRes.data.id),
    email: primaryEmail,
    name: userRes.data.name || userRes.data.login || 'GitHub User',
    avatarUrl: userRes.data.avatar_url,
    provider: 'github',
  };
}

// ─── Google OAuth helpers ──────────────────────────────────────────────────

export async function exchangeGoogleCode(code: string): Promise<string> {
  const res = await axios.post('https://oauth2.googleapis.com/token', {
    client_id: config.oauth.google.clientId,
    client_secret: config.oauth.google.clientSecret,
    code,
    redirect_uri: config.oauth.google.callbackUrl,
    grant_type: 'authorization_code',
  });
  const accessToken = res.data?.access_token;
  if (!accessToken) throw new Error('Google did not return an access token');
  return accessToken;
}

export async function fetchGoogleProfile(accessToken: string): Promise<OAuthProfile> {
  const res = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const { sub, email, name, picture } = res.data;
  if (!email) throw new Error('Google account has no email address');

  return {
    providerId: String(sub),
    email,
    name: name || 'Google User',
    avatarUrl: picture,
    provider: 'google',
  };
}

// ─── Shared: find-or-create user ─────────────────────────────────────────────

export async function findOrCreateOAuthUser(profile: OAuthProfile) {
  const normalizedEmail = profile.email.toLowerCase().trim();

  let user: any = await db.query.users.findFirst({ email: normalizedEmail });

  if (user) {
    if (!user.isActive || (user as any).isBanned) {
      throw new Error('Account is inactive or banned');
    }
    // Update avatar if not yet set
    if (!(user as any).avatarUrl && profile.avatarUrl) {
      user = await db.query.users.updateById((user as any)._id.toString(), {
        avatarUrl: profile.avatarUrl,
        updatedAt: new Date(),
      });
    }
    logger.info(`OAuth login: existing user ${normalizedEmail} via ${profile.provider}`);
  } else {
    // OAuth users get a placeholder password they cannot log in with directly
    const placeholderHash = await hashPassword(
      `oauth_${profile.provider}_${profile.providerId}_${Date.now()}`,
    );
    user = await db.query.users.create({
      email: normalizedEmail,
      fullName: profile.name,
      passwordHash: placeholderHash,
      role: 'STUDENT',
      avatarUrl: profile.avatarUrl || '',
      emailVerified: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    logger.info(`OAuth signup: new user ${normalizedEmail} via ${profile.provider}`);
  }

  return user;
}

// ─── Issue JWT tokens for an OAuth-authenticated user ────────────────────────

const RefreshTokenSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  revoked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const RefreshTokenModel = (() => {
  try {
    return mongoose.model('RefreshToken');
  } catch {
    return mongoose.model('RefreshToken', RefreshTokenSchema);
  }
})();

export async function issueTokensForUser(user: any) {
  const userId = user._id?.toString() || String(user._id);
  const accessToken = signAccessToken({ userId, email: user.email, role: user.role || 'STUDENT' });
  const refreshToken = signRefreshToken({ userId, email: user.email, role: user.role || 'STUDENT' });

  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await (RefreshTokenModel as any).findOneAndUpdate(
    { token: refreshToken },
    { userId, token: refreshToken, expiresAt, revoked: false },
    { upsert: true, new: true },
  );

  // Update last login
  await db.query.users.updateById(userId, { lastLoginAt: new Date(), updatedAt: new Date() });

  return { accessToken, refreshToken };
}
