import { injectable, inject } from "inversify";
import { Logger } from "../../shared/utils/logger.util";
import { IRole, IRoleInput } from "../../domain/entities/Role.entity";
import { IRoleRepository } from "../../domain/repositories/role.repository";

@injectable()
export class RoleService {
  private logger = new Logger("RoleService");
  private roleCache: Map<string, IRole> = new Map();
  private cacheExpiry: number = 5 * 60 * 1000; // 5 minutes
  private lastCacheUpdate: number = 0;

  constructor(@inject("RoleRepository") private roleRepository: IRoleRepository) {
    this.initializeCache();
  }

  private initializeCache(): void {
    // Pre-warm cache on initialization
    this.getAllRoles().catch(err => 
      this.logger.error("Error warming role cache:", err)
    );
  }

  async getRole(name: string, organizationId: string = "default"): Promise<IRole | null> {
    const cacheKey = `${name}:${organizationId}`;
    
    // Check cache first
    if (this.roleCache.has(cacheKey) && this.isCacheValid()) {
      return this.roleCache.get(cacheKey) || null;
    }
    
    // Cache miss or expired - query DB
    const role = await this.roleRepository.findByName(name, organizationId);
    if (role) {
      this.roleCache.set(cacheKey, role);
      this.lastCacheUpdate = Date.now();
    }
    return role;
  }

  async getRoleByName(name: string, organizationId: string = "default"): Promise<IRole | null> {
    return this.getRole(name, organizationId);
  }

  async getAllRoles(organizationId: string = "default"): Promise<IRole[]> {
    // Check if cache is still valid
    if (this.roleCache.size > 0 && this.isCacheValid()) {
      const cached = Array.from(this.roleCache.values()).filter(
        r => r.organizationId === organizationId
      );
      if (cached.length > 0) {
        return cached;
      }
    }
    
    // Cache miss or expired - query DB
    const roles = await this.roleRepository.findAll(organizationId);
    
    // Update cache
    roles.forEach(role => {
      const cacheKey = `${role.name}:${organizationId}`;
      this.roleCache.set(cacheKey, role);
    });
    this.lastCacheUpdate = Date.now();
    
    return roles;
  }

  private isCacheValid(): boolean {
    return Date.now() - this.lastCacheUpdate < this.cacheExpiry;
  }

  clearCache(): void {
    this.roleCache.clear();
    this.lastCacheUpdate = 0;
    this.logger.info("Role cache cleared");
  }

  async createRole(roleInput: IRoleInput): Promise<IRole> {
    try {
      const existingRole = await this.roleRepository.findByName(roleInput.name, roleInput.organizationId);
      if (existingRole) {
        this.logger.warn(`Role ${roleInput.name} already exists`);
        return existingRole;
      }
      
      const role = await this.roleRepository.create(roleInput);
      this.logger.info(`Role ${role.name} created in database`);
      return role;
    } catch (error: any) {
      this.logger.error("Error creating role:", error);
      throw error;
    }
  }

  async updateRole(id: string, updates: Partial<IRoleInput>): Promise<IRole | null> {
    try {
      const role = await this.roleRepository.update(id, updates);
      if (role) {
        this.logger.info(`Role ${role.name} updated`);
      }
      return role;
    } catch (error: any) {
      this.logger.error("Error updating role:", error);
      throw error;
    }
  }

  async deleteRole(id: string): Promise<boolean> {
    try {
      const deleted = await this.roleRepository.delete(id);
      if (deleted) {
        this.logger.info(`Role deleted`);
      }
      return deleted;
    } catch (error: any) {
      this.logger.error("Error deleting role:", error);
      throw error;
    }
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
