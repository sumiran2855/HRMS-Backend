export interface GrpcServiceConfig {
  authServiceUrl: string;
  employeeServiceUrl: string;
  grpcAuthPort: number;
  grpcEmployeePort: number;
}

export const grpcConfig: GrpcServiceConfig = {
  authServiceUrl: process.env.AUTH_SERVICE_GRPC_URL || 'localhost:5001',
  employeeServiceUrl: process.env.EMPLOYEE_SERVICE_GRPC_URL || 'localhost:5002',
  grpcAuthPort: parseInt(process.env.GRPC_AUTH_PORT || '5001'),
  grpcEmployeePort: parseInt(process.env.GRPC_EMPLOYEE_PORT || '5002'),
};
