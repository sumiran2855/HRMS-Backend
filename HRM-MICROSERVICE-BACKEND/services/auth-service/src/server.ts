import "reflect-metadata";
import { createApp } from "./app";
import { initializeDatabase } from "./bootstrap/db.bootstrap";
import { envConfig } from "./config/env.config";
import { Logger } from "./shared/utils/logger.util";

const logger = new Logger("Server");

async function bootstrap(): Promise<void> {
  try {
    logger.info(`Starting Auth Service in ${envConfig.nodeEnv} environment...`);

    logger.info("Initializing database connection...");
    await initializeDatabase();
    logger.info("Database connected successfully");

    const app = createApp();

    const port = envConfig.port || 3001;
    const server = app.listen(port, () => {
      logger.info(`✓ Auth Service is running on port ${port}`);
      logger.info(`✓ Health check: http://localhost:${port}/health`);
    });

    const gracefulShutdown = async (signal: string) => {
      logger.info(`\n${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        logger.info("HTTP server closed");

        try {
          logger.info("All resources cleaned up");
          process.exit(0);
        } catch (error) {
          logger.error("Error during shutdown", error);
          process.exit(1);
        }
      });

      setTimeout(() => {
        logger.error("Forced shutdown after timeout");
        process.exit(1);
      }, 30000);
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

    process.on("uncaughtException", (error) => {
      logger.error("Uncaught Exception", error);
      process.exit(1);
    });

    process.on("unhandledRejection", (reason, promise) => {
      logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
      process.exit(1);
    });
  } catch (error) {
    logger.error("Failed to start server", error);
    process.exit(1);
  }
}

bootstrap();
