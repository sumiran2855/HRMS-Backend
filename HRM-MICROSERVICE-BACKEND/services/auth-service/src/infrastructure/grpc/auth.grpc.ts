import * as grpc from '@grpc/grpc-js';
import { Container } from 'inversify';
import { AuthService } from '../../application/services/auth.service';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { Logger } from '../../shared/utils/logger.util';

const logger = new Logger('AuthGrpcImpl');

export class AuthGrpcImpl {
  private authService: AuthService;
  private userRepository: IUserRepository;

  constructor(container: Container) {
    this.authService = container.get<AuthService>('AuthService');
    this.userRepository = container.get<IUserRepository>('UserRepository');
  }

  async register(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const { email, password, fullName,role } = call.request;

      logger.debug('gRPC: Registering user', email);

      const result = await this.authService.register(
        email,
        password,
        fullName,
        role
      );

      callback(null, {
        success: true,
        message: 'User registered successfully',
        data: result,
      });
    } catch (error: any) {
      logger.error('gRPC: Registration failed', error);
      callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: error.message || 'Registration failed',
      });
    }
  }

  async login(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const { email, password } = call.request;

      logger.debug('gRPC: User login', email);

      const result = await this.authService.login(email, password);

      callback(null, {
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error: any) {
      logger.error('gRPC: Login failed', error);
      callback({
        code: grpc.status.UNAUTHENTICATED,
        message: error.message || 'Login failed',
      });
    }
  }

  async validateToken(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const { token } = call.request;

      logger.debug('gRPC: Validating token');

      const result = await this.authService.validateToken(token);

      callback(null, {
        success: true,
        isValid: !!result,
        message: result ? 'Token is valid' : 'Token is invalid',
        userData: result || undefined,
      });
    } catch (error: any) {
      logger.error('gRPC: Token validation failed', error);
      callback({
        code: grpc.status.UNAUTHENTICATED,
        message: error.message || 'Token validation failed',
      });
    }
  }

  async refreshToken(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const { refreshToken } = call.request;

      logger.debug('gRPC: Refreshing token');

      const result = await this.authService.refreshToken(refreshToken);

      callback(null, {
        success: true,
        message: 'Token refreshed successfully',
        data: result,
      });
    } catch (error: any) {
      logger.error('gRPC: Token refresh failed', error);
      callback({
        code: grpc.status.UNAUTHENTICATED,
        message: error.message || 'Token refresh failed',
      });
    }
  }

  async getCurrentUser(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const { userId } = call.request;

      logger.debug('gRPC: Getting current user', userId);

      const result = await this.authService.getCurrentUser(userId);

      if (!result) {
        callback({
          code: grpc.status.NOT_FOUND,
          message: 'User not found',
        });
        return;
      }

      callback(null, {
        success: true,
        message: 'User retrieved successfully',
        data: result,
      });
    } catch (error: any) {
      logger.error('gRPC: Failed to get user', error);
      callback({
        code: grpc.status.INTERNAL,
        message: error.message || 'Failed to get user',
      });
    }
  }

  async verifyUserExists(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const { email } = call.request;

      logger.debug('gRPC: Verifying user exists', email);

      let exists = false;
      if (email) {
        const user = await this.userRepository.findByEmail(email);
        exists = !!user;
      }

      callback(null, {
        success: true,
        exists,
        message: exists ? 'User exists' : 'User does not exist',
      });
    } catch (error: any) {
      logger.error('gRPC: Failed to verify user', error);
      callback({
        code: grpc.status.INTERNAL,
        message: error.message || 'Failed to verify user',
      });
    }
  }
}
