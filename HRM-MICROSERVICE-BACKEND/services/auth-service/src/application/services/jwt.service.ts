import { injectable } from 'inversify';
import jwt, { SignOptions } from 'jsonwebtoken';
import { envConfig } from '../../config/env.config';

export interface ITokenPayload {
  userId: string;
  email: string;
  username: string;
}

export interface IJwtService {
  generateToken(payload: ITokenPayload): string;
  verifyToken(token: string): ITokenPayload | null;
  refreshToken(token: string): string | null;
}

@injectable()
export class JwtService implements IJwtService {
  generateToken(payload: ITokenPayload): string {
    const options: SignOptions = {
      expiresIn: parseInt(envConfig.jwtExpiration, 10),
    };
    return jwt.sign(payload, envConfig.jwtSecret as string, options);
  }

  verifyToken(token: string): ITokenPayload | null {
    try {
      const decoded = jwt.verify(token, envConfig.jwtSecret) as ITokenPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }

  refreshToken(token: string): string | null {
    const payload = this.verifyToken(token);
    if (!payload) {
      return null;
    }
    return this.generateToken(payload);
  }
}
