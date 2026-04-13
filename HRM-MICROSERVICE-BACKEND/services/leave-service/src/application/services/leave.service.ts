import { injectable, inject } from "inversify";
import { LeaveRepository } from "../../domain/repositories/leave.repository";
import { LeaveBalanceRepository } from "../../domain/repositories/leave-balance.repository";
import { LeaveTypeRepository } from "../../domain/repositories/leave-type.repository";
import { ILeave } from "../../domain/models/leave.model";
import { ILeaveBalance } from "../../domain/models/leave-balance.model";
import { ValidationError, NotFoundError, ConflictError } from "../../shared/utils/error-handler.util";
import { Logger } from "../../shared/utils/logger.util";

export interface ILeaveService {
  requestLeave(
    employeeId: string,
    leaveType: string,
    startDate: Date,
    endDate: Date,
    numberOfDays: number,
    reason: string,
    attachmentUrl?: string
  ): Promise<ILeave>;
  approveLeave(leaveId: string, approvedBy: string): Promise<ILeave>;
  rejectLeave(leaveId: string, rejectionReason: string): Promise<ILeave>;
  cancelLeave(leaveId: string): Promise<ILeave>;
  getLeavesByEmployeeId(employeeId: string, page: number, limit: number): Promise<ILeave[]>;
  getLeaveById(leaveId: string): Promise<ILeave>;
  getAllLeaves(page: number, limit: number): Promise<ILeave[]>;
  getLeavesByStatus(status: string, page: number, limit: number): Promise<ILeave[]>;
  checkLeaveConflict(employeeId: string, startDate: Date, endDate: Date): Promise<boolean>;
}

@injectable()
export class LeaveService implements ILeaveService {
  private logger = new Logger("LeaveService");

  constructor(
    @inject("LeaveRepository") private leaveRepository: LeaveRepository,
    @inject("LeaveBalanceRepository") private leaveBalanceRepository: LeaveBalanceRepository,
    @inject("LeaveTypeRepository") private leaveTypeRepository: LeaveTypeRepository
  ) {}

  async requestLeave(
    employeeId: string,
    leaveType: string,
    startDate: Date,
    endDate: Date,
    numberOfDays: number,
    reason: string,
    attachmentUrl?: string
  ): Promise<ILeave> {
    // Validate dates
    if (startDate >= endDate) {
      throw new ValidationError("Start date must be before end date");
    }

    // Check for conflicts
    const hasConflict = await this.checkLeaveConflict(employeeId, startDate, endDate);
    if (hasConflict) {
      throw new ConflictError("Leave conflict detected for the selected date range");
    }

    // Get leave balance
    const year = new Date().getFullYear();
    const balance = await this.leaveBalanceRepository.findByEmployeeIdAndYear(employeeId, year);
    if (!balance) {
      throw new NotFoundError("Leave balance not initialized for this employee");
    }

    // Create leave request
    const leave = await this.leaveRepository.create({
      employeeId,
      leaveType,
      startDate,
      endDate,
      numberOfDays,
      reason,
      attachmentUrl,
      status: "PENDING",
    });

    this.logger.info(`Leave request created: ${leave._id}`);
    return leave;
  }

  async approveLeave(leaveId: string, approvedBy: string): Promise<ILeave> {
    const leave = await this.leaveRepository.findById(leaveId);
    if (!leave) {
      throw new NotFoundError("Leave request not found");
    }

    if (leave.status !== "PENDING") {
      throw new ValidationError("Only pending leave requests can be approved");
    }

    const updatedLeave = await this.leaveRepository.update(leaveId, {
      status: "APPROVED",
      approvedBy,
    });

    // Update leave balance
    const year = new Date().getFullYear();
    const balance = await this.leaveBalanceRepository.findByEmployeeIdAndYear(
      leave.employeeId,
      year
    );
    if (balance) {
      const updateData: any = {};
      const leaveTypeKey = `${leave.leaveType.toLowerCase()}Used`;
      updateData[leaveTypeKey] = (balance[leaveTypeKey as keyof ILeaveBalance] as number) + leave.numberOfDays;
      await this.leaveBalanceRepository.update(balance._id.toString(), updateData);
    }

    this.logger.info(`Leave request approved: ${leaveId}`);
    return updatedLeave!;
  }

  async rejectLeave(leaveId: string, rejectionReason: string): Promise<ILeave> {
    const leave = await this.leaveRepository.findById(leaveId);
    if (!leave) {
      throw new NotFoundError("Leave request not found");
    }

    if (leave.status !== "PENDING") {
      throw new ValidationError("Only pending leave requests can be rejected");
    }

    const updatedLeave = await this.leaveRepository.update(leaveId, {
      status: "REJECTED",
      rejectionReason,
    });

    this.logger.info(`Leave request rejected: ${leaveId}`);
    return updatedLeave!;
  }

  async cancelLeave(leaveId: string): Promise<ILeave> {
    const leave = await this.leaveRepository.findById(leaveId);
    if (!leave) {
      throw new NotFoundError("Leave request not found");
    }

    if (leave.status === "CANCELLED") {
      throw new ValidationError("Leave request is already cancelled");
    }

    const updatedLeave = await this.leaveRepository.update(leaveId, {
      status: "CANCELLED",
    });

    // If it was approved, revert balance
    if (leave.status === "APPROVED") {
      const year = new Date().getFullYear();
      const balance = await this.leaveBalanceRepository.findByEmployeeIdAndYear(
        leave.employeeId,
        year
      );
      if (balance) {
        const updateData: any = {};
        const leaveTypeKey = `${leave.leaveType.toLowerCase()}Used`;
        updateData[leaveTypeKey] = Math.max(
          0,
          (balance[leaveTypeKey as keyof ILeaveBalance] as number) - leave.numberOfDays
        );
        await this.leaveBalanceRepository.update(balance._id.toString(), updateData);
      }
    }

    this.logger.info(`Leave request cancelled: ${leaveId}`);
    return updatedLeave!;
  }

  async getLeavesByEmployeeId(employeeId: string, page: number = 1, limit: number = 10): Promise<ILeave[]> {
    const skip = (page - 1) * limit;
    return await this.leaveRepository.findByEmployeeId(employeeId, limit, skip);
  }

  async getLeaveById(leaveId: string): Promise<ILeave> {
    const leave = await this.leaveRepository.findById(leaveId);
    if (!leave) {
      throw new NotFoundError("Leave request not found");
    }
    return leave;
  }

  async getAllLeaves(page: number = 1, limit: number = 10): Promise<ILeave[]> {
    const skip = (page - 1) * limit;
    return await this.leaveRepository.findAll(limit, skip);
  }

  async getLeavesByStatus(status: string, page: number = 1, limit: number = 10): Promise<ILeave[]> {
    const skip = (page - 1) * limit;
    const validStatuses = ["PENDING", "APPROVED", "REJECTED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      throw new ValidationError("Invalid leave status");
    }
    return await this.leaveRepository.findByEmployeeIdAndStatus("", status, limit, skip);
  }

  async checkLeaveConflict(employeeId: string, startDate: Date, endDate: Date): Promise<boolean> {
    const existingLeaves = await this.leaveRepository.findByDateRange(
      employeeId,
      startDate,
      endDate
    );

    const activeLeaves = existingLeaves.filter(
      (leave) => leave.status === "PENDING" || leave.status === "APPROVED"
    );

    return activeLeaves.length > 0;
  }
}
