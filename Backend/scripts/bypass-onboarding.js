const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URL = process.env.MONGODB_URL;

if (!MONGODB_URL) {
  console.error('❌ MONGODB_URL is not configured in environment.');
  process.exit(1);
}

console.log('Connecting to database:', MONGODB_URL);

mongoose.connect(MONGODB_URL, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
}).then(async () => {
  console.log('✅ Connected. Updating user onboarding status...');
  
  const email = 'devtester@bluelearner.org';
  const collection = mongoose.connection.db.collection('users');
  
  const result = await collection.updateOne(
    { email: email },
    { $set: { domain: 'Computer Science' } }
  );
  
  console.log('Update result:', result);
  
  if (result.matchedCount > 0) {
    console.log('🎉 Successfully bypassed onboarding for devtester@bluelearner.org!');
  } else {
    console.log('⚠️ No user matched devtester@bluelearner.org. Please register first.');
  }
  
  mongoose.connection.close();
}).catch(err => {
  console.error('❌ Database error:', err);
  process.exit(1);
});
