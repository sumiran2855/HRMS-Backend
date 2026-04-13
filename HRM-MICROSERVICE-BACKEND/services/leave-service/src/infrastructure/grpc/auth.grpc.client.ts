import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { Logger } from '../../shared/utils/logger.util';

const logger = new Logger('AuthGrpcClient');

interface RetryOptions {
  maxRetries: number;
  retryDelayMs: number;
  timeoutMs: number;
}

export class AuthGrpcClient {
  private client: any;
  private isHealthy: boolean = false;
  private retryOptions: RetryOptions = {
    maxRetries: 3,
    retryDelayMs: 1000,
    timeoutMs: 30000,
  };

  constructor(
    private authServiceUrl: string = 'localhost:5001'
  ) {}

  async initialize(): Promise<void> {
    try {
      if (this.client && this.isHealthy) {
        return;
      }
      const protoPath = path.join(__dirname, '../../../proto', 'auth.proto');
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
      this.isHealthy = true;
      logger.info(`Connected to Auth Service at ${this.authServiceUrl}`);
    } catch (error) {
      logger.error('Failed to initialize Auth gRPC client', error);
      throw error;
    }
  }

  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    operation: string
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 0; attempt <= this.retryOptions.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        if (attempt < this.retryOptions.maxRetries) {
          const delay = this.retryOptions.retryDelayMs * Math.pow(2, attempt);
          logger.warn(
            `${operation} failed (attempt ${attempt + 1}/${this.retryOptions.maxRetries + 1}). Retrying in ${delay}ms...`,
            error
          );
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    logger.error(`${operation} failed after ${this.retryOptions.maxRetries + 1} attempts`, lastError);
    throw lastError;
  }

  private callWithTimeout<T>(
    fn: (callback: (err: any, result: T) => void) => void,
    operation: string
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`${operation} timed out after ${this.retryOptions.timeoutMs}ms`));
      }, this.retryOptions.timeoutMs);

      fn((err: any, result: T) => {
        clearTimeout(timeout);
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  async validateToken(token: string): Promise<any> {
    return this.retryWithBackoff(
      () => this.callWithTimeout(
        (callback) => this.client.validateToken({ token }, callback),
        'validateToken'
      ),
      'validateToken'
    );
  }

  async verifyUserExists(email: string): Promise<any> {
    return this.retryWithBackoff(
      () => this.callWithTimeout(
        (callback) => this.client.verifyUserExists({ email }, callback),
        'verifyUserExists'
      ),
      'verifyUserExists'
    );
  }

  setRetryOptions(options: Partial<RetryOptions>): void {
    this.retryOptions = {
      ...this.retryOptions,
      ...options,
    };
    logger.info('gRPC retry options updated', this.retryOptions);
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
