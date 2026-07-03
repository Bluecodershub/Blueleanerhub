// @ts-nocheck
import { Pool } from 'pg';

// Mock Winston logger
jest.mock('../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  log: jest.fn(),
}));

// Mock PostgreSQL pool
jest.mock('../src/utils/database', () => ({
  pool: {
    query: jest.fn(),
    connect: jest.fn(),
    end: jest.fn(),
  },
  redisClient: {
    get: jest.fn(),
    set: jest.fn(),
    setex: jest.fn(),
    del: jest.fn(),
    incr: jest.fn(),
    exists: jest.fn(),
    ping: jest.fn(),
    disconnect: jest.fn(),
  },
  redisHelpers: {
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
    clearPattern: jest.fn(),
    incr: jest.fn(),
    exists: jest.fn(),
  },
  testPostgresConnection: jest.fn(),
  testRedisConnection: jest.fn(),
}));

// Mock configuration
jest.mock('../src/config', () => ({
  config: {
    nodeEnv: 'test',
    port: 5000,
    jwt: {
      secret: 'test-secret',
      refreshSecret: 'test-refresh-secret',
      expiresIn: '7d',
      refreshExpiresIn: '30d',
    },
    database: {
      host: 'localhost',
      port: 5432,
      name: 'test_db',
      user: 'test_user',
      password: 'test_password',
      maxConnections: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    },
    redis: {
      host: 'localhost',
      port: 6379,
      password: 'test-password',
      db: 0,
    },
    corsOrigins: ['http://localhost:3000'],
    rateLimit: {
      windowMs: 15 * 60 * 1000,
      maxRequests: 100,
    },
    aiServiceUrl: 'http://localhost:8000',
  },
}));

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';

// Global test setup
beforeAll(async () => {
  // Any global setup
});

afterAll(async () => {
  // Clean up any global resources
});

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// Global test utilities
global.testUtils = {
  mockUser: {
    id: '1',
    email: 'test@example.com',
    role: 'user',
    fullName: 'Test User',
  },
  mockAdmin: {
    id: '2',
    email: 'admin@example.com',
    role: 'admin',
    fullName: 'Admin User',
  },
};
// Mock Drizzle ORM db (used by gamification controller/service)
jest.mock('../src/db', () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    values: jest.fn().mockResolvedValue([]),
    returning: jest.fn().mockResolvedValue([]),
  },
  LearningTrack: {
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  },
  TrackCourse: {
    find: jest.fn(),
  },
  TrackEnrollment: {
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    create: jest.fn(),
  },
  Course: {
    find: jest.fn(),
  },
  Certificate: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));
