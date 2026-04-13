import mongoose from "mongoose";
import { Logger } from "../shared/utils/logger.util";
import { envConfig } from "../config/env.config";

const logger = new Logger("DatabaseBootstrap");

export async function initializeDatabase(): Promise<void> {
  try {
    logger.info("Initializing database connection...");

    await mongoose.connect(envConfig.mongodbUri, {
      maxPoolSize: 10,
      minPoolSize: 5,
    });

    logger.info("✓ Database connected successfully");
  } catch (error) {
    logger.error("Database connection failed:", error);
    throw error;
  }
}

export async function closeDatabase(): Promise<void> {
  try {
    await mongoose.disconnect();
    logger.info("✓ Database disconnected successfully");
  } catch (error) {
    logger.error("Database disconnect failed:", error);
    throw error;
  }
}
