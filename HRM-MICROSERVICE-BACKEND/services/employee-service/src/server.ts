import 'reflect-metadata';
import { createApp } from './app';
import { initializeDatabase } from './bootstrap/db.bootstrap';
import { buildContainer } from './bootstrap/container.bootstrap';
import { initializeGrpcServer, startGrpcServer, shutdownGrpcServer, loadProtoDefinition, registerService, getGrpcServer } from './bootstrap/grpc.bootstrap';
import { EmployeeGrpcImpl } from './infrastructure/grpc/employee.grpc.impl';
import { envConfig } from './config/env.config';
import { Logger } from './shared/utils/logger.util';
import path from 'path';
import { RoleService } from './application/services/role.service';
import { DEFAULT_ROLES, RoleEnum } from './domain/entities/Role.entity';

const logger = new Logger('Server');

async function bootstrap() {
  try {
    logger.info(`Starting Employee Service in ${envConfig.nodeEnv} environment...`);

    logger.info("Initializing database connection...");
    await initializeDatabase();
    logger.info('✓ Database connected successfully');

    const container = buildContainer();
    logger.info('✓ DI container initialized');

    // Initialize default roles
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

    const app = createApp(container);

    const server = app.listen(envConfig.port, () => {
      logger.info(`✓ Server listening on port ${envConfig.port}`);
      logger.info(`✓ Environment: ${envConfig.nodeEnv}`);
      logger.info('✓ Employee Service is ready!');
    });

    const grpcPort = envConfig.grpcEmployeePort || 5002;
    logger.info(`Initializing gRPC server on port ${grpcPort}...`);
    
    initializeGrpcServer();
    
    const employeeGrpcImpl = container.get<EmployeeGrpcImpl>(EmployeeGrpcImpl);
    const proto = loadProtoDefinition("employee.proto");
    
    registerService(getGrpcServer(), proto, "employee.EmployeeService", {      
      createEmployee: (call: any, callback: any) => employeeGrpcImpl.createEmployee(call, callback),
      getEmployeeById: (call: any, callback: any) => employeeGrpcImpl.getEmployeeById(call, callback),
      getAllEmployees: (call: any, callback: any) => employeeGrpcImpl.getAllEmployees(call, callback),
      updateEmployee: (call: any, callback: any) => employeeGrpcImpl.updateEmployee(call, callback),
      deleteEmployee: (call: any, callback: any) => employeeGrpcImpl.deleteEmployee(call, callback),
      getEmployeeByEmail: (call: any, callback: any) => employeeGrpcImpl.getEmployeeByEmail(call, callback),
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
