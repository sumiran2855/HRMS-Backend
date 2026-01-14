import { injectable, inject } from 'inversify';
import { IEmployeeRepository } from '../../domain/repositories/employee.repository';
import { IEmployeeService } from './employee.service';
import { Logger } from '../../shared/utils/logger.util';

@injectable()
export class EmployeeService implements IEmployeeService {
  private logger = new Logger('EmployeeService');

  constructor(
    @inject('EmployeeRepository')
    private employeeRepository: IEmployeeRepository
  ) {}

  async createEmployee(data: any): Promise<any> {
    this.logger.info('Creating employee:', data.email);
    return await this.employeeRepository.create(data);
  }

  async getEmployeeById(id: string): Promise<any> {
    this.logger.info('Getting employee:', id);
    return await this.employeeRepository.findById(id);
  }

  async getAllEmployees(filter?: any): Promise<any[]> {
    this.logger.info('Getting all employees');
    return await this.employeeRepository.findAll(filter);
  }

  async updateEmployee(id: string, data: any): Promise<any> {
    this.logger.info('Updating employee:', id);
    return await this.employeeRepository.update(id, data);
  }

  async deleteEmployee(id: string): Promise<boolean> {
    this.logger.info('Deleting employee:', id);
    return await this.employeeRepository.delete(id);
  }
}
