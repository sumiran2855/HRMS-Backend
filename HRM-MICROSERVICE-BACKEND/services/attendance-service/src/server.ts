import "reflect-metadata";
import { createApp } from "./app";
import { initializeDatabase, disconnectDatabase } from "./bootstrap/db.bootstrap";
import {
  initializeGrpcServer,
  startGrpcServer,
  loadProtoDefinition,
  shutdownGrpcServer,
  registerService,
  getGrpcServer,
} from "./bootstrap/grpc.bootstrap";
import { buildContainer } from "./bootstrap/container.bootstrap";
import { AuthGrpcClient } from "./infrastructure/grpc/auth.grpc.client";
import { EmployeeGrpcClient } from "./infrastructure/grpc/employee.grpc.client";
import { AttendanceGrpcImpl } from "./infrastructure/grpc/attendance.grpc.impl";
import { envConfig } from "./config/env.config";
import { Logger } from "./shared/utils/logger.util";
import { RoleService } from "./application/services/role.service";
import { DEFAULT_ROLES, RoleEnum } from "./domain/entities/Role.entity";
  
const logger = new Logger("Server");

async function bootstrap(): Promise<void> {
  try {
    logger.info(`Starting Attendance Service in ${envConfig.nodeEnv} environment...`);

    logger.info("Initializing database connection...");
    await initializeDatabase();
    logger.info("✓ Database connected successfully");

    const container = buildContainer();
    logger.info("✓ Dependency injection container built");


    const roleService = container.get<RoleService>(RoleService);
    for (const roleName of Object.values(RoleEnum)) {
      const roleConfig = DEFAULT_ROLES[roleName as keyof typeof DEFAULT_ROLES];
      if (roleConfig) {
        const existingRole = await roleService.getRoleByName(roleConfig.name);
        if (!existingRole) {
          await roleService.createRole({
            name: roleConfig.name,
            description: roleConfig.description,
            permissions: roleConfig.permissions,
            organizationId: "default",
          });
          logger.info(`✓ Role ${roleConfig.name} initialized`);
        }
      }
    }
    logger.info('✓ Default roles ready');

    const app = createApp();

    const port = envConfig.port || 3003;
    const server = app.listen(port, () => {
      logger.info(`✓ Auth Service HTTP server running on port ${port}`);
      logger.info(`✓ Health check: http://localhost:${port}/health`);
    });

    const grpcPort = envConfig.grpcAttendancePort || 5003;
    logger.info(`Initializing gRPC server on port ${grpcPort}...`);
    
    initializeGrpcServer();
    
    const authClient = container.get<AuthGrpcClient>(AuthGrpcClient);
    const employeeClient = container.get<EmployeeGrpcClient>(EmployeeGrpcClient);
    const attendanceGrpcImpl = container.get<AttendanceGrpcImpl>(AttendanceGrpcImpl);

    await authClient.initialize();
    await employeeClient.initialize();
    logger.info("✓ gRPC clients initialized");
    
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
          await authClient.close();
          await employeeClient.close();
          await shutdownGrpcServer();
          await disconnectDatabase();
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
