import dotenv from "dotenv";

dotenv.config();

export const envConfig = {
  port: parseInt(process.env.PORT || "3001"),
  grpcAuthPort: parseInt(process.env.GRPC_AUTH_PORT || "5001"),
  mongodbUri: process.env.MONGODB_URI || "mongodb://localhost:27017/hrms_auth",
  jwtSecret: process.env.JWT_SECRET || "default_secret_change_this",
  jwtExpiration: parseInt(process.env.JWT_EXPIRES_IN || "3600"),
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "default_refresh_secret",
  jwtRefreshExpiration: parseInt(process.env.JWT_REFRESH_EXPIRES_IN || "86400"),
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || "10"),
  nodeEnv: process.env.NODE_ENV || "development",
};
