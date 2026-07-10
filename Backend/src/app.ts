import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';
import swaggerUi from 'swagger-ui-express';
import { config } from './config';
import { getSwaggerSpec } from './config/swagger';
import routes from './routes';
import { errorHandler, notFound } from './middleware/error.middleware';
import { generalLimiter } from './middleware/rateLimiter';
import { requestContext } from './middleware/requestContext';
import { csrfProtection } from './middleware/csrf';
import { getDBStatus } from './db/mongodb';
import { getRedisStatus } from './utils/database';
import logger from './utils/logger';

export function createApp(): Application {
  const app = express();

  // Trust proxy for deployment behind load balancers (Render, Vercel, etc.)
  // Render always runs behind a proxy — trust the first hop unconditionally in production.
  app.set('trust proxy', config.nodeEnv === 'production' ? 1 : (process.env.TRUST_PROXY === 'true' ? 1 : false));

  // HTTPS redirect in production
  if (config.nodeEnv === 'production') {
    app.use((req, res, next) => {
      if (req.header('x-forwarded-proto') !== 'https' && !req.path.startsWith('/health')) {
        return res.redirect(301, `https://${req.header('host')}${req.url}`);
      }
      next();
    });
  }

  // Comprehensive security headers
  app.use(
    helmet({
      // Strict Transport Security (force HTTPS)
      hsts: {
        maxAge: 31536000,        // 1 year
        includeSubDomains: true,
        preload: true,
      },
      // Content Security Policy
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
          fontSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'", config.frontendUrl].filter(Boolean),
          mediaSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          frameAncestors: ["'none'"],
        },
        ...(config.nodeEnv === 'production' ? { upgradeInsecureRequests: true } : {}),
      },
      // Referrer Policy
      referrerPolicy: {
        policy: 'strict-origin-when-cross-origin',
      },
      // Prevent MIME type sniffing
      noSniff: true,
      // Prevent clickjacking
      frameguard: {
        action: 'deny',
      },
      // Remove X-Powered-By header
      hidePoweredBy: true,
      // DNS Prefetch Control
      dnsPrefetchControl: {
        allow: false,
      },
    })
  );

  // CORS - Build the allowed-origins set from config
  const allowedOrigins = new Set<string>(config.corsOrigins);
  if (config.frontendUrl) allowedOrigins.add(config.frontendUrl);

  const corsOptions: cors.CorsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);

      // Only allow specific origins - no wildcard patterns
      const productionOrigins = [
        'https://bluelearnerhub.com',
        'https://www.bluelearnerhub.com',
      ];
      const isProductionAllowed = productionOrigins.includes(origin);
      const isDevAllowed = config.nodeEnv === 'development';
      const isConfigAllowed = allowedOrigins.has(origin);

      if (isProductionAllowed || isDevAllowed || isConfigAllowed) {
        callback(null, true);
      } else {
        logger.warn(`CORS blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'X-CSRF-Token'],
    exposedHeaders: ['set-cookie'],
  };
  app.use(cors(corsOptions));

  // Stripe webhook needs raw body BEFORE the JSON parser
  app.use('/api/v1/payments/webhook', express.raw({ type: 'application/json' }));

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Cookie parser with session secret
  let sessionSecret = config.sessionSecret;
  if (!sessionSecret) {
    if (config.nodeEnv === 'production') {
      logger.error('FATAL: SESSION_SECRET is required in production. Set SESSION_SECRET in your environment.');
      process.exit(1);
    }
    logger.warn('⚠️  SESSION_SECRET not set — generating temporary secret for development.');
    sessionSecret = `dev-${crypto.randomBytes(32).toString('hex')}`;
  }
  app.use(cookieParser(sessionSecret));

  // Compression
  app.use(compression());

  // Request correlation id for logs and upstream calls
  app.use(requestContext);

  // Logging
  if (config.nodeEnv === 'development') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined', {
      stream: {
        write: (message: string) => logger.info(message.trim()),
      },
    }));
  }

  // Rate limiting
  app.use('/api', generalLimiter);

  // CSRF protection — Double Submit Cookie Pattern
  app.use(csrfProtection);

  // Routes
  app.use('/api', routes);

  // Swagger API documentation (only in development)
  if (config.nodeEnv === 'development') {
    const swaggerSpec = getSwaggerSpec();
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'BluelearnerHub API Docs',
    }));
    logger.info(`Swagger UI available at http://localhost:${config.port}/api-docs`);
  }

  // Health check — exposed at both /health and /api/v1/health so monitors
  // can hit either path.
  const healthHandler = (_req: express.Request, res: express.Response) => {
    const mongo = getDBStatus();
    const redisStatus = getRedisStatus();
    const isHealthy = mongo.isConnected;

    res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? 'OK' : 'DEGRADED',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        mongodb: {
          connected: mongo.isConnected,
          readyState: mongo.readyState,
          host: mongo.host || null,
          name: mongo.name || null,
        },
        redis: {
          enabled: redisStatus.configured,
          available: redisStatus.available,
          status: redisStatus.status,
        },
      },
    });
  };
  app.get('/health', healthHandler);
  app.get('/api/v1/health', healthHandler);

  // Error handling
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
