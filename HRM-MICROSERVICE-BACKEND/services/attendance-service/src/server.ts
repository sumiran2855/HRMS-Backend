import 'reflect-metadata';
import { createApp } from './app';
import { initializeDatabase } from './bootstrap/db.bootstrap';
import { buildContainer } from './bootstrap/container.bootstrap';
import { initializeGrpcServer, startGrpcServer, shutdownGrpcServer, loadProtoDefinition, registerService, getGrpcServer } from './bootstrap/grpc.bootstrap';
import { AttendanceGrpcImpl } from './infrastructure/grpc/attendance.grpc.impl';
import { AuthGrpcClient } from './infrastructure/grpc/auth.grpc.client';
import { EmployeeGrpcClient } from './infrastructure/grpc/employee.grpc.client';
import { envConfig } from './config/env.config';
import { Logger } from './shared/utils/logger.util';

const logger = new Logger('Server');

async function bootstrap() {
  try {
    logger.info(`Starting Attendance Service in ${envConfig.nodeEnv} environment...`);

    logger.info("Initializing database connection...");
    await initializeDatabase();
    logger.info('✓ Database connected successfully');

    const container = buildContainer();
    logger.info('✓ DI container initialized');

    const authGrpcClient = container.get<AuthGrpcClient>(AuthGrpcClient);
    await authGrpcClient.initialize();
    logger.info('✓ Auth gRPC client initialized');

    const employeeGrpcClient = container.get<EmployeeGrpcClient>(EmployeeGrpcClient);
    await employeeGrpcClient.initialize();
    logger.info('✓ Employee gRPC client initialized');

    const app = createApp();

    const server = app.listen(envConfig.port, () => {
      logger.info(`✓ Server listening on port ${envConfig.port}`);
      logger.info(`✓ Environment: ${envConfig.nodeEnv}`);
      logger.info('✓ Attendance Service is ready!');
    });

    const grpcPort = envConfig.grpcAttendancePort || 5003;
    logger.info(`Initializing gRPC server on port ${grpcPort}...`);
    
    initializeGrpcServer();
    
    const attendanceGrpcImpl = container.get<AttendanceGrpcImpl>(AttendanceGrpcImpl);
    const proto = loadProtoDefinition("attendance.proto");
    
    registerService(getGrpcServer(), proto, "attendance.AttendanceService", {      
      createAttendance: (call: any, callback: any) => attendanceGrpcImpl.createAttendance(call, callback),
      getAttendanceById: (call: any, callback: any) => attendanceGrpcImpl.getAttendanceById(call, callback),
      getAttendanceByDateRange: (call: any, callback: any) => attendanceGrpcImpl.getAttendanceByDateRange(call, callback),
      updateAttendance: (call: any, callback: any) => attendanceGrpcImpl.updateAttendance(call, callback),
      deleteAttendance: (call: any, callback: any) => attendanceGrpcImpl.deleteAttendance(call, callback),
      approveAttendance: (call: any, callback: any) => attendanceGrpcImpl.approveAttendance(call, callback),
      getAttendanceSummary: (call: any, callback: any) => attendanceGrpcImpl.getAttendanceSummary(call, callback),
      bulkUpsertAttendance: (call: any, callback: any) => attendanceGrpcImpl.bulkUpsertAttendance(call, callback),
      getPendingApprovals: (call: any, callback: any) => attendanceGrpcImpl.getPendingApprovals(call, callback),
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
