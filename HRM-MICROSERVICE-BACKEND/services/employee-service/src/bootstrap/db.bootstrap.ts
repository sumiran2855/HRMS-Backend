import mongoose from 'mongoose';
import { envConfig } from '../config/env.config';
import { Logger } from '../shared/utils/logger.util';

const logger = new Logger('DatabaseBootstrap');

export async function initializeDatabase(): Promise<void> {
  try {
    await mongoose.connect(envConfig.mongodbUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    logger.info('✓ MongoDB connected');

    mongoose.connection.on('error', (error) => {
      logger.error('MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('✓ MongoDB reconnected');
    });

  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

export async function closeDatabase(): Promise<void> {
  try {
    await mongoose.disconnect();
    logger.info('✓ MongoDB disconnected');
  } catch (error) {
    logger.error('Error closing MongoDB connection:', error);
    throw error;
  }
}
