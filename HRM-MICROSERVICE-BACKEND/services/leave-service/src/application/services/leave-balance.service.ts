import { injectable, inject } from "inversify";
import { LeaveBalanceRepository } from "../../domain/repositories/leave-balance.repository";
import { ILeaveBalance } from "../../domain/models/leave-balance.model";
import { NotFoundError, ValidationError } from "../../shared/utils/error-handler.util";
import { Logger } from "../../shared/utils/logger.util";
import { DEFAULT_LEAVE_ALLOCATION } from "../../shared/constants/messages.constant";

export interface ILeaveBalanceService {
  getBalance(employeeId: string, year: number): Promise<ILeaveBalance>;
  initializeBalance(employeeId: string, year: number): Promise<ILeaveBalance>;
  updateBalance(employeeId: string, year: number, updateData: any): Promise<ILeaveBalance>;
  getRemainingDays(employeeId: string, year: number, leaveType: string): Promise<number>;
}

@injectable()
export class LeaveBalanceService implements ILeaveBalanceService {
  private logger = new Logger("LeaveBalanceService");

  constructor(
    @inject("LeaveBalanceRepository") private leaveBalanceRepository: LeaveBalanceRepository
  ) {}

  async getBalance(employeeId: string, year: number): Promise<ILeaveBalance> {
    const balance = await this.leaveBalanceRepository.findByEmployeeIdAndYear(
      employeeId,
      year
    );
    if (!balance) {
      throw new NotFoundError("Leave balance not found for this employee and year");
    }
    return balance;
  }

  async initializeBalance(employeeId: string, year: number): Promise<ILeaveBalance> {
    const existingBalance = await this.leaveBalanceRepository.findByEmployeeIdAndYear(
      employeeId,
      year
    );
    if (existingBalance) {
      throw new ValidationError("Balance already initialized for this year");
    }

    const balanceData = {
      employeeId,
      year,
      casual: DEFAULT_LEAVE_ALLOCATION.CASUAL,
      sick: DEFAULT_LEAVE_ALLOCATION.SICK,
      earned: DEFAULT_LEAVE_ALLOCATION.EARNED,
      maternity: DEFAULT_LEAVE_ALLOCATION.MATERNITY,
      paternity: DEFAULT_LEAVE_ALLOCATION.PATERNITY,
      unpaid: DEFAULT_LEAVE_ALLOCATION.UNPAID,
      other: DEFAULT_LEAVE_ALLOCATION.OTHER,
    };

    const balance = await this.leaveBalanceRepository.create(balanceData);
    this.logger.info(`Leave balance initialized for employee: ${employeeId}, year: ${year}`);
    return balance;
  }

  async updateBalance(
    employeeId: string,
    year: number,
    updateData: any
  ): Promise<ILeaveBalance> {
    const balance = await this.leaveBalanceRepository.findByEmployeeIdAndYear(
      employeeId,
      year
    );
    if (!balance) {
      throw new NotFoundError("Leave balance not found");
    }

    const updated = await this.leaveBalanceRepository.update(
      balance._id.toString(),
      updateData
    );
    return updated!;
  }

  async getRemainingDays(
    employeeId: string,
    year: number,
    leaveType: string
  ): Promise<number> {
    const balance = await this.getBalance(employeeId, year);
    const leaveTypeKey = leaveType.toLowerCase();
    const allocated = balance[`${leaveTypeKey}` as keyof ILeaveBalance] as number;
    const used = balance[`${leaveTypeKey}Used` as keyof ILeaveBalance] as number;

    if (allocated === -1) {
      return -1; // Unlimited
    }

    return allocated - used;
  }
}
