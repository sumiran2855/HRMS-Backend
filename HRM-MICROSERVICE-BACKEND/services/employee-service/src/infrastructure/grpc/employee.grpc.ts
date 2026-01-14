import * as grpc from '@grpc/grpc-js';
import { Container } from 'inversify';
import { IEmployeeService } from '../../application/services/employee.service';
import { Logger } from '../../shared/utils/logger.util';

const logger = new Logger('EmployeeGrpcImpl');

export class EmployeeGrpcImpl {
  private employeeService: IEmployeeService;

  constructor(container: Container) {
    this.employeeService = container.get<IEmployeeService>('EmployeeService');
  }

  async createEmployee(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const { firstName, lastName, email, department, position, phoneNumber } =
        call.request;

      logger.debug('gRPC: Creating employee', email);

      const result = await this.employeeService.createEmployee({
        firstName,
        lastName,
        email,
        department,
        position,
        phoneNumber,
      });

      callback(null, {
        success: true,
        message: 'Employee created successfully',
        data: result,
      });
    } catch (error: any) {
      logger.error('gRPC: Failed to create employee', error);
      callback({
        code: grpc.status.INTERNAL,
        message: error.message || 'Failed to create employee',
      });
    }
  }

  async getEmployeeById(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const { id } = call.request;

      logger.debug('gRPC: Getting employee', id);

      const result = await this.employeeService.getEmployeeById(id);

      if (!result) {
        callback({
          code: grpc.status.NOT_FOUND,
          message: 'Employee not found',
        });
        return;
      }

      callback(null, {
        success: true,
        message: 'Employee retrieved successfully',
        data: result,
      });
    } catch (error: any) {
      logger.error('gRPC: Failed to get employee', error);
      callback({
        code: grpc.status.INTERNAL,
        message: error.message || 'Failed to get employee',
      });
    }
  }

  async getAllEmployees(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const { filter } = call.request;

      logger.debug('gRPC: Getting all employees');

      const results = await this.employeeService.getAllEmployees(filter);

      callback(null, {
        success: true,
        message: 'Employees retrieved successfully',
        data: results,
      });
    } catch (error: any) {
      logger.error('gRPC: Failed to get all employees', error);
      callback({
        code: grpc.status.INTERNAL,
        message: error.message || 'Failed to get employees',
      });
    }
  }

  async updateEmployee(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const { id, data } = call.request;

      logger.debug('gRPC: Updating employee', id);

      const result = await this.employeeService.updateEmployee(id, data);

      callback(null, {
        success: true,
        message: 'Employee updated successfully',
        data: result,
      });
    } catch (error: any) {
      logger.error('gRPC: Failed to update employee', error);
      callback({
        code: grpc.status.INTERNAL,
        message: error.message || 'Failed to update employee',
      });
    }
  }

  async deleteEmployee(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const { id } = call.request;

      logger.debug('gRPC: Deleting employee', id);

      const deleted = await this.employeeService.deleteEmployee(id);

      callback(null, {
        success: true,
        message: 'Employee deleted successfully',
        deleted,
      });
    } catch (error: any) {
      logger.error('gRPC: Failed to delete employee', error);
      callback({
        code: grpc.status.INTERNAL,
        message: error.message || 'Failed to delete employee',
      });
    }
  }

  async getEmployeeByEmail(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const { email } = call.request;

      logger.debug('gRPC: Getting employee by email', email);

      const result = await this.employeeService.getAllEmployees({ email });
      const employee = result && result.length > 0 ? result[0] : null;

      if (!employee) {
        callback({
          code: grpc.status.NOT_FOUND,
          message: 'Employee not found',
        });
        return;
      }

      callback(null, {
        success: true,
        message: 'Employee retrieved successfully',
        data: employee,
      });
    } catch (error: any) {
      logger.error('gRPC: Failed to get employee by email', error);
      callback({
        code: grpc.status.INTERNAL,
        message: error.message || 'Failed to get employee',
      });
    }
  }
}
