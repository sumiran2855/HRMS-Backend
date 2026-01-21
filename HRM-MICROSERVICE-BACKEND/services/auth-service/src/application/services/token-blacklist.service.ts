import { injectable, inject } from 'inversify';
import { ITokenBlacklistRepository } from '../../infrastructure/persistence/token-blacklist.repository';
import jwt from 'jsonwebtoken';
import { envConfig } from '../../config/env.config';

export interface ITokenBlacklistService {
  blacklistToken(token: string, userId: string): Promise<void>;
  isTokenBlacklisted(token: string): Promise<boolean>;
  getTokenExpiration(token: string): Promise<Date | null>;
  blacklistUserTokens(userId: string): Promise<number>;
}

@injectable()
export class TokenBlacklistService implements ITokenBlacklistService {
  constructor(
    @inject('TokenBlacklistRepository')
    private tokenBlacklistRepository: ITokenBlacklistRepository
  ) {}

  async blacklistToken(token: string, userId: string): Promise<void> {
    try {
      const decoded = jwt.decode(token) as any;
      
      if (!decoded || !decoded.exp) {
        throw new Error('Invalid token format');
      }

      const expiresAt = new Date(decoded.exp * 1000);

      await this.tokenBlacklistRepository.add(token, userId, expiresAt);
    } catch (error: any) {
      console.error('[TokenBlacklistService] Error blacklisting token:', error);
      throw new Error(`Failed to blacklist token: ${error.message}`);
    }
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    try {
      return await this.tokenBlacklistRepository.isBlacklisted(token);
    } catch (error: any) {
      console.error('[TokenBlacklistService] Error checking blacklist:', error);
      return false;
    }
  }

  async getTokenExpiration(token: string): Promise<Date | null> {
    try {
      const decoded = jwt.decode(token) as any;
      if (decoded && decoded.exp) {
        return new Date(decoded.exp * 1000);
      }
      return null;
    } catch (error) {
      console.error('[TokenBlacklistService] Error getting token expiration:', error);
      return null;
    }
  }

  async blacklistUserTokens(userId: string): Promise<number> {
    try {
      const blacklistedTokens = await this.tokenBlacklistRepository.findByUserId(
        userId
      );
      return blacklistedTokens.length;
    } catch (error: any) {
      console.error('[TokenBlacklistService] Error blacklisting user tokens:', error);
      return 0;
    }
  }
}
