import mongoose from 'mongoose';
import { envConfig } from '../../config/env.config';

export async function connectToDatabase(): Promise<void> {
  try {
    await mongoose.connect(envConfig.mongodbUri);
    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

export async function disconnectFromDatabase(): Promise<void> {
  try {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Failed to disconnect from MongoDB:', error);
  }
}
