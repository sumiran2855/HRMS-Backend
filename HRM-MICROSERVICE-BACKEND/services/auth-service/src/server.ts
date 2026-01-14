import "reflect-metadata";
import { createApp } from "./app";
import { initializeDatabase } from "./bootstrap/db.bootstrap";
import { initializeGrpcServer, startGrpcServer, loadProtoDefinition, shutdownGrpcServer } from "./bootstrap/grpc.bootstrap";
import { buildContainer } from "./bootstrap/container.bootstrap";
import { AuthGrpcImpl } from "./infrastructure/grpc/auth.grpc";
import { envConfig } from "./config/env.config";
import { Logger } from "./shared/utils/logger.util";
import path from "path";

const logger = new Logger("Server");

async function bootstrap(): Promise<void> {
  try {
    logger.info(`Starting Auth Service in ${envConfig.nodeEnv} environment...`);

    logger.info("Initializing database connection...");
    await initializeDatabase();
    logger.info("Database connected successfully");

    const container = buildContainer();

    const app = createApp();

    const port = envConfig.port || 3001;
    const server = app.listen(port, () => {
      logger.info(`✓ Auth Service is running on port ${port}`);
      logger.info(`✓ Health check: http://localhost:${port}/health`);
    });

    const grpcPort = envConfig.grpcAuthPort || 5001;
    const grpcServer = initializeGrpcServer();
    
    const protoPath = path.join(__dirname, '../../proto');
    const protoFile = path.join(protoPath, '../proto/auth.proto');
    const proto = loadProtoDefinition(protoPath, protoFile);
    
    const authGrpcImpl = new AuthGrpcImpl(container);
    grpcServer.addService((proto as any).auth.AuthService.service, {
      register: (call: any, callback: any) => authGrpcImpl.register(call, callback),
      login: (call: any, callback: any) => authGrpcImpl.login(call, callback),
      validateToken: (call: any, callback: any) => authGrpcImpl.validateToken(call, callback),
      refreshToken: (call: any, callback: any) => authGrpcImpl.refreshToken(call, callback),
      getCurrentUser: (call: any, callback: any) => authGrpcImpl.getCurrentUser(call, callback),
      verifyUserExists: (call: any, callback: any) => authGrpcImpl.verifyUserExists(call, callback),
    });
    
    startGrpcServer(grpcServer, grpcPort).catch((error) => {
      logger.error("Failed to start gRPC server", error);
    });

    const gracefulShutdown = async (signal: string) => {
      logger.info(`\n${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        logger.info("HTTP server closed");

        try {
          await shutdownGrpcServer(grpcServer);
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
