import { injectable } from "inversify";
import { LeaveType, ILeaveType } from "../models/leave-type.model";

@injectable()
export class LeaveTypeRepository {
  async create(typeData: Partial<ILeaveType>): Promise<ILeaveType> {
    const leaveType = new LeaveType(typeData);
    return await leaveType.save();
  }

  async findById(typeId: string): Promise<ILeaveType | null> {
    return await LeaveType.findById(typeId);
  }

  async findByName(name: string): Promise<ILeaveType | null> {
    return await LeaveType.findOne({ name });
  }

  async findAll(limit: number = 10, skip: number = 0): Promise<ILeaveType[]> {
    return await LeaveType.find({ isActive: true })
      .limit(limit)
      .skip(skip);
  }

  async update(typeId: string, updateData: Partial<ILeaveType>): Promise<ILeaveType | null> {
    return await LeaveType.findByIdAndUpdate(typeId, updateData, { new: true });
  }

  async delete(typeId: string): Promise<ILeaveType | null> {
    return await LeaveType.findByIdAndDelete(typeId);
  }
}
