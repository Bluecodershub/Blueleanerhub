const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/bluelearnerhub';

if (!MONGODB_URL) {
  console.error('❌ MONGODB_URL is not configured.');
  process.exit(1);
}

console.log('Connecting to database:', MONGODB_URL);

mongoose.connect(MONGODB_URL, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
}).then(async () => {
  console.log('✅ Connected. Seeding test users...');

  const collection = mongoose.connection.db.collection('users');
  const password = 'Password123!';
  
  // Generate same hash for all test accounts
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  const testUsers = [
    {
      email: 'student@bluelearnerhub.com',
      fullName: 'Test Student',
      role: 'STUDENT',
      passwordHash: passwordHash,
      domain: 'computer-science',
      collegeName: 'State Tech University',
      graduationYear: 2028,
      educationLevel: 'Bachelor of Technology',
      bio: 'Aspiring software developer exploring full-stack engineering.',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      email: 'mentor@bluelearnerhub.com',
      fullName: 'Test Mentor',
      role: 'MENTOR',
      passwordHash: passwordHash,
      domain: 'computer-science',
      bio: 'Senior engineering lead passionate about mentoring candidates.',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      email: 'corporate@bluelearnerhub.com',
      fullName: 'Test Corporate Recruiter',
      role: 'CORPORATE',
      passwordHash: passwordHash,
      company: 'TechCorp Solutions',
      bio: 'Talent acquisition head searching for top engineering stars.',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      email: 'admin@bluelearnerhub.com',
      fullName: 'Test Administrator',
      role: 'ADMIN',
      passwordHash: passwordHash,
      bio: 'System super-administrator.',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  for (const user of testUsers) {
    const result = await collection.updateOne(
      { email: user.email },
      { $set: user },
      { upsert: true }
    );
    console.log(`Upserted ${user.email} (Role: ${user.role}). Matched: ${result.matchedCount}, Upserted: ${result.upsertedCount}`);
  }

  console.log('\n🎉 Test users successfully registered!');
  console.log('\n======================================');
  console.log('Test Accounts Configuration:');
  console.log('--------------------------------------');
  console.log('Password for all accounts: Password123!\n');
  console.log('1. Student Account:');
  console.log('   - Email: student@bluelearnerhub.com');
  console.log('2. Mentor Account:');
  console.log('   - Email: mentor@bluelearnerhub.com');
  console.log('3. Corporate Account:');
  console.log('   - Email: corporate@bluelearnerhub.com');
  console.log('4. Admin Account:');
  console.log('   - Email: admin@bluelearnerhub.com');
  console.log('======================================\n');

  mongoose.connection.close();
}).catch(err => {
  console.error('❌ Database connection or seeding error:', err);
  process.exit(1);
});
