import { injectable } from "inversify";
import { Logger } from "../../shared/utils/logger.util";
import { IRole, IRoleInput, DEFAULT_ROLES, RoleEnum } from "../../domain/entities/Role.entity";

@injectable()
export class RoleService {
  private logger = new Logger("RoleService");
  private roles: Map<string, IRole> = new Map();

  constructor() {
    this.initializeDefaultRoles();
  }

  private initializeDefaultRoles(): void {
    Object.values(RoleEnum).forEach((roleName) => {
      const roleConfig = DEFAULT_ROLES[roleName as keyof typeof DEFAULT_ROLES];
      if (roleConfig) {
        const role: IRole = {
          name: roleConfig.name,
          description: roleConfig.description,
          permissions: roleConfig.permissions,
          isActive: true,
          organizationId: "default",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        this.roles.set(`${roleName}:default`, role);
      }
    });
    this.logger.info("Default roles initialized");
  }

  async getRole(name: string, organizationId: string): Promise<IRole | null> {
    const key = `${name}:${organizationId}`;
    return this.roles.get(key) || null;
  }

  async getRoleByName(name: string): Promise<IRole | null> {
    for (const [, role] of this.roles) {
      if (role.name === name) {
        return role;
      }
    }
    return null;
  }

  async getAllRoles(organizationId: string): Promise<IRole[]> {
    const roles: IRole[] = [];
    for (const [key, role] of this.roles) {
      if (role.organizationId === organizationId) {
        roles.push(role);
      }
    }
    return roles;
  }

  async createRole(roleInput: IRoleInput): Promise<IRole> {
    const key = `${roleInput.name}:${roleInput.organizationId}`;

    if (this.roles.has(key)) {
      throw new Error(`Role ${roleInput.name} already exists`);
    }

    const role: IRole = {
      name: roleInput.name,
      description: roleInput.description,
      permissions: roleInput.permissions,
      isActive: true,
      organizationId: roleInput.organizationId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.roles.set(key, role);
    this.logger.info(`Role ${roleInput.name} created`);
    return role;
  }

  async updateRole(name: string, organizationId: string, updates: Partial<IRoleInput>): Promise<IRole | null> {
    const key = `${name}:${organizationId}`;
    const role = this.roles.get(key);

    if (!role) {
      return null;
    }

    const updatedRole: IRole = {
      ...role,
      ...updates,
      name: role.name,
      organizationId: role.organizationId,
      updatedAt: new Date(),
    };

    this.roles.set(key, updatedRole);
    this.logger.info(`Role ${name} updated`);
    return updatedRole;
  }

  async deleteRole(name: string, organizationId: string): Promise<boolean> {
    const key = `${name}:${organizationId}`;
    const deleted = this.roles.delete(key);

    if (deleted) {
      this.logger.info(`Role ${name} deleted`);
    }
    return deleted;
  }

  hasPermission(permissions: string[], requiredPermission: string): boolean {
    return permissions.includes(requiredPermission);
  }

  hasAnyPermission(permissions: string[], requiredPermissions: string[]): boolean {
    return requiredPermissions.some((p) => permissions.includes(p));
  }

  hasAllPermissions(permissions: string[], requiredPermissions: string[]): boolean {
    return requiredPermissions.every((p) => permissions.includes(p));
  }
}
