import { injectable, inject } from 'inversify';
import { Logger } from '../../shared/utils/logger.util';
import { LeaveRepository } from '../../domain/repositories/leave.repository';
import { LeaveBalanceRepository } from '../../domain/repositories/leave-balance.repository';
import { LeaveTypeRepository } from '../../domain/repositories/leave-type.repository';

const logger = new Logger('LeaveGrpcImpl');

@injectable()
export class LeaveGrpcImpl {
  constructor(
    @inject('LeaveRepository') private leaveRepository: any,
    @inject('LeaveBalanceRepository') private leaveBalanceRepository: any,
    @inject('LeaveTypeRepository') private leaveTypeRepository: any
  ) {}

  async requestLeave(call: any, callback: any) {
    try {
      const { employeeId, leaveType, startDate, endDate, numberOfDays, reason, attachmentUrl } = call.request;

      const leave = await this.leaveRepository.create({
        employeeId,
        leaveType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        numberOfDays,
        reason,
        attachmentUrl,
        status: 'PENDING',
      });

      callback(null, {
        success: true,
        message: 'Leave request created successfully',
        data: leave,
      });
    } catch (error) {
      logger.error('Error requesting leave via gRPC', error);
      callback({
        code: 'INTERNAL',
        message: 'Internal server error',
      });
    }
  }

  async approveLeave(call: any, callback: any) {
    try {
      const { leaveId, approvedBy } = call.request;

      const leave = await this.leaveRepository.findById(leaveId);
      if (!leave) {
        return callback(null, {
          success: false,
          message: 'Leave request not found',
          error: 'LEAVE_NOT_FOUND',
        });
      }

      const updatedLeave = await this.leaveRepository.update(leaveId, {
        status: 'APPROVED',
        approvedBy,
      });

      callback(null, {
        success: true,
        message: 'Leave request approved successfully',
        data: updatedLeave,
      });
    } catch (error) {
      logger.error('Error approving leave via gRPC', error);
      callback({
        code: 'INTERNAL',
        message: 'Internal server error',
      });
    }
  }

  async rejectLeave(call: any, callback: any) {
    try {
      const { leaveId, rejectionReason } = call.request;

      const leave = await this.leaveRepository.findById(leaveId);
      if (!leave) {
        return callback(null, {
          success: false,
          message: 'Leave request not found',
          error: 'LEAVE_NOT_FOUND',
        });
      }

      const updatedLeave = await this.leaveRepository.update(leaveId, {
        status: 'REJECTED',
        rejectionReason,
      });

      callback(null, {
        success: true,
        message: 'Leave request rejected successfully',
        data: updatedLeave,
      });
    } catch (error) {
      logger.error('Error rejecting leave via gRPC', error);
      callback({
        code: 'INTERNAL',
        message: 'Internal server error',
      });
    }
  }

  async cancelLeave(call: any, callback: any) {
    try {
      const { leaveId } = call.request;

      const leave = await this.leaveRepository.findById(leaveId);
      if (!leave) {
        return callback(null, {
          success: false,
          message: 'Leave request not found',
          error: 'LEAVE_NOT_FOUND',
        });
      }

      const updatedLeave = await this.leaveRepository.update(leaveId, {
        status: 'CANCELLED',
      });

      callback(null, {
        success: true,
        message: 'Leave request cancelled successfully',
        data: updatedLeave,
      });
    } catch (error) {
      logger.error('Error cancelling leave via gRPC', error);
      callback({
        code: 'INTERNAL',
        message: 'Internal server error',
      });
    }
  }

  async getLeaveById(call: any, callback: any) {
    try {
      const { leaveId } = call.request;

      const leave = await this.leaveRepository.findById(leaveId);
      if (!leave) {
        return callback(null, {
          success: false,
          message: 'Leave request not found',
          error: 'LEAVE_NOT_FOUND',
        });
      }

      callback(null, {
        success: true,
        message: 'Leave request retrieved successfully',
        data: leave,
      });
    } catch (error) {
      logger.error('Error getting leave by ID via gRPC', error);
      callback({
        code: 'INTERNAL',
        message: 'Internal server error',
      });
    }
  }

  async getLeavesByEmployeeId(call: any, callback: any) {
    try {
      const { employeeId, page = 1, limit = 10 } = call.request;

      const leaves = await this.leaveRepository.findByEmployeeId(employeeId, page, limit);

      callback(null, {
        success: true,
        message: 'Leave requests retrieved successfully',
        leaves: leaves || [],
        total: leaves?.length || 0,
        page,
        limit,
      });
    } catch (error) {
      logger.error('Error getting leaves by employee ID via gRPC', error);
      callback({
        code: 'INTERNAL',
        message: 'Internal server error',
      });
    }
  }

  async getAllLeaves(call: any, callback: any) {
    try {
      const { page = 1, limit = 10 } = call.request;

      const leaves = await this.leaveRepository.findAll(page, limit);

      callback(null, {
        success: true,
        message: 'All leave requests retrieved successfully',
        leaves: leaves || [],
        total: leaves?.length || 0,
        page,
        limit,
      });
    } catch (error) {
      logger.error('Error getting all leaves via gRPC', error);
      callback({
        code: 'INTERNAL',
        message: 'Internal server error',
      });
    }
  }

  async getLeavesByStatus(call: any, callback: any) {
    try {
      const { status, page = 1, limit = 10 } = call.request;

      const leaves = await this.leaveRepository.findByStatus(status, page, limit);

      callback(null, {
        success: true,
        message: 'Leave requests retrieved successfully',
        leaves: leaves || [],
        total: leaves?.length || 0,
        page,
        limit,
      });
    } catch (error) {
      logger.error('Error getting leaves by status via gRPC', error);
      callback({
        code: 'INTERNAL',
        message: 'Internal server error',
      });
    }
  }

  async getLeaveBalance(call: any, callback: any) {
    try {
      const { employeeId, year } = call.request;

      const leaveBalance = await this.leaveBalanceRepository.findByEmployeeIdAndYear(employeeId, year);

      if (!leaveBalance) {
        return callback(null, {
          success: false,
          message: 'Leave balance not found',
          error: 'LEAVE_BALANCE_NOT_FOUND',
        });
      }

      callback(null, {
        success: true,
        message: 'Leave balance retrieved successfully',
        data: leaveBalance,
      });
    } catch (error) {
      logger.error('Error getting leave balance via gRPC', error);
      callback({
        code: 'INTERNAL',
        message: 'Internal server error',
      });
    }
  }

  async initializeLeaveBalance(call: any, callback: any) {
    try {
      const { employeeId, year } = call.request;

      const leaveBalance = await this.leaveBalanceRepository.create({
        employeeId,
        year,
        casual: 12,
        casualUsed: 0,
        casualRemaining: 12,
        sick: 7,
        sickUsed: 0,
        sickRemaining: 7,
        earned: 15,
        earnedUsed: 0,
        earnedRemaining: 15,
        maternity: 90,
        maternityUsed: 0,
        maternityRemaining: 90,
        paternity: 5,
        paternityUsed: 0,
        paternityRemaining: 5,
        unpaid: 0,
        unpaidUsed: 0,
        other: 0,
        otherUsed: 0,
        otherRemaining: 0,
      });

      callback(null, {
        success: true,
        message: 'Leave balance initialized successfully',
        data: leaveBalance,
      });
    } catch (error) {
      logger.error('Error initializing leave balance via gRPC', error);
      callback({
        code: 'INTERNAL',
        message: 'Internal server error',
      });
    }
  }

  async getLeaveTypes(call: any, callback: any) {
    try {
      const leaveTypes = await this.leaveTypeRepository.findAll();

      callback(null, {
        success: true,
        message: 'Leave types retrieved successfully',
        data: leaveTypes || [],
      });
    } catch (error) {
      logger.error('Error getting leave types via gRPC', error);
      callback({
        code: 'INTERNAL',
        message: 'Internal server error',
      });
    }
  }

  async createLeaveType(call: any, callback: any) {
    try {
      const { name, description, maxDaysPerYear } = call.request;

      const leaveType = await this.leaveTypeRepository.create({
        name,
        description,
        maxDaysPerYear,
      });

      callback(null, {
        success: true,
        message: 'Leave type created successfully',
        data: leaveType,
      });
    } catch (error) {
      logger.error('Error creating leave type via gRPC', error);
      callback({
        code: 'INTERNAL',
        message: 'Internal server error',
      });
    }
  }
}
