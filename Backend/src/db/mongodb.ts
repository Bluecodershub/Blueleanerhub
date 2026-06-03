import mongoose from 'mongoose';
import { config } from '../config';
import logger from '../utils/logger';

// MongoDB connection
let isConnected = false;

export async function connectDB(): Promise<typeof mongoose> {
  if (isConnected) {
    return mongoose;
  }

  const mongoUri = config.database.url;

  if (!mongoUri) {
    throw new Error('MONGODB_URL is not configured. Set it in your environment.');
  }

  try {
    await mongoose.connect(mongoUri, {
      maxPoolSize: 50,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    logger.info('✅ MongoDB connected successfully');

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
      isConnected = false;
    });

    return mongoose;
  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

export async function closeDB(): Promise<void> {
  try {
    await mongoose.connection.close();
    isConnected = false;
    logger.info('✅ MongoDB connection closed');
  } catch (error) {
    logger.error('Error closing MongoDB connection:', error);
  }
}

export function getDBStatus() {
  return {
    isConnected,
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host,
    name: mongoose.connection.name,
  };
}

export const connectDatabase = connectDB;
export const closeDatabase = closeDB;
export const getConnectionStatus = getDBStatus;

export default mongoose;
