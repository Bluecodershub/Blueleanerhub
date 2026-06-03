// Simple MongoDB connection test
const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URL = process.env.MONGODB_URL || 
  'mongodb+srv://YOUR_MONGODB_USERNAME:YOUR_MONGODB_PASSWORD@your-mongodb-cluster.mongodb.net/bluelearnerhub?appName=Bluelearnerhub';

console.log('Testing MongoDB connection...');
console.log('URL:', MONGODB_URL);

mongoose.connect(MONGODB_URL, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
}).then(() => {
  console.log('✅ MongoDB Connected!');
  mongoose.connection.close();
}).catch(err => {
  console.error('❌ MongoDB Error:', err.message);
});
