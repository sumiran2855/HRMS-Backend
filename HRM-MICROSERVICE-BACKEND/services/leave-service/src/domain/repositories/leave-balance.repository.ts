import { injectable } from "inversify";
import { LeaveBalance, ILeaveBalance } from "../models/leave-balance.model";

@injectable()
export class LeaveBalanceRepository {
  async create(balanceData: Partial<ILeaveBalance>): Promise<ILeaveBalance> {
    const balance = new LeaveBalance(balanceData);
    return await balance.save();
  }

  async findById(balanceId: string): Promise<ILeaveBalance | null> {
    return await LeaveBalance.findById(balanceId);
  }

  async findByEmployeeIdAndYear(
    employeeId: string,
    year: number
  ): Promise<ILeaveBalance | null> {
    return await LeaveBalance.findOne({ employeeId, year });
  }

  async findByEmployeeId(employeeId: string): Promise<ILeaveBalance[]> {
    return await LeaveBalance.find({ employeeId }).sort({ year: -1 });
  }

  async findAll(limit: number = 10, skip: number = 0): Promise<ILeaveBalance[]> {
    return await LeaveBalance.find({})
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });
  }

  async update(
    balanceId: string,
    updateData: Partial<ILeaveBalance>
  ): Promise<ILeaveBalance | null> {
    return await LeaveBalance.findByIdAndUpdate(balanceId, updateData, { new: true });
  }

  async delete(balanceId: string): Promise<ILeaveBalance | null> {
    return await LeaveBalance.findByIdAndDelete(balanceId);
  }
}
