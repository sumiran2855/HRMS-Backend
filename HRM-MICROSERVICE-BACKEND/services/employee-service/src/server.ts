import 'reflect-metadata';
import { createApp } from './app';
import { initializeDatabase } from './bootstrap/db.bootstrap';
import { initializeContainer } from './bootstrap/container.bootstrap';
import { initializeGrpcServer, startGrpcServer, shutdownGrpcServer, loadProtoDefinition } from './bootstrap/grpc.bootstrap';
import { EmployeeGrpcImpl } from './infrastructure/grpc/employee.grpc';
import { envConfig } from './config/env.config';
import { Logger } from './shared/utils/logger.util';
import path from 'path';

const logger = new Logger('Server');

async function bootstrap() {
  try {
    logger.info(`Starting Employee Service in ${envConfig.nodeEnv} environment...`);

    logger.info("Initializing database connection...");
    await initializeDatabase();
    logger.info('✓ Database connected successfully');

    logger.info("Initializing DI container...");
    const container = initializeContainer();
    logger.info('✓ DI container initialized');

    const app = createApp();

    const server = app.listen(envConfig.port, () => {
      logger.info(`✓ Server listening on port ${envConfig.port}`);
      logger.info(`✓ Environment: ${envConfig.nodeEnv}`);
      logger.info('✓ Employee Service is ready!');
    });

    const grpcPort = envConfig.grpcEmployeePort || 5002;
    const grpcServer = initializeGrpcServer();
    
    const employeeGrpcImpl = new EmployeeGrpcImpl(container);
    
    const protoPath = path.join(__dirname, '../../proto');
    const protoFile = path.join(protoPath, '../proto/employee.proto');
    const proto = loadProtoDefinition(protoPath, protoFile);
    
    grpcServer.addService((proto as any).employee.EmployeeService.service, {      
      createEmployee: (call: any, callback: any) => employeeGrpcImpl.createEmployee(call, callback),
      getEmployeeById: (call: any, callback: any) => employeeGrpcImpl.getEmployeeById(call, callback),
      getAllEmployees: (call: any, callback: any) => employeeGrpcImpl.getAllEmployees(call, callback),
      updateEmployee: (call: any, callback: any) => employeeGrpcImpl.updateEmployee(call, callback),
      deleteEmployee: (call: any, callback: any) => employeeGrpcImpl.deleteEmployee(call, callback),
      getEmployeeByEmail: (call: any, callback: any) => employeeGrpcImpl.getEmployeeByEmail(call, callback),
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
