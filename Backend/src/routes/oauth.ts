import { Router, Request, Response } from 'express';
import { randomBytes } from 'crypto';
import { config } from '../config';
import {
  exchangeGithubCode,
  fetchGithubProfile,
  exchangeGoogleCode,
  fetchGoogleProfile,
  findOrCreateOAuthUser,
  issueTokensForUser,
} from '../services/oauth.service';
import { setCsrfCookie } from '../middleware/csrf';
import logger from '../utils/logger';

const router = Router();
const isProduction = config.nodeEnv === 'production';

// ─── Cookie helpers ────────────────────────────────────────────────────────

const STATE_COOKIE = 'oauth_state';

function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  const refreshPath = '/api/v1/auth/refresh-token';
  const cookieOpts = {
    httpOnly: true,
    secure: isProduction,
    sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
    signed: true,
  };

  res.cookie('accessToken', accessToken, {
    ...cookieOpts,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.cookie('refreshToken', refreshToken, {
    ...cookieOpts,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: refreshPath,
  });
}

function redirectError(res: Response, message: string) {
  const url = new URL(`${config.frontendUrl}/oauth/callback`);
  url.searchParams.set('error', message);
  return res.redirect(url.toString());
}

// ─── GitHub ────────────────────────────────────────────────────────────────

router.get('/github', (_req: Request, res: Response) => {
  if (!config.oauth.github.clientId) {
    return res.status(501).json({ success: false, message: 'GitHub OAuth is not configured' });
  }

  const state = randomBytes(16).toString('hex');
  res.cookie(STATE_COOKIE, state, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 10 * 60 * 1000, // 10 minutes
  });

  const params = new URLSearchParams({
    client_id: config.oauth.github.clientId,
    redirect_uri: config.oauth.github.callbackUrl,
    scope: 'user:email',
    state,
  });

  return res.redirect(`https://github.com/login/oauth/authorize?${params}`);
});

router.get('/github/callback', async (req: Request, res: Response) => {
  const { code, state, error } = req.query as Record<string, string>;

  if (error) return redirectError(res, `GitHub denied access: ${error}`);
  if (!code) return redirectError(res, 'No authorization code received from GitHub');

  // CSRF state check
  const savedState = req.signedCookies?.[STATE_COOKIE] || req.cookies?.[STATE_COOKIE];
  if (!savedState || savedState !== state) {
    return redirectError(res, 'Invalid OAuth state — possible CSRF attempt');
  }
  res.clearCookie(STATE_COOKIE);

  try {
    const accessToken = await exchangeGithubCode(code);
    const profile = await fetchGithubProfile(accessToken);
    const user = await findOrCreateOAuthUser(profile);
    const tokens = await issueTokensForUser(user);
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    setCsrfCookie(res);
    res.redirect(`${config.frontendUrl}/oauth/callback?success=true`);
  } catch (err: any) {
    logger.error('GitHub OAuth callback error:', err.message);
    return redirectError(res, err.message || 'GitHub authentication failed');
  }
});

// ─── Google ────────────────────────────────────────────────────────────────

router.get('/google', (_req: Request, res: Response) => {
  if (!config.oauth.google.clientId) {
    return res.status(501).json({ success: false, message: 'Google OAuth is not configured' });
  }

  const state = randomBytes(16).toString('hex');
  res.cookie(STATE_COOKIE, state, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 10 * 60 * 1000,
  });

  const params = new URLSearchParams({
    client_id: config.oauth.google.clientId,
    redirect_uri: config.oauth.google.callbackUrl,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'offline',
    prompt: 'select_account',
  });

  return res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

router.get('/google/callback', async (req: Request, res: Response) => {
  const { code, state, error } = req.query as Record<string, string>;

  if (error) return redirectError(res, `Google denied access: ${error}`);
  if (!code) return redirectError(res, 'No authorization code received from Google');

  const savedState = req.signedCookies?.[STATE_COOKIE] || req.cookies?.[STATE_COOKIE];
  if (!savedState || savedState !== state) {
    return redirectError(res, 'Invalid OAuth state — possible CSRF attempt');
  }
  res.clearCookie(STATE_COOKIE);

  try {
    const accessToken = await exchangeGoogleCode(code);
    const profile = await fetchGoogleProfile(accessToken);
    const user = await findOrCreateOAuthUser(profile);
    const tokens = await issueTokensForUser(user);
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    setCsrfCookie(res);
    res.redirect(`${config.frontendUrl}/oauth/callback?success=true`);
  } catch (err: any) {
    logger.error('Google OAuth callback error:', err.message);
    return redirectError(res, err.message || 'Google authentication failed');
  }
});

export default router;
