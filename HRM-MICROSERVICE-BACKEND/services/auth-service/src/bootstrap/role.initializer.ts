import { Logger } from "../shared/utils/logger.util";
import { RoleService } from "../application/services/role.service";
import { DEFAULT_ROLES, RoleEnum } from "../domain/entities/Role.entity";

const logger = new Logger("RoleInitializer");

export async function initializeDefaultRoles(roleService: RoleService): Promise<void> {
  try {
    logger.info("Starting default roles initialization...");

    for (const roleName of Object.values(RoleEnum)) {
      const roleConfig = DEFAULT_ROLES[roleName as keyof typeof DEFAULT_ROLES];
      
      if (!roleConfig) {
        logger.warn(`No configuration found for role: ${roleName}`);
        continue;
      }

      const existingRole = await roleService.getRoleByName(roleConfig.name);
      
      if (existingRole) {
        logger.info(`Role '${roleConfig.name}' already exists, skipping...`);
        continue;
      }

      const newRole = await roleService.createRole({
        name: roleConfig.name,
        description: roleConfig.description,
        permissions: roleConfig.permissions,
        organizationId: "default",
      });

      logger.info(`✓ Created role '${newRole.name}' with ${newRole.permissions.length} permissions`);
    }

    logger.info("✓ Default roles initialization completed successfully");
  } catch (error: any) {
    logger.error("Error initializing default roles:", error);
    throw error;
  }
}
