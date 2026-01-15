import { injectable } from 'inversify';
import { Logger } from '../../shared/utils/logger.util';

const logger = new Logger('AuthGrpcImpl');

@injectable()
export class AuthGrpcImpl {
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
}
