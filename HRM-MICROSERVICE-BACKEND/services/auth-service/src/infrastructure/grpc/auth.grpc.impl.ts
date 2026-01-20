import { injectable, inject } from 'inversify';
import { Logger } from '../../shared/utils/logger.util';
import { RoleService } from '../../application/services/role.service';

const logger = new Logger('AuthGrpcImpl');

@injectable()
export class AuthGrpcImpl {
  constructor(@inject(RoleService) private roleService: RoleService) {}
  async register(call: any, callback: any) {
    try {
      const { email, username, password, fullName } = call.request;

      callback(null, {
        success: true,
        message: 'User registered successfully',
        data: {
          userId: 'user_' + Date.now(),
          username,
          email,
          accessToken: 'access_token_' + Date.now(),
          refreshToken: 'refresh_token_' + Date.now(),
          expiresIn: 3600,
        },
      });
    } catch (error) {
      logger.error('Error registering user via gRPC', error);
      callback({
        code: 'INTERNAL',
        message: 'Internal server error',
      });
    }
  }

  async login(call: any, callback: any) {
    try {
      const { email, password } = call.request;

      callback(null, {
        success: true,
        message: 'Login successful',
        data: {
          userId: 'user_' + Date.now(),
          username: email.split('@')[0],
          email,
          accessToken: 'access_token_' + Date.now(),
          refreshToken: 'refresh_token_' + Date.now(),
          expiresIn: 3600,
        },
      });
    } catch (error) {
      logger.error('Error logging in via gRPC', error);
      callback({
        code: 'INTERNAL',
        message: 'Internal server error',
      });
    }
  }

  async validateToken(call: any, callback: any) {
    try {
      const { token } = call.request;

      callback(null, {
        success: true,
        isValid: true,
        message: 'Token is valid',
        userData: {
          id: 'user_123',
          username: 'testuser',
          email: 'test@example.com',
          fullName: 'Test User',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      });
    } catch (error) {
      logger.error('Error validating token via gRPC', error);
      callback({
        code: 'INTERNAL',
        message: 'Internal server error',
      });
    }
  }

  async refreshToken(call: any, callback: any) {
    try {
      const { refreshToken } = call.request;

      callback(null, {
        success: true,
        message: 'Token refreshed successfully',
        data: {
          userId: 'user_' + Date.now(),
          username: 'testuser',
          email: 'test@example.com',
          accessToken: 'access_token_' + Date.now(),
          refreshToken: 'refresh_token_' + Date.now(),
          expiresIn: 3600,
        },
      });
    } catch (error) {
      logger.error('Error refreshing token via gRPC', error);
      callback({
        code: 'INTERNAL',
        message: 'Internal server error',
      });
    }
  }

  async getCurrentUser(call: any, callback: any) {
    try {
      const { userId } = call.request;

      callback(null, {
        success: true,
        message: 'User retrieved successfully',
        data: {
          id: userId,
          username: 'testuser',
          email: 'test@example.com',
          fullName: 'Test User',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      });
    } catch (error) {
      logger.error('Error getting current user via gRPC', error);
      callback({
        code: 'INTERNAL',
        message: 'Internal server error',
      });
    }
  }

  async verifyUserExists(call: any, callback: any) {
    try {
      const { email, username } = call.request;

      callback(null, {
        success: true,
        message: 'User existence checked',
        exists: false,
      });
    } catch (error) {
      logger.error('Error verifying user exists via gRPC', error);
      callback({
        code: 'INTERNAL',
        message: 'Internal server error',
      });
    }
  }

  async getRoleByName(call: any, callback: any) {
    try {
      const { name, organizationId = 'default' } = call.request;

      const role = await this.roleService.getRoleByName(name, organizationId);

      if (!role) {
        return callback({
          code: 'NOT_FOUND',
          message: `Role ${name} not found`,
        });
      }

      callback(null, {
        success: true,
        message: 'Role retrieved successfully',
        data: {
          name: role.name,
          description: role.description,
          permissions: role.permissions || [],
          isActive: role.isActive,
          organizationId: role.organizationId,
          createdAt: new Date(role.createdAt).getTime(),
          updatedAt: new Date(role.updatedAt).getTime(),
        },
      });
    } catch (error) {
      logger.error('Error getting role by name via gRPC', error);
      callback({
        code: 'INTERNAL',
        message: 'Internal server error',
      });
    }
  }

  async getAllRoles(call: any, callback: any) {
    try {
      const { organizationId = 'default' } = call.request;

      const roles = await this.roleService.getAllRoles(organizationId);

      const rolesData = roles.map(role => ({
        name: role.name,
        description: role.description,
        permissions: role.permissions || [],
        isActive: role.isActive,
        organizationId: role.organizationId,
        createdAt: new Date(role.createdAt).getTime(),
        updatedAt: new Date(role.updatedAt).getTime(),
      }));

      callback(null, {
        success: true,
        message: 'Roles retrieved successfully',
        data: rolesData,
        total: rolesData.length,
      });
    } catch (error) {
      logger.error('Error getting all roles via gRPC', error);
      callback({
        code: 'INTERNAL',
        message: 'Internal server error',
      });
    }
  }
}
