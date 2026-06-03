/**
 * Migration Script: Add Missing Compound Indexes
 * 
 * This script adds compound indexes to existing MongoDB collections
 * to improve query performance for common access patterns.
 * 
 * Usage: node scripts/add-compound-indexes.js
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017/bluelearnerhub';

async function addIndexes() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URL);
  console.log('Connected successfully');

  const db = mongoose.connection.db;

  const indexes = [
    {
      collection: 'quizattempts',
      index: { userId: 1, startedAt: -1 },
      name: 'user_quiz_history_idx',
    },
    {
      collection: 'quizattempts',
      index: { startedAt: -1 },
      name: 'recent_attempts_idx',
    },
    {
      collection: 'tutorials',
      index: { isPublished: 1, createdAt: -1 },
      name: 'published_tutorials_idx',
    },
    {
      collection: 'tutorials',
      index: { difficulty: 1, isPublished: 1 },
      name: 'difficulty_filter_idx',
    },
    {
      collection: 'exercises',
      index: { tags: 1 },
      name: 'exercise_tags_idx',
    },
    {
      collection: 'exercises',
      index: { createdBy: 1 },
      name: 'exercise_creator_idx',
    },
    {
      collection: 'jobs',
      index: { isActive: 1, createdAt: -1 },
      name: 'active_jobs_listing_idx',
    },
    {
      collection: 'jobs',
      index: { postedBy: 1 },
      name: 'job_creator_idx',
    },
    {
      collection: 'hackathons',
      index: { status: 1, startDate: -1 },
      name: 'hackathon_listing_idx',
    },
    {
      collection: 'hackathons',
      index: { createdBy: 1 },
      name: 'hackathon_creator_idx',
    },
  ];

  for (const { collection, index, name } of indexes) {
    try {
      await db.collection(collection).createIndex(index, { name });
      console.log(`✓ Created index ${name} on ${collection}`);
    } catch (error) {
      if (error.codeName === 'IndexOptionsConflict') {
        console.log(`○ Index ${name} already exists on ${collection}`);
      } else {
        console.error(`✗ Failed to create index ${name} on ${collection}:`, error.message);
      }
    }
  }

  console.log('\nIndex migration complete!');
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

addIndexes().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
