import { connectToDatabase } from "../infrastructure/database/mongodb.connection";
import { Logger } from "../shared/utils/logger.util";

const logger = new Logger("DatabaseBootstrap");

/**
 * Database Initialization
 * Establishes connection to MongoDB
 */
export async function initializeDatabase(): Promise<void> {
  try {
    await connectToDatabase();
    logger.info("Database initialization completed successfully");
  } catch (error) {
    logger.error("Database initialization failed", error);
    throw error;
  }
}
