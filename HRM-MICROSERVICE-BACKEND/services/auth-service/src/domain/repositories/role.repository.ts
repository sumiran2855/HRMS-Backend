import { injectable } from "inversify";
import { IRole, IRoleInput } from "../../domain/entities/Role.entity";
import { RoleModel } from "../../infrastructure/persistence/role.schema";
import { Logger } from "../../shared/utils/logger.util";

export interface IRoleRepository {
  create(roleInput: IRoleInput): Promise<IRole>;
  findByName(name: string, organizationId?: string): Promise<IRole | null>;
  findById(id: string): Promise<IRole | null>;
  findAll(organizationId: string): Promise<IRole[]>;
  update(id: string, roleInput: Partial<IRoleInput>): Promise<IRole | null>;
  delete(id: string): Promise<boolean>;
}

@injectable()
export class RoleRepository implements IRoleRepository {
  private logger = new Logger("RoleRepository");

  async create(roleInput: IRoleInput): Promise<IRole> {
    try {
      const role = new RoleModel({
        ...roleInput,
        isActive: true,
      });
      const savedRole = await role.save();
      this.logger.info(`Role created: ${savedRole.name}`);
      return savedRole.toObject() as IRole;
    } catch (error: any) {
      this.logger.error("Error creating role:", error);
      throw error;
    }
  }

  async findByName(name: string, organizationId: string = "default"): Promise<IRole | null> {
    try {
      const role = await RoleModel.findOne({
        name: name.toLowerCase(),
        organizationId,
      }).lean();
      return role ? (role as IRole) : null;
    } catch (error: any) {
      this.logger.error("Error finding role by name:", error);
      throw error;
    }
  }

  async findById(id: string): Promise<IRole | null> {
    try {
      const role = await RoleModel.findById(id).lean();
      return role ? (role as IRole) : null;
    } catch (error: any) {
      this.logger.error("Error finding role by id:", error);
      throw error;
    }
  }

  async findAll(organizationId: string): Promise<IRole[]> {
    try {
      const roles = await RoleModel.find({
        organizationId,
        isActive: true,
      }).lean();
      return roles as IRole[];
    } catch (error: any) {
      this.logger.error("Error finding all roles:", error);
      throw error;
    }
  }

  async update(id: string, roleInput: Partial<IRoleInput>): Promise<IRole | null> {
    try {
      const role = await RoleModel.findByIdAndUpdate(id, roleInput, {
        new: true,
      }).lean();
      return role ? (role as IRole) : null;
    } catch (error: any) {
      this.logger.error("Error updating role:", error);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await RoleModel.findByIdAndDelete(id);
      return !!result;
    } catch (error: any) {
      this.logger.error("Error deleting role:", error);
      throw error;
    }
  }
}
