import { injectable } from "inversify";
import jwt, { SignOptions } from "jsonwebtoken";
import { envConfig } from "../../config/env.config";

export interface ITokenPayload {
  userId: string;
  email: string;
  username: string;
  organizationId?: string;
  role?: string;
  permissions?: string[];
}

export interface IJwtService {
  generateToken(payload: ITokenPayload): string;
  generateRefreshToken(payload: ITokenPayload): string;
  verifyToken(token: string): ITokenPayload | null;
  verifyRefreshToken(token: string): ITokenPayload | null;
}

@injectable()
export class JwtService implements IJwtService {
  generateToken(payload: ITokenPayload): string {
    const options: SignOptions = {
      expiresIn: envConfig.jwtExpiration || '1h',
      subject: payload.userId,
      algorithm: 'HS256',
    };
    
    const tokenPayload = {
      userId: payload.userId,
      email: payload.email,
      username: payload.username,
      organizationId: payload.organizationId || 'default',
      role: payload.role || 'employee',
      permissions: payload.permissions || [],
    };
    
    return jwt.sign(tokenPayload, envConfig.jwtSecret as string, options);
  }

  generateRefreshToken(payload: ITokenPayload): string {
    const options: SignOptions = {
      expiresIn: envConfig.jwtRefreshExpiration || '7d',
      subject: payload.userId,
      algorithm: 'HS256',
    };
    
    const tokenPayload = {
      userId: payload.userId,
      email: payload.email,
      username: payload.username,
      organizationId: payload.organizationId || 'default',
      role: payload.role || 'employee',
    };
    
    return jwt.sign(tokenPayload, envConfig.jwtRefreshSecret as string, options);
  }

  verifyToken(token: string): ITokenPayload | null {
    try {
      const decoded = jwt.verify(token, envConfig.jwtSecret, {
        algorithms: ['HS256'],
      }) as ITokenPayload & { iat: number; exp: number };
      
      // Additional validation
      if (!decoded.userId || !decoded.email) {
        console.error('[JwtService] Invalid token payload: missing userId or email');
        return null;
      }
      
      return decoded;
    } catch (error: any) {
      console.error('[JwtService] Token verification failed:', error.message);
      return null;
    }
  }

  verifyRefreshToken(token: string): ITokenPayload | null {
    try {
      const decoded = jwt.verify(token, envConfig.jwtRefreshSecret, {
        algorithms: ['HS256'],
      }) as ITokenPayload & { iat: number; exp: number };
      
      if (!decoded.userId || !decoded.email) {
        console.error('[JwtService] Invalid refresh token payload: missing userId or email');
        return null;
      }
      
      return decoded;
    } catch (error: any) {
      console.error('[JwtService] Refresh token verification failed:', error.message);
      return null;
    }
  }
}
