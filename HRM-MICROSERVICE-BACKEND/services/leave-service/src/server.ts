import 'reflect-metadata';
import { createApp } from './app';
import { initializeDatabase } from './bootstrap/db.bootstrap';
import { buildContainer } from './bootstrap/container.bootstrap';
import { initializeGrpcServer, startGrpcServer, shutdownGrpcServer, loadProtoDefinition, registerService, getGrpcServer } from './bootstrap/grpc.bootstrap';
import { LeaveGrpcImpl } from './infrastructure/grpc/leave.grpc.impl';
import { AuthGrpcClient } from './infrastructure/grpc/auth.grpc.client';
import { EmployeeGrpcClient } from './infrastructure/grpc/employee.grpc.client';
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

    // Initialize gRPC clients before creating proto definitions
    const authGrpcClient = container.get<AuthGrpcClient>(AuthGrpcClient);
    await authGrpcClient.initialize();
    logger.info('✓ Auth gRPC client initialized');

    const employeeGrpcClient = container.get<EmployeeGrpcClient>(EmployeeGrpcClient);
    await employeeGrpcClient.initialize();
    logger.info('✓ Employee gRPC client initialized');

    const app = createApp(container);

    const server = app.listen(envConfig.port, () => {
      logger.info(`✓ Server listening on port ${envConfig.port}`);
      logger.info(`✓ Environment: ${envConfig.nodeEnv}`);
      logger.info('✓ Leave Service is ready!');
    });

    const grpcPort = envConfig.grpcPort || 5004;
    logger.info(`Initializing gRPC server on port ${grpcPort}...`);
    
    initializeGrpcServer();
    
    const leaveGrpcImpl = container.get<LeaveGrpcImpl>(LeaveGrpcImpl);
    const proto = loadProtoDefinition("leave.proto");
    
    registerService(getGrpcServer(), proto, "leave.LeaveService", {      
      requestLeave: (call: any, callback: any) => leaveGrpcImpl.requestLeave(call, callback),
      approveLeave: (call: any, callback: any) => leaveGrpcImpl.approveLeave(call, callback),
      rejectLeave: (call: any, callback: any) => leaveGrpcImpl.rejectLeave(call, callback),
      cancelLeave: (call: any, callback: any) => leaveGrpcImpl.cancelLeave(call, callback),
      getLeaveById: (call: any, callback: any) => leaveGrpcImpl.getLeaveById(call, callback),
      getLeavesByEmployeeId: (call: any, callback: any) => leaveGrpcImpl.getLeavesByEmployeeId(call, callback),
      getAllLeaves: (call: any, callback: any) => leaveGrpcImpl.getAllLeaves(call, callback),
      getLeavesByStatus: (call: any, callback: any) => leaveGrpcImpl.getLeavesByStatus(call, callback),
      getLeaveBalance: (call: any, callback: any) => leaveGrpcImpl.getLeaveBalance(call, callback),
      initializeLeaveBalance: (call: any, callback: any) => leaveGrpcImpl.initializeLeaveBalance(call, callback),
      getLeaveTypes: (call: any, callback: any) => leaveGrpcImpl.getLeaveTypes(call, callback),
      createLeaveType: (call: any, callback: any) => leaveGrpcImpl.createLeaveType(call, callback),
    });
    
    await startGrpcServer(grpcPort);
    logger.info(`✓ gRPC server started on port ${grpcPort}`);

    const gracefulShutdown = async (signal: string) => {
      logger.info(`\n${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        logger.info("HTTP server closed");

        try {
          await shutdownGrpcServer();
          
          // Close gRPC clients
          await authGrpcClient.close();
          await employeeGrpcClient.close();
          
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
