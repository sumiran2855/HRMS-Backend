import { injectable } from 'inversify';
import { Logger } from '../../shared/utils/logger.util';

const logger = new Logger('EmployeeGrpcImpl');

@injectable()
export class EmployeeGrpcImpl {
  async createEmployee(call: any, callback: any) {
    try {
      const { firstName, lastName, email, department, position, phoneNumber } = call.request;

      callback(null, {
        success: true,
        message: 'Employee created successfully',
        data: {
          id: 'emp_' + Date.now(),
          firstName,
          lastName,
          email,
          department,
          position,
          phoneNumber,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      });
    } catch (error) {
      logger.error('Error creating employee via gRPC', error);
      callback({
        code: 'INTERNAL',
        message: 'Internal server error',
      });
    }
  }

  async getEmployeeById(call: any, callback: any) {
    try {
      const { id } = call.request;

      callback(null, {
        success: true,
        message: 'Employee retrieved successfully',
        data: {
          id,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          department: 'Engineering',
          position: 'Developer',
          phoneNumber: '1234567890',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      });
    } catch (error) {
      logger.error('Error getting employee via gRPC', error);
      callback({
        code: 'INTERNAL',
        message: 'Internal server error',
      });
    }
  }

  async getAllEmployees(call: any, callback: any) {
    try {
      const { filter } = call.request;

      callback(null, {
        success: true,
        message: 'Employees retrieved successfully',
        data: [
          {
            id: 'emp_1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            department: 'Engineering',
            position: 'Developer',
            phoneNumber: '1234567890',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
      });
    } catch (error) {
      logger.error('Error getting all employees via gRPC', error);
      callback({
        code: 'INTERNAL',
        message: 'Internal server error',
      });
    }
  }

  async updateEmployee(call: any, callback: any) {
    try {
      const { id, data } = call.request;

      callback(null, {
        success: true,
        message: 'Employee updated successfully',
        data: {
          id,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          department: 'Engineering',
          position: 'Senior Developer',
          phoneNumber: '1234567890',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      });
    } catch (error) {
      logger.error('Error updating employee via gRPC', error);
      callback({
        code: 'INTERNAL',
        message: 'Internal server error',
      });
    }
  }

  async deleteEmployee(call: any, callback: any) {
    try {
      const { id } = call.request;

      callback(null, {
        success: true,
        message: 'Employee deleted successfully',
        deleted: true,
      });
    } catch (error) {
      logger.error('Error deleting employee via gRPC', error);
      callback({
        code: 'INTERNAL',
        message: 'Internal server error',
      });
    }
  }

  async getEmployeeByEmail(call: any, callback: any) {
    try {
      const { email } = call.request;

      callback(null, {
        success: true,
        message: 'Employee retrieved successfully',
        data: {
          id: 'emp_' + Date.now(),
          firstName: 'John',
          lastName: 'Doe',
          email,
          department: 'Engineering',
          position: 'Developer',
          phoneNumber: '1234567890',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      });
    } catch (error) {
      logger.error('Error getting employee by email via gRPC', error);
      callback({
        code: 'INTERNAL',
        message: 'Internal server error',
      });
    }
  }
}
