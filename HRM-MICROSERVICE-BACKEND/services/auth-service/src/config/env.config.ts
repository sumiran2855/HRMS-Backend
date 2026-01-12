import dotenv from 'dotenv';

dotenv.config();

export const envConfig = {
  port: process.env.PORT || 3001,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/hrms_auth',
  jwtSecret: process.env.JWT_SECRET || 'default_secret_change_this',
  jwtExpiration: process.env.JWT_EXPIRATION || '24h',
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10'),
  nodeEnv: process.env.NODE_ENV || 'development',
};
