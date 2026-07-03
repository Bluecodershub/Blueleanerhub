/**
 * Integration tests for MongoDB queries
 * 
 * These tests verify that the db.query.* methods work correctly
 * with actual MongoDB operations (using an in-memory test database).
 * 
 * Run: npm test -- tests/integration/db-queries.test.ts
 */

import mongoose from 'mongoose';
import { db } from '../../src/db';
import { User, Hackathon, Quiz, Tutorial } from '../../src/db/models';

// Test database connection. This suite is intentionally opt-in because it
// requires a real MongoDB test database outside Jest's unit-test sandbox.
const MONGODB_TEST_URL = process.env.MONGODB_TEST_URL;
const describeDbIntegration = MONGODB_TEST_URL ? describe : describe.skip;

beforeAll(async () => {
  if (!MONGODB_TEST_URL) return;
  await mongoose.connect(MONGODB_TEST_URL);
});

afterAll(async () => {
  if (!MONGODB_TEST_URL || mongoose.connection.readyState === 0) return;
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

beforeEach(async () => {
  if (!MONGODB_TEST_URL || mongoose.connection.readyState === 0) return;
  // Clear all collections before each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describeDbIntegration('db.query Integration Tests', () => {
  describe('Users', () => {
    it('should create a user', async () => {
      const userData = {
        email: 'test@example.com',
        fullName: 'Test User',
        passwordHash: 'hashed_password',
        role: 'STUDENT',
      };

      const user = await db.query.users.create(userData);
      expect(user).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.fullName).toBe(userData.fullName);
    });

    it('should find a user by email', async () => {
      await db.query.users.create({
        email: 'find@example.com',
        fullName: 'Find User',
        passwordHash: 'hashed',
        role: 'STUDENT',
      });

      const found = await db.query.users.findFirst({ email: 'find@example.com' });
      expect(found).toBeDefined();
      expect(found?.fullName).toBe('Find User');
    });

    it('should update a user', async () => {
      const user = await db.query.users.create({
        email: 'update@example.com',
        fullName: 'Original Name',
        passwordHash: 'hashed',
        role: 'STUDENT',
      });

      const updated = await db.query.users.updateById(user._id, {
        fullName: 'Updated Name',
      });

      expect(updated?.fullName).toBe('Updated Name');
    });

    it('should list users with pagination', async () => {
      // Create 25 users
      for (let i = 0; i < 25; i++) {
        await db.query.users.create({
          email: `user${i}@example.com`,
          fullName: `User ${i}`,
          passwordHash: 'hashed',
          role: 'STUDENT',
        });
      }

      const firstPage = await db.query.users.findMany({}).limit(10);
      expect(firstPage).toHaveLength(10);

      const secondPage = await db.query.users.findMany({}).limit(10).skip(10);
      expect(secondPage).toHaveLength(10);
    });
  });

  describe('Hackathons', () => {
    it('should create and find a hackathon', async () => {
      const user = await db.query.users.create({
        email: 'creator@example.com',
        fullName: 'Creator',
        passwordHash: 'hashed',
        role: 'ADMIN',
      });

      const hackathon = await db.query.hackathons.create({
        name: 'Test Hackathon',
        description: 'A test hackathon',
        theme: 'AI/ML',
        startDate: new Date('2026-06-01'),
        endDate: new Date('2026-06-03'),
        status: 'PUBLISHED',
        createdBy: user._id,
      });

      const found = await db.query.hackathons.findById(hackathon._id);
      expect(found?.name).toBe('Test Hackathon');
    });

    it('should filter hackathons by status', async () => {
      const user = await db.query.users.create({
        email: 'admin@example.com',
        fullName: 'Admin',
        passwordHash: 'hashed',
        role: 'ADMIN',
      });

      await db.query.hackathons.create({
        name: 'Active Hackathon',
        description: 'Active',
        theme: 'Web3',
        startDate: new Date('2026-05-01'),
        endDate: new Date('2026-05-03'),
        status: 'ACTIVE',
        createdBy: user._id,
      });

      await db.query.hackathons.create({
        name: 'Draft Hackathon',
        description: 'Draft',
        theme: 'AI',
        startDate: new Date('2026-07-01'),
        endDate: new Date('2026-07-03'),
        status: 'DRAFT',
        createdBy: user._id,
      });

      const active = await db.query.hackathons.findMany({ status: 'ACTIVE' });
      expect(active).toHaveLength(1);
      expect(active[0].name).toBe('Active Hackathon');
    });
  });

  describe('Quizzes', () => {
    it('should create a quiz with questions', async () => {
      const user = await db.query.users.create({
        email: 'teacher@example.com',
        fullName: 'Teacher',
        passwordHash: 'hashed',
        role: 'MENTOR',
      });

      const quiz = await db.query.quizzes.create({
        title: 'JavaScript Basics',
        description: 'Test your JS knowledge',
        questions: [
          {
            id: 'q1',
            question: 'What is 2+2?',
            options: ['3', '4', '5', '6'],
            correctIndex: 1,
          },
        ],
        difficulty: 'EASY',
        createdBy: user._id,
      });

      expect(quiz.questions).toHaveLength(1);
      expect(quiz.questions[0].question).toBe('What is 2+2?');
    });
  });

  describe('Pagination Helper', () => {
    it('should paginate results correctly', async () => {
      // Create 50 tutorials
      for (let i = 0; i < 50; i++) {
        await db.query.tutorials.create({
          title: `Tutorial ${i}`,
          description: `Description ${i}`,
          category: 'programming',
          path: `tutorial-${i}`,
          difficulty: 'BEGINNER',
          isPublished: true,
          lessons: [],
        });
      }

      const page1 = await db.paginate(Tutorial, {}, { limit: 20 });
      expect(page1.items).toHaveLength(20);
      expect(page1.hasNextPage).toBe(true);
      expect(page1.nextCursor).toBeDefined();

      const page2 = await db.paginate(Tutorial, {}, {
        limit: 20,
        cursor: page1.nextCursor!,
      });
      expect(page2.items).toHaveLength(20);
      expect(page2.hasNextPage).toBe(true);

      const page3 = await db.paginate(Tutorial, {}, {
        limit: 20,
        cursor: page2.nextCursor!,
      });
      expect(page3.items).toHaveLength(10);
      expect(page3.hasNextPage).toBe(false);
      expect(page3.nextCursor).toBeNull();
    });
  });

  describe('Transactions', () => {
    it('should commit transaction successfully', async () => {
      const result = await db.transaction(async (tx) => {
        const user = await tx.query.users.create({
          email: 'tx-user@example.com',
          fullName: 'Transaction User',
          passwordHash: 'hashed',
          role: 'STUDENT',
        });

        await tx.query.hackathons.create({
          name: 'TX Hackathon',
          description: 'Created in transaction',
          theme: 'Test',
          startDate: new Date('2026-08-01'),
          endDate: new Date('2026-08-03'),
          status: 'DRAFT',
          createdBy: user._id,
        });

        return { user };
      });

      expect(result.user).toBeDefined();
      const foundUser = await db.query.users.findFirst({ email: 'tx-user@example.com' });
      expect(foundUser).toBeDefined();
    });

    it('should rollback transaction on error', async () => {
      try {
        await db.transaction(async (tx) => {
          await tx.query.users.create({
            email: 'rollback-user@example.com',
            fullName: 'Rollback User',
            passwordHash: 'hashed',
            role: 'STUDENT',
          });

          // Simulate an error
          throw new Error('Intentional failure');
        });
      } catch (error) {
        // Expected error
      }

      const found = await db.query.users.findFirst({ email: 'rollback-user@example.com' });
      expect(found).toBeNull();
    });
  });
});
