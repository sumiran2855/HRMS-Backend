import "reflect-metadata";
import { Container } from "inversify";
import { LeaveRepository } from "../domain/repositories/leave.repository";
import { LeaveBalanceRepository } from "../domain/repositories/leave-balance.repository";
import { LeaveTypeRepository } from "../domain/repositories/leave-type.repository";
import { LeaveService, ILeaveService } from "../application/services/leave.service";
import { LeaveBalanceService, ILeaveBalanceService } from "../application/services/leave-balance.service";
import { LeaveTypeService, ILeaveTypeService } from "../application/services/leave-type.service";
import { LeaveController } from "../interfaces/http/controllers/Leave.controller";
import { AuthGrpcClient } from "../infrastructure/grpc/auth.grpc.client";
import { EmployeeGrpcClient } from "../infrastructure/grpc/employee.grpc.client";
import { LeaveGrpcImpl } from "../infrastructure/grpc/leave.grpc.impl";
import { envConfig } from "../config/env.config";

export function buildContainer(): Container {
  const container = new Container();

  // Register repositories
  container
    .bind<LeaveRepository>("LeaveRepository")
    .to(LeaveRepository)
    .inSingletonScope();
  container
    .bind<LeaveBalanceRepository>("LeaveBalanceRepository")
    .to(LeaveBalanceRepository)
    .inSingletonScope();
  container
    .bind<LeaveTypeRepository>("LeaveTypeRepository")
    .to(LeaveTypeRepository)
    .inSingletonScope();

  // Register services
  container
    .bind<ILeaveService>("LeaveService")
    .to(LeaveService)
    .inSingletonScope();
  container
    .bind<ILeaveBalanceService>("LeaveBalanceService")
    .to(LeaveBalanceService)
    .inSingletonScope();
  container
    .bind<ILeaveTypeService>("LeaveTypeService")
    .to(LeaveTypeService)
    .inSingletonScope();

  // Register controllers
  container.bind(LeaveController).toSelf().inSingletonScope();

  // Register gRPC clients
  const authGrpcClient = new AuthGrpcClient(envConfig.authServiceUrl);
  container
    .bind<AuthGrpcClient>(AuthGrpcClient)
    .toConstantValue(authGrpcClient);

  const employeeGrpcClient = new EmployeeGrpcClient(envConfig.employeeServiceUrl);
  container
    .bind<EmployeeGrpcClient>(EmployeeGrpcClient)
    .toConstantValue(employeeGrpcClient);

  // Register gRPC implementation
  container
    .bind<LeaveGrpcImpl>(LeaveGrpcImpl)
    .toSelf()
    .inSingletonScope();

  return container;
}
