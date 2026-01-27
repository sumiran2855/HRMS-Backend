import { injectable, inject } from "inversify";
import { LeaveTypeRepository } from "../../domain/repositories/leave-type.repository";
import { ILeaveType } from "../../domain/models/leave-type.model";
import { NotFoundError, ValidationError, ConflictError } from "../../shared/utils/error-handler.util";
import { Logger } from "../../shared/utils/logger.util";

export interface ILeaveTypeService {
  createLeaveType(
    name: string,
    maxDaysPerYear: number,
    carryForwardDays: number,
    requiresApproval: boolean,
    requiresAttachment: boolean,
    description: string
  ): Promise<ILeaveType>;
  getLeaveType(typeId: string): Promise<ILeaveType>;
  getLeaveTypeByName(name: string): Promise<ILeaveType>;
  getAllLeaveTypes(page: number, limit: number): Promise<ILeaveType[]>;
  updateLeaveType(typeId: string, updateData: any): Promise<ILeaveType>;
  deleteLeaveType(typeId: string): Promise<ILeaveType>;
}

@injectable()
export class LeaveTypeService implements ILeaveTypeService {
  private logger = new Logger("LeaveTypeService");

  constructor(
    @inject("LeaveTypeRepository") private leaveTypeRepository: LeaveTypeRepository
  ) {}

  async createLeaveType(
    name: string,
    maxDaysPerYear: number,
    carryForwardDays: number = 0,
    requiresApproval: boolean = true,
    requiresAttachment: boolean = false,
    description: string = ""
  ): Promise<ILeaveType> {
    const existingType = await this.leaveTypeRepository.findByName(name);
    if (existingType) {
      throw new ConflictError("Leave type already exists");
    }

    const leaveType = await this.leaveTypeRepository.create({
      name,
      maxDaysPerYear,
      carryForwardDays,
      requiresApproval,
      requiresAttachment,
      description,
      isActive: true,
    });

    this.logger.info(`Leave type created: ${name}`);
    return leaveType;
  }

  async getLeaveType(typeId: string): Promise<ILeaveType> {
    const leaveType = await this.leaveTypeRepository.findById(typeId);
    if (!leaveType) {
      throw new NotFoundError("Leave type not found");
    }
    return leaveType;
  }

  async getLeaveTypeByName(name: string): Promise<ILeaveType> {
    const leaveType = await this.leaveTypeRepository.findByName(name);
    if (!leaveType) {
      throw new NotFoundError("Leave type not found");
    }
    return leaveType;
  }

  async getAllLeaveTypes(page: number = 1, limit: number = 10): Promise<ILeaveType[]> {
    const skip = (page - 1) * limit;
    return await this.leaveTypeRepository.findAll(limit, skip);
  }

  async updateLeaveType(typeId: string, updateData: any): Promise<ILeaveType> {
    const leaveType = await this.getLeaveType(typeId);
    const updated = await this.leaveTypeRepository.update(typeId, updateData);
    if (!updated) {
      throw new NotFoundError("Failed to update leave type");
    }
    this.logger.info(`Leave type updated: ${typeId}`);
    return updated;
  }

  async deleteLeaveType(typeId: string): Promise<ILeaveType> {
    const leaveType = await this.getLeaveType(typeId);
    const deleted = await this.leaveTypeRepository.delete(typeId);
    if (!deleted) {
      throw new NotFoundError("Failed to delete leave type");
    }
    this.logger.info(`Leave type deleted: ${typeId}`);
    return deleted;
  }
}
