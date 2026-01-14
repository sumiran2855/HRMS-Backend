import { injectable } from "inversify";
import jwt, { SignOptions } from "jsonwebtoken";
import { envConfig } from "../../config/env.config";

export interface ITokenPayload {
  userId: string;
  email: string;
  username: string;
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
      expiresIn: envConfig.jwtExpiration,
    };
    return jwt.sign(payload, envConfig.jwtSecret as string, options);
  }

  generateRefreshToken(payload: ITokenPayload): string {
    const options: SignOptions = {
      expiresIn: envConfig.jwtRefreshExpiration,
    };
    return jwt.sign(payload, envConfig.jwtRefreshSecret as string, options);
  }

  verifyToken(token: string): ITokenPayload | null {
    try {
      const decoded = jwt.verify(token, envConfig.jwtSecret) as ITokenPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }

  verifyRefreshToken(token: string): ITokenPayload | null {
    try {
      const decoded = jwt.verify(
        token,
        envConfig.jwtRefreshSecret
      ) as ITokenPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }
}
