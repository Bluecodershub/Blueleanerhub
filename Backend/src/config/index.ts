import { resolve } from 'path';
import { config as dotenvConfig } from 'dotenv';

// Load .env from backend root (two levels up from src/config/)
dotenvConfig({ path: resolve(__dirname, '../../.env') });

// ─── Helpers ──────────────────────────────────────────────────────────────────

const nodeEnv = process.env.NODE_ENV || 'development';
const isProd  = nodeEnv === 'production';
const isTest  = nodeEnv === 'test';

function buildMongoUrl(): string {
  const explicitMongoUrl = process.env.MONGODB_URL?.trim();
  if (explicitMongoUrl) {
    return explicitMongoUrl;
  }

  const host = process.env.DB_HOST?.trim();
  if (!host) {
    return 'mongodb://localhost:27017/bluelearnerhub';
  }

  const port = process.env.DB_PORT || '27017';
  const name = process.env.DB_NAME || 'bluelearnerhub';
  const user = process.env.DB_USER?.trim();
  const password = process.env.DB_PASSWORD?.trim();

  const credentials = user
    ? `${encodeURIComponent(user)}:${encodeURIComponent(password || '')}@`
    : '';

  return `mongodb://${credentials}${host}:${port}/${name}`;
}

const mongoUrl = buildMongoUrl();

/**
 * Returns true when a secret value looks like a placeholder that was never
 * replaced.  These patterns are intentionally distinct from real secrets so
 * they can be caught at startup without false positives.
 */
function looksLikePlaceholder(value: string): boolean {
  const lower = value.toLowerCase();
  return (
    lower.includes('replace_with') ||
    lower.includes('change-in-production') ||
    lower.includes('changethisinproduction') ||
    lower.includes('your-super-secret') ||
    lower.includes('replace-me') ||
    lower.includes('default-secret') ||
    lower.includes('openssl_rand') ||
    lower.startsWith('your_') ||
    lower === 'secret' ||
    lower === 'password'
  );
}

/** Validate a secret: must exist, be >=32 chars, and not be a placeholder. */
function validateSecret(name: string, value: string | undefined): string | null {
  if (!value || value.trim() === '') {
    return `${name} is not set — generate one with: openssl rand -hex 32`;
  }
  if (value.length < 32) {
    return `${name} is too short (${value.length} chars, minimum 32)`;
  }
  if (looksLikePlaceholder(value)) {
    return `${name} still contains a placeholder value — replace it with a real secret`;
  }
  return null; // valid
}

// ─── Startup validation ───────────────────────────────────────────────────────

if (!isTest) {
  const errors: string[]   = [];
  const warnings: string[] = [];

  // ── Critical secrets (required in ALL non-test environments) ────────────────

  const jwtErr = validateSecret('JWT_SECRET', process.env.JWT_SECRET);
  if (jwtErr) errors.push(jwtErr);

  const refreshErr = validateSecret('JWT_REFRESH_SECRET', process.env.JWT_REFRESH_SECRET);
  if (refreshErr) errors.push(refreshErr);

  const cookieErr = validateSecret('COOKIE_SECRET', process.env.COOKIE_SECRET);
  if (cookieErr) errors.push(cookieErr);

  const sessionErr = validateSecret('SESSION_SECRET', process.env.SESSION_SECRET);
  if (sessionErr) errors.push(sessionErr);

  // ── Production-only requirements ────────────────────────────────────────────

  if (isProd) {
    // Primary database
    if (!process.env.MONGODB_URL && !process.env.DB_HOST) {
      errors.push('MONGODB_URL is required in production (or provide DB_HOST/DB_PORT/DB_NAME for MongoDB)');
    }

    // Redis - required for production (caching, sessions, rate limiting)
    if (!process.env.REDIS_URL && !process.env.REDIS_HOST) {
      errors.push('REDIS_URL is required in production — set to your Redis URL (e.g. from Upstash, Redis Cloud)');
    }

    // CORS / cookie domain
    if (!process.env.FRONTEND_URL) {
      errors.push('FRONTEND_URL is required in production (e.g. https://bluelearnerhub.com)');
    } else if (process.env.FRONTEND_URL.startsWith('http://localhost')) {
      warnings.push('FRONTEND_URL is set to localhost — this is wrong for production');
    }

    // AI provider
    if ((process.env.AI_PROVIDER || 'local').toLowerCase() === 'gemini') {
      warnings.push('AI_PROVIDER=gemini is disabled for this deployment — use AI_PROVIDER=local with the inbuilt model service');
    }

    // Stripe: if one price ID is set, all must be set
    const stripeKey   = process.env.STRIPE_SECRET_KEY;
    const priceExplorer  = process.env.STRIPE_PRICE_EXPLORER;
    const priceInnovator = process.env.STRIPE_PRICE_INNOVATOR;
    const priceEnterprise = process.env.STRIPE_PRICE_ENTERPRISE;
    if (stripeKey) {
      if (!process.env.STRIPE_WEBHOOK_SECRET) {
        warnings.push('STRIPE_SECRET_KEY is set but STRIPE_WEBHOOK_SECRET is missing — webhook verification will fail');
      }
      if (!priceExplorer || !priceInnovator || !priceEnterprise) {
        errors.push(
          'STRIPE_SECRET_KEY is set but one or more Stripe Price IDs are missing ' +
          '(STRIPE_PRICE_EXPLORER, STRIPE_PRICE_INNOVATOR, STRIPE_PRICE_ENTERPRISE)'
        );
      }
    }

    // Email: warn if neither provider is configured
    if (!process.env.SENDGRID_API_KEY && !process.env.RESEND_API_KEY) {
      warnings.push(
        'Neither SENDGRID_API_KEY nor RESEND_API_KEY is set — ' +
        'password-reset emails will not be delivered'
      );
    }
  }

  // ── Fail fast or warn ────────────────────────────────────────────────────────

  if (errors.length > 0) {
    if (isProd) {
      // Hard crash in production — a misconfigured server must not serve traffic
      throw new Error(
        '\n' +
        '╔══════════════════════════════════════════════════════════════════╗\n' +
        '║  FATAL: Server cannot start — invalid environment configuration  ║\n' +
        '╚══════════════════════════════════════════════════════════════════╝\n\n' +
        errors.map((e) => `  ✗ ${e}`).join('\n') +
        '\n\n' +
        '  Fix these in your Render (or other) deployment environment variables,\n' +
        '  then redeploy.  See backend/.env.example for full documentation.\n'
      );
    } else {
      // Development: log clearly but continue so hot-reload still works
      console.error('\n[config] ⚠  Missing/invalid environment variables (dev mode — continuing anyway):');
      for (const e of errors) console.error(`         ✗ ${e}`);
      console.error('         → Copy backend/.env.example to backend/.env and fill in all values.\n');
    }
  }

  if (warnings.length > 0) {
    for (const w of warnings) {
      console.warn(`[config] ⚠  ${w}`);
    }
  }
}

// ─── Exported config object ───────────────────────────────────────────────────

export const config = {
  // Server
  port:    parseInt(process.env.PORT    || '5000'),
  host:    process.env.HOST             || '0.0.0.0',
  nodeEnv,
  isProd,

  // Frontend (CORS, cookies, email links)
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  backendUrl:  process.env.BACKEND_URL  || 'http://localhost:5000',

  // CORS
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5000').split(',').map((o) => o.trim()),

  // Database (MongoDB)
  database: {
    provider: 'mongodb',
    url: mongoUrl,
  },

  // Redis - scaled for 600+ concurrent users
  redis: {
    url:      process.env.REDIS_URL,
    host:     process.env.REDIS_HOST     || 'localhost',
    port:     parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || '',
    db:       parseInt(process.env.REDIS_DB   || '0'),
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    enableOfflineQueue: false, // Fail fast for 600+ users
  },

  // JWT
  jwt: {
    secret:           process.env.JWT_SECRET          || '',
    expiresIn:        process.env.JWT_EXPIRES_IN      || '15m',
    refreshSecret:    process.env.JWT_REFRESH_SECRET  || '',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  // Session & Cookies
  session: {
    secret:       process.env.SESSION_SECRET || process.env.COOKIE_SECRET || '',
    cookieSecret: process.env.COOKIE_SECRET  || '',
  },

  // Shorthand for middleware that only needs the cookie secret
  sessionSecret: process.env.SESSION_SECRET || process.env.COOKIE_SECRET || '',

  // Rate Limiting — tuned for hackathons with 600+ concurrent users.
  // Per-route limiters (authLimiter, passwordResetLimiter, strictLimiter, etc.)
  // enforce stricter bounds on sensitive endpoints. The general limit is a
  // safety net for non-authenticated API traffic.
  rateLimit: {
    windowMs:    parseInt(process.env.RATE_LIMIT_WINDOW_MS    || '60000'), // 1 minute (finer granularity)
    maxRequests: Math.min(parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '500'), 2000), // Capped at 2000 to prevent accidental misconfiguration
  },

  // File Upload
  upload: {
    maxFileSize:    parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10 MB
    uploadDir:      process.env.UPLOAD_DIR || './uploads',
    allowedFileTypes: ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.zip', '.dwg', '.dxf', '.step', '.stl'],
    allowedMimeTypes: (
      process.env.ALLOWED_MIME_TYPES ||
      'application/pdf,application/msword,' +
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document,' +
      'image/jpeg,image/png,application/zip'
    ).split(','),
    maxImageDimensions: {
      width:  parseInt(process.env.MAX_IMAGE_WIDTH  || '4000'),
      height: parseInt(process.env.MAX_IMAGE_HEIGHT || '4000'),
    },
    enableVirusScan: process.env.ENABLE_VIRUS_SCAN === 'true',
  },

  // AWS S3
  aws: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region:          process.env.AWS_REGION    || 'us-east-1',
    s3Bucket:        process.env.AWS_S3_BUCKET,
  },

  // Email (SendGrid preferred, Resend fallback)
  email: {
    from:           process.env.EMAIL_FROM      || 'connect@bluelearnerhub.com',
    sendgridApiKey: process.env.SENDGRID_API_KEY,
    resendApiKey:   process.env.RESEND_API_KEY,
  },

  // OAuth
  oauth: {
    github: {
      clientId:     process.env.GITHUB_CLIENT_ID     || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      callbackUrl:  `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/v1/auth/oauth/github/callback`,
    },
    google: {
      clientId:     process.env.GOOGLE_CLIENT_ID     || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackUrl:  process.env.GOOGLE_CALLBACK_URL  ||
                    `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/v1/auth/oauth/google/callback`,
    },
  },

  // AI Service
  ai: {
    serviceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000',
    provider:   process.env.AI_PROVIDER    || 'local',
    notebookTimeoutMs: parseInt(process.env.NOTEBOOK_AI_TIMEOUT_MS || '20000'),
  },
  // Backward-compat alias used in existing service files
  aiServiceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000',

  // Stripe
  stripe: {
    secretKey:      process.env.STRIPE_SECRET_KEY,
    webhookSecret:  process.env.STRIPE_WEBHOOK_SECRET,
    prices: {
      explorer:  process.env.STRIPE_PRICE_EXPLORER,
      innovator: process.env.STRIPE_PRICE_INNOVATOR,
      enterprise: process.env.STRIPE_PRICE_ENTERPRISE,
    },
  },

  // Code Execution (Judge0)
  judge0: {
    apiKey: process.env.JUDGE0_API_KEY,
    apiUrl: process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com',
  },

  // Security
  security: {
    bcryptRounds:      parseInt(process.env.BCRYPT_ROUNDS      || '12'),
    maxLoginAttempts:  parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5'),
    lockoutDuration:   parseInt(process.env.LOCKOUT_DURATION   || '900000'), // 15 min
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },

  // ── Internal API (Backend-to-Backend) ──────────────────────────────────────
  internalApiKey: process.env.INTERNAL_API_KEY,
};
