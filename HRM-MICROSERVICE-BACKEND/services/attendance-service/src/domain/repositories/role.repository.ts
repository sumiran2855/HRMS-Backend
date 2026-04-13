import { injectable } from "inversify";
import { RoleModel, RoleDocument } from "../../infrastructure/persistence/role.schema";
import { Logger } from "../../shared/utils/logger.util";
import { IRole, IRoleInput } from "../../domain/entities/Role.entity";

export interface IRoleRepository {
  create(input: IRoleInput): Promise<IRole>;
  findByName(name: string, organizationId?: string): Promise<IRole | null>;
  findById(id: string): Promise<IRole | null>;
  findAll(organizationId?: string): Promise<IRole[]>;
  update(id: string, input: Partial<IRoleInput>): Promise<IRole | null>;
  delete(id: string): Promise<boolean>;
}

@injectable()
export class RoleRepository implements IRoleRepository {
  private logger = new Logger("RoleRepository");

  async create(input: IRoleInput): Promise<IRole> {
    try {
      const role = new RoleModel(input);
      const saved = await role.save();
      return this.mapToIRole(saved);
    } catch (error: any) {
      this.logger.error("Error creating role:", error);
      throw error;
    }
  }

  async findByName(name: string, organizationId: string = "default"): Promise<IRole | null> {
    try {
      const role = await RoleModel.findOne({
        name,
        organizationId,
      }).lean();

      return role ? this.mapToIRole(role as RoleDocument) : null;
    } catch (error: any) {
      this.logger.error(`Error finding role by name ${name}:`, error);
      throw error;
    }
  }

  async findById(id: string): Promise<IRole | null> {
    try {
      const role = await RoleModel.findById(id).lean();
      return role ? this.mapToIRole(role as RoleDocument) : null;
    } catch (error: any) {
      this.logger.error(`Error finding role by id ${id}:`, error);
      throw error;
    }
  }

  async findAll(organizationId: string = "default"): Promise<IRole[]> {
    try {
      const roles = await RoleModel.find({
        organizationId,
        isActive: true,
      }).lean();

      return roles.map((role) => this.mapToIRole(role as RoleDocument));
    } catch (error: any) {
      this.logger.error("Error finding all roles:", error);
      throw error;
    }
  }

  async update(id: string, input: Partial<IRoleInput>): Promise<IRole | null> {
    try {
      const role = await RoleModel.findByIdAndUpdate(id, input, {
        new: true,
      }).lean();

      return role ? this.mapToIRole(role as RoleDocument) : null;
    } catch (error: any) {
      this.logger.error(`Error updating role ${id}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await RoleModel.findByIdAndDelete(id);
      return !!result;
    } catch (error: any) {
      this.logger.error(`Error deleting role ${id}:`, error);
      throw error;
    }
  }

  private mapToIRole(doc: RoleDocument | any): IRole {
    return {
      name: doc.name,
      description: doc.description,
      permissions: doc.permissions || [],
      isActive: doc.isActive,
      organizationId: doc.organizationId,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
