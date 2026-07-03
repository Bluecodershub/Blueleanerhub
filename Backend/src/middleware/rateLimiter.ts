import rateLimit, { Store, IncrementResponse, MemoryStore } from 'express-rate-limit';
import { config } from '../config';
import { isRedisReady, markRedisUnavailable, redisClient } from '../utils/database';

/**
 * Redis-backed store for express-rate-limit.
 * Falls back gracefully to in-memory behaviour when Redis is unavailable,
 * ensuring rate limiting still works in single-instance dev environments.
 *
 * Uses an atomic INCR + EXPIRE pipeline so multiple app instances share
 * the same counter and per-instance bypass is impossible.
 */
class RedisRateLimitStore implements Store {
  readonly prefix: string;
  private readonly windowMs: number;
  private readonly fallback = new MemoryStore();

  constructor(windowMs: number, prefix = 'rl:') {
    this.windowMs = windowMs;
    this.prefix = prefix;
  }

  init(options: Parameters<MemoryStore['init']>[0]): void {
    this.fallback.init(options);
  }

  async increment(key: string): Promise<IncrementResponse> {
    const ttlSeconds = Math.ceil(this.windowMs / 1000);
    const redisKey = `${this.prefix}${key}`;

    if (!isRedisReady()) {
      return this.fallback.increment(key);
    }

    try {
      const pipeline = redisClient.pipeline();
      pipeline.incr(redisKey);
      pipeline.expire(redisKey, ttlSeconds, 'NX'); // Only set TTL on first write
      const results = await pipeline.exec();
      const totalHits = (results?.[0]?.[1] as number) ?? 1;

      const remainingTtl = await redisClient.ttl(redisKey);
      const resetTime = remainingTtl > 0
        ? new Date(Date.now() + remainingTtl * 1000)
        : new Date(Date.now() + this.windowMs);

      return { totalHits, resetTime };
    } catch (error) {
      markRedisUnavailable(error);
      return this.fallback.increment(key);
    }
  }

  async decrement(key: string): Promise<void> {
    if (!isRedisReady()) {
      await this.fallback.decrement(key);
      return;
    }

    try {
      await redisClient.decr(`${this.prefix}${key}`);
    } catch (error) {
      markRedisUnavailable(error);
      await this.fallback.decrement(key);
    }
  }

  async resetKey(key: string): Promise<void> {
    if (!isRedisReady()) {
      await this.fallback.resetKey(key);
      return;
    }

    try {
      await redisClient.del(`${this.prefix}${key}`);
    } catch (error) {
      markRedisUnavailable(error);
      await this.fallback.resetKey(key);
    }
  }

  async resetAll(): Promise<void> {
    await this.fallback.resetAll();
  }

  shutdown(): void {
    this.fallback.shutdown();
  }
}

function makeStore(windowMs: number, prefix: string): Store {
  return new RedisRateLimitStore(windowMs, prefix);
}

export const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  store: makeStore(config.rateLimit.windowMs, 'rl:general:'),
  message: { success: false, message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  store: makeStore(15 * 60 * 1000, 'rl:auth:'),
  message: { success: false, message: 'Too many authentication attempts, please try again later' },
  skipSuccessfulRequests: true,
});

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  store: makeStore(60 * 1000, 'rl:api:'),
  message: { success: false, message: 'API rate limit exceeded' },
});

export const notebookIngestLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 8,
  store: makeStore(60 * 1000, 'rl:nb-ingest:'),
  message: { success: false, message: 'Notebook source ingestion rate limit exceeded' },
});

export const notebookAiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  store: makeStore(60 * 1000, 'rl:nb-ai:'),
  message: { success: false, message: 'Notebook AI request rate limit exceeded' },
});

export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  store: makeStore(15 * 60 * 1000, 'rl:upload:'),
  message: { success: false, message: 'Upload rate limit exceeded, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const strictLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  store: makeStore(60 * 1000, 'rl:strict:'),
  message: { success: false, message: 'Strict rate limit exceeded' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  store: makeStore(60 * 60 * 1000, 'rl:pw-reset:'),
  message: { success: false, message: 'Too many password reset requests. Please try again in an hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const webhookLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  store: makeStore(60 * 1000, 'rl:webhook:'),
  message: { success: false, message: 'Webhook rate limit exceeded' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => !!req.headers['stripe-signature'],
});

export const hackathonLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  store: makeStore(60 * 1000, 'rl:hackathon:'),
  message: { success: false, message: 'Hackathon rate limit exceeded. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const quizLimiter = rateLimit({
  windowMs: 30 * 1000,
  max: 20,
  store: makeStore(30 * 1000, 'rl:quiz:'),
  message: { success: false, message: 'Quiz rate limit exceeded' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const codeExecutionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  store: makeStore(60 * 1000, 'rl:code-exec:'),
  message: { success: false, message: 'Code execution limit exceeded. Wait before running again.' },
  standardHeaders: true,
  legacyHeaders: false,
});
