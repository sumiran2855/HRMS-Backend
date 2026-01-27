import { Logger } from "../shared/utils/logger.util";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });
const logger = new Logger("EnvConfig");

export interface IEnvConfig {
  nodeEnv: string;
  port: number;
  databaseUri: string;
  grpcPort: number;
  logLevel: string;
  jwtSecret: string;
  corsOrigin: string;
  authServiceUrl: string;
  employeeServiceUrl: string;
}

const requiredEnvVars = [
  "DATABASE_URI",
  "JWT_SECRET",
];

const validateEnvVars = (): void => {
  const missingVars = requiredEnvVars.filter((env) => !process.env[env]);
  if (missingVars.length > 0) {
    logger.error(`Missing required environment variables: ${missingVars.join(", ")}`);
    throw new Error(`Missing required environment variables: ${missingVars.join(", ")}`);
  }
};

export const envConfig: IEnvConfig = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "3004", 10),
  databaseUri: process.env.DATABASE_URI || "mongodb://localhost:27017/leave_service",
  grpcPort: parseInt(process.env.GRPC_PORT || "5004", 10),
  logLevel: process.env.LOG_LEVEL || "debug",
  jwtSecret: process.env.JWT_SECRET || "secret",
  corsOrigin: process.env.CORS_ORIGIN || "*",
  authServiceUrl: process.env.AUTH_SERVICE_URL || "localhost:50051",
  employeeServiceUrl: process.env.EMPLOYEE_SERVICE_URL || "localhost:50052",
};

validateEnvVars();

