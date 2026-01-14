import { Container } from "inversify";
import { Logger } from "../shared/utils/logger.util";
import { EmployeeRepository } from "../infrastructure/persistence/Employee.repository";
import { IEmployeeRepository } from "../domain/repositories/employee.repository";
import { EmployeeService } from "../application/services/employee.service.impl";
import { IEmployeeService } from "../application/services/employee.service";

export function initializeContainer(): Container {
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
    .bind<IEmployeeService>("EmployeeService")
    .to(EmployeeService)
    .inSingletonScope();

  return container;
}
