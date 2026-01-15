import { injectable, inject } from 'inversify';
import { Logger } from '../../shared/utils/logger.util';
import { IAttendanceRepository } from '../../application/ports/AttendanceRepository.port';
import { EmployeeGrpcClient } from './employee.grpc.client';
import { AuthGrpcClient } from './auth.grpc.client';

const logger = new Logger('AttendanceGrpcImpl');

@injectable()
export class AttendanceGrpcImpl {
  constructor(
    @inject('AttendanceRepository') private repository: IAttendanceRepository,
    @inject(EmployeeGrpcClient) private employeeClient: EmployeeGrpcClient,
    @inject(AuthGrpcClient) private authClient: AuthGrpcClient
  ) {}

  async createAttendance(call: any, callback: any) {
    try {
      const { employeeId, organizationId, date, checkInTime, checkOutTime, status, leaveType, remarks, createdBy } = call.request;

      const employee = await this.employeeClient.getEmployeeById(employeeId);
      if (!employee) {
        return callback(null, {
          success: false,
          message: 'Employee not found',
          error: 'EMPLOYEE_NOT_FOUND',
        });
      }

      const attendance = await this.repository.create({
        employeeId,
        organizationId,
        date: new Date(date),
        checkInTime: checkInTime ? new Date(checkInTime) : undefined,
        checkOutTime: checkOutTime ? new Date(checkOutTime) : undefined,
        status,
        leaveType,
        remarks,
        createdBy,
      });

      callback(null, {
        success: true,
        message: 'Attendance created successfully',
        data: attendance,
      });
    } catch (error) {
      logger.error('Error creating attendance via gRPC', error);
      callback({
        code: 'INTERNAL',
        message: 'Internal server error',
      });
    }
  }

  async getAttendanceById(call: any, callback: any) {
    try {
      const { id, organizationId } = call.request;

      const attendance = await this.repository.findById(id, organizationId);
      if (!attendance) {
        return callback(null, {
          success: false,
          message: 'Attendance not found',
          error: 'ATTENDANCE_NOT_FOUND',
        });
      }

      callback(null, {
        success: true,
        message: 'Attendance retrieved successfully',
        data: attendance,
      });
    } catch (error) {
      logger.error('Error getting attendance via gRPC', error);
      callback({
        code: 'INTERNAL',
        message: 'Internal server error',
      });
    }
  }

  async getAttendanceByDateRange(call: any, callback: any) {
    try {
      const { organizationId, employeeId, startDate, endDate, page, limit } = call.request;

      const attendances = await this.repository.findByDateRange(
        organizationId,
        new Date(startDate),
        new Date(endDate),
        employeeId
      );

      callback(null, {
        success: true,
        message: 'Attendance records retrieved successfully',
        data: attendances,
      });
    } catch (error) {
      logger.error('Error getting attendance by date range via gRPC', error);
      callback({
        code: 'INTERNAL',
        message: 'Internal server error',
      });
    }
  }

  async updateAttendance(call: any, callback: any) {
    try {
      const { id, organizationId, checkInTime, checkOutTime, status, leaveType, remarks, workHours, overtime } = call.request;

      const attendance = await this.repository.update(id, organizationId, {
        checkInTime: checkInTime ? new Date(checkInTime) : undefined,
        checkOutTime: checkOutTime ? new Date(checkOutTime) : undefined,
        status,
        leaveType,
        remarks,
        workHours,
        overtime,
      });

      if (!attendance) {
        return callback(null, {
          success: false,
          message: 'Attendance not found',
          error: 'ATTENDANCE_NOT_FOUND',
        });
      }

      callback(null, {
        success: true,
        message: 'Attendance updated successfully',
        data: attendance,
      });
    } catch (error) {
      logger.error('Error updating attendance via gRPC', error);
      callback({
        code: 'INTERNAL',
        message: 'Internal server error',
      });
    }
  }

  async deleteAttendance(call: any, callback: any) {
    try {
      const { id, organizationId } = call.request;

      const deleted = await this.repository.delete(id, organizationId);

      callback(null, {
        success: deleted,
        message: deleted ? 'Attendance deleted successfully' : 'Attendance not found',
        deleted,
      });
    } catch (error) {
      logger.error('Error deleting attendance via gRPC', error);
      callback({
        code: 'INTERNAL',
        message: 'Internal server error',
      });
    }
  }

  async approveAttendance(call: any, callback: any) {
    try {
      const { id, organizationId, approvedBy } = call.request;

      const attendance = await this.repository.approveAttendance(id, organizationId, approvedBy);

      if (!attendance) {
        return callback(null, {
          success: false,
          message: 'Attendance not found',
          error: 'ATTENDANCE_NOT_FOUND',
        });
      }

      callback(null, {
        success: true,
        message: 'Attendance approved successfully',
        data: attendance,
      });
    } catch (error) {
      logger.error('Error approving attendance via gRPC', error);
      callback({
        code: 'INTERNAL',
        message: 'Internal server error',
      });
    }
  }

  async getAttendanceSummary(call: any, callback: any) {
    try {
      const { employeeId, organizationId, startDate, endDate } = call.request;

      const summary = await this.repository.getAttendanceSummary(
        employeeId,
        organizationId,
        new Date(startDate),
        new Date(endDate)
      );

      callback(null, {
        success: true,
        message: 'Attendance summary retrieved successfully',
        data: summary,
      });
    } catch (error) {
      logger.error('Error getting attendance summary via gRPC', error);
      callback({
        code: 'INTERNAL',
        message: 'Internal server error',
      });
    }
  }

  async bulkUpsertAttendance(call: any, callback: any) {
    try {
      const { attendances, organizationId } = call.request;

      const results = await this.repository.bulkUpsert(attendances, organizationId);

      callback(null, {
        success: true,
        message: 'Attendance records upserted successfully',
        data: results,
      });
    } catch (error) {
      logger.error('Error bulk upserting attendance via gRPC', error);
      callback({
        code: 'INTERNAL',
        message: 'Internal server error',
      });
    }
  }

  async getPendingApprovals(call: any, callback: any) {
    try {
      const { organizationId, page = 1, limit = 10 } = call.request;

      const attendances = await this.repository.findByFilters({
        organizationId,
        isApproved: false,
        page,
        limit,
      });

      callback(null, {
        success: true,
        message: 'Pending approvals retrieved successfully',
        data: attendances,
      });
    } catch (error) {
      logger.error('Error getting pending approvals via gRPC', error);
      callback({
        code: 'INTERNAL',
        message: 'Internal server error',
      });
    }
  }
}
