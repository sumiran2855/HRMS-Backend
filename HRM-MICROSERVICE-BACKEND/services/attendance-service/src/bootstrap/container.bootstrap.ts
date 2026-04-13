import "reflect-metadata";
import { Container } from "inversify";
import { AttendanceService } from "../application/services/AttendanceService";
import { AttendanceRepository } from "../infrastructure/persistence/attendance.repository";
import { IAttendanceRepository } from "../application/ports/AttendanceRepository.port";
import { AttendanceController } from "../interface/http/AttendanceController";
import { RoleService } from "../application/services/role.service"
import { RoleRepository, IRoleRepository } from "../domain/repositories/role.repository";
import { AuthGrpcClient } from "../infrastructure/grpc/auth.grpc.client";
import { EmployeeGrpcClient } from "../infrastructure/grpc/employee.grpc.client";
import { AttendanceGrpcImpl } from "../infrastructure/grpc/attendance.grpc.impl";
import { envConfig } from "../config/env.config";
import {
  CreateAttendanceHandler,
  UpdateAttendanceHandler,
  DeleteAttendanceHandler,
  ApproveAttendanceHandler,
  GetAttendanceByDateRangeHandler,
  GetAttendanceSummaryHandler,
  BulkUpsertAttendanceHandler,
} from "../application/handlers/Attendance.handler";

export function buildContainer(): Container {
  const container = new Container();

  container
    .bind<IAttendanceRepository>("AttendanceRepository")
    .to(AttendanceRepository)
    .inSingletonScope();

  container
    .bind<IRoleRepository>("RoleRepository")
    .to(RoleRepository)
    .inSingletonScope();

  container
    .bind<AttendanceService>("AttendanceService")
    .to(AttendanceService)
    .inSingletonScope();

  container
    .bind<RoleService>(RoleService)
    .toSelf()
    .inSingletonScope();

  container
    .bind<AttendanceController>(AttendanceController)
    .toSelf()
    .inSingletonScope();

  const authGrpcClient = new AuthGrpcClient(envConfig.authServiceUrl);
  container
    .bind<AuthGrpcClient>(AuthGrpcClient)
    .toConstantValue(authGrpcClient);

  const employeeGrpcClient = new EmployeeGrpcClient(envConfig.employeeServiceUrl);
  container
    .bind<EmployeeGrpcClient>(EmployeeGrpcClient)
    .toConstantValue(employeeGrpcClient);

  container
    .bind<AttendanceGrpcImpl>(AttendanceGrpcImpl)
    .toSelf()
    .inSingletonScope();

  container
    .bind<CreateAttendanceHandler>(CreateAttendanceHandler)
    .toSelf()
    .inTransientScope();

  container
    .bind<UpdateAttendanceHandler>(UpdateAttendanceHandler)
    .toSelf()
    .inTransientScope();

  container
    .bind<DeleteAttendanceHandler>(DeleteAttendanceHandler)
    .toSelf()
    .inTransientScope();

  container
    .bind<ApproveAttendanceHandler>(ApproveAttendanceHandler)
    .toSelf()
    .inTransientScope();

  container
    .bind<GetAttendanceByDateRangeHandler>(GetAttendanceByDateRangeHandler)
    .toSelf()
    .inTransientScope();

  container
    .bind<GetAttendanceSummaryHandler>(GetAttendanceSummaryHandler)
    .toSelf()
    .inTransientScope();

  container
    .bind<BulkUpsertAttendanceHandler>(BulkUpsertAttendanceHandler)
    .toSelf()
    .inTransientScope();

  return container;
}

export const container = buildContainer();
