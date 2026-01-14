import dotenv from "dotenv";

dotenv.config();
export const envConfig = { 
    port: parseInt(process.env.PORT || "3003"),
    grpcAttendancePort: parseInt(process.env.GRPC_ATTENDANCE_PORT || "5003"),
    mongodbUri: process.env.MONGODB_URI || "mongodb://localhost:27017/hrms_attendance",
    jwtSecret: process.env.JWT_SECRET || "default_secret_change_this",
    jwtExpiration: parseInt(process.env.JWT_EXPIRES_IN || "3600"),
    nodeEnv: process.env.NODE_ENV || "development",
};