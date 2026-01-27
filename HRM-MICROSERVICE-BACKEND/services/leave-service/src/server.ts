import 'reflect-metadata';
import { createApp } from './app';
import { initializeDatabase } from './bootstrap/db.bootstrap';
import { buildContainer } from './bootstrap/container.bootstrap';
import { initializeGrpcServer, startGrpcServer, shutdownGrpcServer, loadProtoDefinition, registerService, getGrpcServer } from './bootstrap/grpc.bootstrap';
import { envConfig } from './config/env.config';
import { Logger } from './shared/utils/logger.util';

const logger = new Logger('Server');

async function bootstrap() {
  try {
    logger.info(`Starting Leave Service in ${envConfig.nodeEnv} environment...`);

    logger.info("Initializing database connection...");
    await initializeDatabase();
    logger.info('✓ Database connected successfully');

    const container = buildContainer();
    logger.info('✓ DI container initialized');

    const app = createApp(container);

    const server = app.listen(envConfig.port, () => {
      logger.info(`✓ Server listening on port ${envConfig.port}`);
      logger.info(`✓ Environment: ${envConfig.nodeEnv}`);
      logger.info('✓ Leave Service is ready!');
    });

    const grpcPort = envConfig.grpcPort || 5004;
    logger.info(`Initializing gRPC server on port ${grpcPort}...`);
    
    initializeGrpcServer();
    
    const proto = loadProtoDefinition("leave.proto");
    const leaveProto = proto.leave || proto;
    
    registerService(getGrpcServer(), proto, "leave.LeaveService", {      
      createLeave: (call: any, callback: any) => {
        callback({
          code: 12,
          details: "Not implemented",
        });
      },
      getLeaveById: (call: any, callback: any) => {
        callback({
          code: 12,
          details: "Not implemented",
        });
      },
      getLeaveByEmployeeId: (call: any, callback: any) => {
        callback({
          code: 12,
          details: "Not implemented",
        });
      },
      getAllLeaves: (call: any, callback: any) => {
        callback({
          code: 12,
          details: "Not implemented",
        });
      },
      updateLeave: (call: any, callback: any) => {
        callback({
          code: 12,
          details: "Not implemented",
        });
      },
      deleteLeave: (call: any, callback: any) => {
        callback({
          code: 12,
          details: "Not implemented",
        });
      },
    });
    
    await startGrpcServer(grpcPort);
    logger.info(`✓ gRPC server started on port ${grpcPort}`);

    const gracefulShutdown = async (signal: string) => {
      logger.info(`\n${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        logger.info("HTTP server closed");

        try {
          await shutdownGrpcServer();
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

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    process.on("uncaughtException", (error) => {
      logger.error("Uncaught Exception", error);
      process.exit(1);
    });

    process.on("unhandledRejection", (reason, promise) => {
      logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
      process.exit(1);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
