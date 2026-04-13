import { Container } from "inversify";
import { Logger } from "../shared/utils/logger.util";
import { EmployeeRepository } from "../infrastructure/persistence/Employee.repository";
import { IEmployeeRepository } from "../domain/repositories/employee.repository";
import { EmployeeService } from "../application/services/employee.service.impl";
import { IEmployeeService } from "../application/services/employee.service";
import { RoleService } from "../application/services/role.service";
import { RoleRepository, IRoleRepository } from "../domain/repositories/role.repository";
import { EmployeeGrpcImpl } from "../infrastructure/grpc/employee.grpc";
import { EmployeeController } from "../interfaces/http/controllers/Employee.controller";
import { AuthGrpcClient } from "../infrastructure/grpc/auth.grpc.client";

export function buildContainer(): Container {
  const container = new Container();

  container
    .bind<Logger>("Logger")
    .to(Logger)
    .inSingletonScope();

  container
    .bind<IEmployeeRepository>("EmployeeRepository")
    .to(EmployeeRepository)
    .inSingletonScope();

  container
    .bind<IRoleRepository>("RoleRepository")
    .to(RoleRepository)
    .inSingletonScope();

  container
    .bind<IEmployeeService>("EmployeeService")
    .to(EmployeeService)
    .inSingletonScope();

  container
    .bind<AuthGrpcClient>(AuthGrpcClient)
    .toSelf()
    .inSingletonScope();

  container
    .bind<RoleService>(RoleService)
    .toSelf()
    .inSingletonScope();

  container
    .bind<EmployeeGrpcImpl>(EmployeeGrpcImpl)
    .toSelf()
    .inSingletonScope();

  container
    .bind<EmployeeController>(EmployeeController)
    .toSelf()
    .inTransientScope();

  return container;
}

export const initializeContainer = buildContainer;
