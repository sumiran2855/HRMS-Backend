import "reflect-metadata";
import { createApp } from "./app";
import { initializeDatabase } from "./bootstrap/db.bootstrap";
import { initializeGrpcServer, startGrpcServer, loadProtoDefinition, shutdownGrpcServer, registerService, getGrpcServer } from "./bootstrap/grpc.bootstrap";
import { buildContainer } from "./bootstrap/container.bootstrap";
import { initializeDefaultRoles } from "./bootstrap/role.initializer";
import { AuthGrpcImpl } from "./infrastructure/grpc/auth.grpc.impl";
import { EmployeeGrpcClient } from "./infrastructure/grpc/employee.grpc.client";
import { RoleService } from "./application/services/role.service";
import { envConfig } from "./config/env.config";
import { Logger } from "./shared/utils/logger.util";

const logger = new Logger("Server");

async function bootstrap(): Promise<void> {
  try {
    logger.info(`Starting Auth Service in ${envConfig.nodeEnv} environment...`);

    logger.info("Initializing database connection...");
    await initializeDatabase();
    logger.info("✓ Database connected successfully");

    const container = buildContainer();
    logger.info("✓ Dependency injection container built");

    logger.info("Initializing default roles...");
    const roleService = container.get<RoleService>(RoleService);
    await initializeDefaultRoles(roleService);
    logger.info("✓ Default roles initialized");

    const app = createApp();

    const port = envConfig.port || 3001;
    const server = app.listen(port, () => {
      logger.info(`✓ Auth Service HTTP server running on port ${port}`);
      logger.info(`✓ Health check: http://localhost:${port}/health`);
    });

    const grpcPort = envConfig.grpcAuthPort || 5001;
    logger.info(`Initializing gRPC server on port ${grpcPort}...`);
    
    initializeGrpcServer();
    
    const employeeClient = container.get<EmployeeGrpcClient>(EmployeeGrpcClient);
    await employeeClient.initialize();
    logger.info("✓ gRPC clients initialized");

    const authGrpcImpl = container.get<AuthGrpcImpl>(AuthGrpcImpl);
    const proto = loadProtoDefinition("auth.proto");
    
    registerService(getGrpcServer(), proto, "auth.AuthService", {
      register: (call: any, callback: any) => authGrpcImpl.register(call, callback),
      login: (call: any, callback: any) => authGrpcImpl.login(call, callback),
      validateToken: (call: any, callback: any) => authGrpcImpl.validateToken(call, callback),
      refreshToken: (call: any, callback: any) => authGrpcImpl.refreshToken(call, callback),
      getCurrentUser: (call: any, callback: any) => authGrpcImpl.getCurrentUser(call, callback),
      verifyUserExists: (call: any, callback: any) => authGrpcImpl.verifyUserExists(call, callback),
    });
    
    await startGrpcServer(grpcPort);
    logger.info(`✓ gRPC server started on port ${grpcPort}`);

    const gracefulShutdown = async (signal: string) => {
      logger.info(`\n${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        logger.info("HTTP server closed");

        try {
          await employeeClient.close();
          await shutdownGrpcServer();
          logger.info("✓ All resources cleaned up");
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
