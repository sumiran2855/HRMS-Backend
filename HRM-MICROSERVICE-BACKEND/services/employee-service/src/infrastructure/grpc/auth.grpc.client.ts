import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { Logger } from '../../shared/utils/logger.util';

const logger = new Logger('AuthGrpcClient');

export class AuthGrpcClient {
  private client: any;
  private channel: grpc.Channel | null = null;

  constructor(
    private authServiceUrl: string = 'localhost:5001'
  ) {}

  async initialize(): Promise<void> {
    try {
      const protoPath = path.join(__dirname, '../../../proto');
      const packageDefinition = protoLoader.loadSync(
        path.join(protoPath, 'auth.proto'),
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

      logger.info(`Connected to Auth Service at ${this.authServiceUrl}`);
    } catch (error) {
      logger.error('Failed to initialize Auth gRPC client', error);
      throw error;
    }
  }

  async verifyUserExists(email: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.client.verifyUserExists(
        { email },
        (err: any, response: any) => {
          if (err) {
            logger.error('Failed to verify user exists', err);
            reject(err);
          } else {
            resolve(response.exists);
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
