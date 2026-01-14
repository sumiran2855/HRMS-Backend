import dotenv from 'dotenv';

dotenv.config();

export const envConfig = {
  port: parseInt(process.env.PORT || '3002', 10),
  grpcEmployeePort: parseInt(process.env.GRPC_EMPLOYEE_PORT || '5002', 10),
  grpcAuthPort: parseInt(process.env.GRPC_AUTH_PORT || '5001', 10),
  nodeEnv: (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test',

  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/employee-service',

  jwtSecret: process.env.JWT_SECRET || 'TESTING1D',
  jwtExpiration: parseInt(process.env.JWT_EXPIRES_IN || '3600', 10),
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'TESTING1D',
  jwtRefreshExpiration: parseInt(process.env.JWT_REFRESH_EXPIRES_IN || '86400', 10),

  kafkaBroker: process.env.KAFKA_BROKER || 'localhost:9092',
  kafkaClientId: process.env.KAFKA_CLIENT_ID || 'employee-service',

  logLevel: process.env.LOG_LEVEL || 'info',

  isProduction: (process.env.NODE_ENV || 'development') === 'production',
  isDevelopment: (process.env.NODE_ENV || 'development') === 'development',
};

if (!envConfig.mongodbUri) {
  throw new Error('MONGODB_URI environment variable is required');
}

if (!envConfig.jwtSecret) {
  throw new Error('JWT_SECRET environment variable is required');
}
