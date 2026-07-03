import Redis from 'ioredis';
import logger from './logger';
import { getConnectionStatus } from '../db/mongodb';

// Redis configuration
const redisConfigured = Boolean(process.env.REDIS_URL);
let redisAvailable = false;
let redisDisabled = false;
let redisErrorLogged = false;

export const redisClient: any = redisConfigured
  ? (() => {
      const client = new Redis(process.env.REDIS_URL!, {
        retryStrategy: (times: number) => {
          if (times > 5) {
            logger.warn('Redis max retries exceeded — caching disabled.');
            return null;
          }
          const delay = Math.min(times * 500, 3000);
          logger.info(`Redis retry ${times}/5, waiting ${delay}ms`);
          return delay;
        },
        maxRetriesPerRequest: null as any,
        enableOfflineQueue: false,
        lazyConnect: true,
      });

      client.on('error', (err: Error) => {
        redisAvailable = false;
        if (!redisErrorLogged) {
          logger.warn('Redis unavailable; caching and distributed rate limits are using local fallbacks.', {
            error: err.message,
          });
          redisErrorLogged = true;
        }
      });

      client.on('connect', () => {
        redisAvailable = true;
        redisDisabled = false;
        redisErrorLogged = false;
        logger.info('Redis connected');
      });

      return client;
    })()
  : null;

export const isRedisReady = (): boolean => (
  Boolean(redisClient) &&
  !redisDisabled &&
  redisAvailable &&
  redisClient.status === 'ready'
);

export const markRedisUnavailable = (error?: unknown): void => {
  redisAvailable = false;
  redisDisabled = true;

  if (error && !redisErrorLogged) {
    logger.warn('Redis disabled; using local fallbacks.', {
      error: error instanceof Error ? error.message : String(error),
    });
    redisErrorLogged = true;
  }

  if (redisClient && redisClient.status !== 'end') {
    redisClient.disconnect();
  }
};

export const getRedisStatus = () => ({
  configured: redisConfigured,
  available: isRedisReady(),
  status: redisClient ? redisClient.status : 'disabled',
});

// Test connections
export const testPostgresConnection = async (): Promise<void> => {
  const status = getConnectionStatus();
  if (status.isConnected) {
    logger.info('✅ MongoDB connected successfully');
  } else {
    throw new Error('MongoDB not connected');
  }
};

export const testRedisConnection = async (): Promise<void> => {
  if (!redisClient) {
    logger.info('ℹ️  Redis not configured');
    return;
  }
  try {
    await redisClient.ping();
    redisAvailable = true;
    redisDisabled = false;
    redisErrorLogged = false;
    logger.info('✅ Redis connected successfully');
  } catch (error) {
    markRedisUnavailable(error);
    logger.warn('⚠️  Redis ping failed — caching may be degraded:', error);
  }
};

export const getPoolStatus = () => {
  return getConnectionStatus();
};

export const pool = {
  query: async <TRow = any>(
    _query: string,
    _params?: any[],
  ): Promise<{ rows: TRow[]; rowCount: number }> => {
    logger.warn('pool.query called but SQL compatibility mode is active; returning empty result set');
    return { rows: [] as TRow[], rowCount: 0 };
  },
  end: async () => {
    // MongoDB connection management is in mongodb.ts
    logger.info('Database cleanup handled by mongodb.ts');
  },
};

export const closeConnections = async () => {
  if (redisClient) {
    redisClient.disconnect();
  }
  await pool.end();
};

export const redisHelpers = {
  async get(key: string): Promise<any | null> {
    if (!isRedisReady()) return null;
    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  },
  async set(key: string, value: unknown, ttlSeconds?: number): Promise<boolean> {
    if (!isRedisReady()) return false;
    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await redisClient.setex(key, ttlSeconds, serialized);
      } else {
        await redisClient.set(key, serialized);
      }
      return true;
    } catch {
      return false;
    }
  },
  async clearPattern(pattern: string): Promise<boolean> {
    if (!isRedisReady()) return false;
    try {
      const keys: string[] = await redisClient.keys(pattern);
      if (keys.length > 0) await redisClient.del(...keys);
      return true;
    } catch {
      return false;
    }
  },
};
