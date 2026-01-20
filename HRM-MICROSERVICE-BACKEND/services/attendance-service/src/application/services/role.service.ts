import { injectable, inject } from "inversify";
import { Logger } from "../../shared/utils/logger.util";
import { IRole, IRoleInput } from "../../domain/entities/Role.entity";
import { IRoleRepository } from "../../domain/repositories/role.repository";
import { AuthGrpcClient } from "../../infrastructure/grpc/auth.grpc.client";

@injectable()
export class RoleService {
  private logger = new Logger("RoleService");
  private roleCache: Map<string, IRole> = new Map();
  private cacheExpiry: number = 5 * 60 * 1000;
  private lastCacheUpdate: number = 0;

  constructor(
    @inject("RoleRepository") private roleRepository: IRoleRepository,
    @inject(AuthGrpcClient) private authGrpcClient: AuthGrpcClient
  ) {}

  async getRoleByName(name: string, organizationId: string = "default"): Promise<IRole | null> {
    try {
      const cacheKey = `${name}:${organizationId}`;
      
      if (this.roleCache.has(cacheKey) && Date.now() - this.lastCacheUpdate < this.cacheExpiry) {
        this.logger.info(`Role ${name} retrieved from cache`);
        return this.roleCache.get(cacheKey) || null;
      }

      const role = await this.authGrpcClient.getRoleByName(name, organizationId);
      
      if (role) {
        this.roleCache.set(cacheKey, role);
        this.lastCacheUpdate = Date.now();
      }
      
      return role;
    } catch (error: any) {
      this.logger.error(`Error fetching role ${name} from Auth Service:`, error);
      try {
        const localRole = await this.roleRepository.findByName(name, organizationId);
        return localRole || null;
      } catch (fallbackError) {
        this.logger.error("Fallback to local database failed:", fallbackError);
        return null;
      }
    }
  }

  async getAllRoles(organizationId: string = "default"): Promise<IRole[]> {
    try {
      const roles = await this.authGrpcClient.getAllRoles(organizationId);
      
      roles.forEach(role => {
        const cacheKey = `${role.name}:${organizationId}`;
        this.roleCache.set(cacheKey, role);
      });
      this.lastCacheUpdate = Date.now();
      
      return roles;
    } catch (error: any) {
      this.logger.error("Error fetching roles from Auth Service:", error);
      try {
        const localRoles = await this.roleRepository.findAll(organizationId);
        return localRoles;
      } catch (fallbackError) {
        this.logger.error("Fallback to local database failed:", fallbackError);
        return [];
      }
    }
  }

  async createRole(roleInput: IRoleInput): Promise<IRole> {
    try {
      const role = await this.roleRepository.create(roleInput);
      const cacheKey = `${role.name}:${roleInput.organizationId}`;
      this.roleCache.set(cacheKey, role);
      this.logger.info(`Role ${role.name} created successfully`);
      return role;
    } catch (error: any) {
      this.logger.error("Error creating role:", error);
      throw error;
    }
  }

  clearCache(): void {
    this.roleCache.clear();
    this.lastCacheUpdate = 0;
    this.logger.info("Role cache cleared");
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
