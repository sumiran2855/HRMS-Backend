import mongoose from "mongoose";

import { Logger } from "../shared/utils/logger.util";

const logger = new Logger("DatabaseBootstrap");

export async function initializeDatabase(): Promise<void> {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/attendance-service";

    logger.info("Connecting to MongoDB...", { uri: mongoUri });

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      autoIndex: true,
    });

    logger.info("✓ MongoDB connected successfully");


    mongoose.connection.on("error", (error) => {
      logger.error("MongoDB connection error", error);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected");
    });

    mongoose.connection.on("reconnected", () => {
      logger.info("✓ MongoDB reconnected");
    });
  } catch (error) {
    logger.error("Failed to connect to MongoDB", error);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await mongoose.disconnect();
    logger.info("✓ MongoDB disconnected successfully");
  } catch (error) {
    logger.error("Error disconnecting from MongoDB", error);
    throw error;
  }
}

export function getConnection(): mongoose.Connection {
  return mongoose.connection;
}
