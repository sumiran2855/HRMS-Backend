import { injectable } from "inversify";
import { Leave, ILeave } from "../models/leave.model";

@injectable()
export class LeaveRepository {
  async create(leaveData: Partial<ILeave>): Promise<ILeave> {
    const leave = new Leave(leaveData);
    return await leave.save();
  }

  async findById(leaveId: string): Promise<ILeave | null> {
    return await Leave.findById(leaveId);
  }

  async findByEmployeeId(employeeId: string, limit: number = 10, skip: number = 0): Promise<ILeave[]> {
    return await Leave.find({ employeeId })
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });
  }

  async findByEmployeeIdAndStatus(
    employeeId: string,
    status: string,
    limit: number = 10,
    skip: number = 0
  ): Promise<ILeave[]> {
    return await Leave.find({ employeeId, status })
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });
  }

  async findByDateRange(
    employeeId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ILeave[]> {
    return await Leave.find({
      employeeId,
      $or: [
        { startDate: { $lte: endDate, $gte: startDate } },
        { endDate: { $lte: endDate, $gte: startDate } },
        { startDate: { $lte: startDate }, endDate: { $gte: endDate } },
      ],
    });
  }

  async findAll(limit: number = 10, skip: number = 0): Promise<ILeave[]> {
    return await Leave.find({})
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });
  }

  async update(leaveId: string, updateData: Partial<ILeave>): Promise<ILeave | null> {
    return await Leave.findByIdAndUpdate(leaveId, updateData, { new: true });
  }

  async delete(leaveId: string): Promise<ILeave | null> {
    return await Leave.findByIdAndDelete(leaveId);
  }

  async countByEmployeeIdAndStatus(employeeId: string, status: string): Promise<number> {
    return await Leave.countDocuments({ employeeId, status });
  }

  async findPendingLeaves(limit: number = 10, skip: number = 0): Promise<ILeave[]> {
    return await Leave.find({ status: "PENDING" })
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: 1 });
  }
}
