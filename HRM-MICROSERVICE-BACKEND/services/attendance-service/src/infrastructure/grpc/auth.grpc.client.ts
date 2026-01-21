import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { Logger } from '../../shared/utils/logger.util';

const logger = new Logger('AuthGrpcClient');

export class AuthGrpcClient {
  private client: any;
  private isHealthy: boolean = false;

  constructor(
    private authServiceUrl: string = 'localhost:5001'
  ) {}

  async initialize(): Promise<void> {
    try {
      if(this.client && this.isHealthy) {
        return;
      }
      const protoPath = path.join(__dirname, '../../../../proto', 'auth.proto');
      const packageDefinition = protoLoader.loadSync(
        protoPath,
        {
          keepCase: true,
          longs: String,
          enums: String,
          defaults: true,
          oneofs: true,
        }
      );

      const authProto: any = grpc.loadPackageDefinition(packageDefinition);
      this.client = new authProto.auth.AuthService(
        this.authServiceUrl,
        grpc.credentials.createInsecure()
      );
      await this.healthCheck();
      this.isHealthy = true;
      logger.info(`Connected to Auth Service at ${this.authServiceUrl}`);
    } catch (error) {
      this.isHealthy = false;
      logger.error('Failed to initialize Auth gRPC client', error);
      throw error;
    }
  }

  async healthCheck(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Auth Service at ${this.authServiceUrl} is not responding`));
      }, 5000);
      this.client.getAllRoles({ organizationId: 'default' }, (err: any, response: any) => {
        clearTimeout(timeout);
        if (err) {
          logger.error('Auth Service health check failed', err);
          reject(err);
        }
        else {
          logger.info('Auth Service is healthy');
          resolve();
        }
      });
    });
  }

  async validateToken(token: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.client.validateToken(
        { token },
        (err: any, response: any) => {
          if (err) {
            logger.error('Failed to validate token', err);
            resolve(false);
          } else {
            resolve(response.isValid);
          }
        }
      );
    });
  }

  async getCurrentUser(userId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.getCurrentUser(
        { userId },
        (err: any, response: any) => {
          if (err) {
            logger.error('Failed to get current user', err);
            reject(err);
          } else {
            resolve(response.data);
          }
        }
      );
    });
  }

  async getRoleByName(name: string, organizationId: string = 'default'): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.getRoleByName(
        { name, organizationId },
        (err: any, response: any) => {
          if (err) {
            logger.error(`Failed to get role ${name}`, err);
            reject(err);
          } else if (response && response.data) {
            resolve(response.data);
          } else {
            resolve(null);
          }
        }
      );
    });
  }

  async getAllRoles(organizationId: string = 'default'): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.client.getAllRoles(
        { organizationId },
        (err: any, response: any) => {
          if (err) {
            logger.error('Failed to get all roles', err);
            reject(err);
          } else if (response && response.data) {
            resolve(response.data);
          } else {
            resolve([]);
          }
        }
      );
    });
  }

  close(): Promise<void> {
    return new Promise((resolve) => {
      if (this.client) {
        this.client.close();
        logger.info('Closed Auth gRPC client connection');
        resolve();
      }
    });
  }
}
