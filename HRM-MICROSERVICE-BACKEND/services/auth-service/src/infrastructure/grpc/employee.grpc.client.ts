import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { Logger } from '../../shared/utils/logger.util';

const logger = new Logger('EmployeeGrpcClient');

export class EmployeeGrpcClient {
  private client: any;
  private channel: grpc.Channel | null = null;

  constructor(
    private employeeServiceUrl: string = 'localhost:5002'
  ) {}

  async initialize(): Promise<void> {
    try {
      const protoPath = path.join(__dirname, '../../../../proto', 'employee.proto');
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

      const employeeProto: any = grpc.loadPackageDefinition(packageDefinition);
      this.client = new employeeProto.employee.EmployeeService(
        this.employeeServiceUrl,
        grpc.credentials.createInsecure()
      );

      logger.info(`Connected to Employee Service at ${this.employeeServiceUrl}`);
    } catch (error) {
      logger.error('Failed to initialize Employee gRPC client', error);
      throw error;
    }
  }

  async getEmployeeByEmail(email: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.getEmployeeByEmail(
        { email },
        (err: any, response: any) => {
          if (err) {
            logger.error('Failed to get employee by email', err);
            reject(err);
          } else {
            resolve(response.data);
          }
        }
      );
    });
  }

  async getEmployeeById(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.getEmployeeById(
        { id },
        (err: any, response: any) => {
          if (err) {
            logger.error('Failed to get employee by ID', err);
            reject(err);
          } else {
            resolve(response.data);
          }
        }
      );
    });
  }

  async getAllEmployees(filter?: any): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.client.getAllEmployees(
        { filter: filter || {} },
        (err: any, response: any) => {
          if (err) {
            logger.error('Failed to get all employees', err);
            reject(err);
          } else {
            resolve(response.data || []);
          }
        }
      );
    });
  }

  close(): Promise<void> {
    return new Promise((resolve) => {
      if (this.client) {
        this.client.close();
        logger.info('Closed Employee gRPC client connection');
        resolve();
      }
    });
  }
}
