import { injectable } from 'inversify';
import { TokenBlacklistModel, ITokenBlacklist } from './token-blacklist.schema';

export interface ITokenBlacklistRepository {
  add(token: string, userId: string, expiresAt: Date): Promise<ITokenBlacklist>;
  isBlacklisted(token: string): Promise<boolean>;
  removeExpired(): Promise<number>;
  findByToken(token: string): Promise<ITokenBlacklist | null>;
  findByUserId(userId: string): Promise<ITokenBlacklist[]>;
}

@injectable()
export class TokenBlacklistRepository implements ITokenBlacklistRepository {
  async add(
    token: string,
    userId: string,
    expiresAt: Date
  ): Promise<ITokenBlacklist> {
    const blacklistedToken = new TokenBlacklistModel({
      token,
      userId,
      expiresAt,
    });
    console.log("🚀 ~ TokenBlacklistRepository ~ add ~ blacklistedToken:", blacklistedToken)
    return await blacklistedToken.save();
  }

  async isBlacklisted(token: string): Promise<boolean> {
    const blacklistedToken = await TokenBlacklistModel.findOne({
      token,
      expiresAt: { $gt: new Date() },
    });
    return !!blacklistedToken;
  }

  async removeExpired(): Promise<number> {
    const result = await TokenBlacklistModel.deleteMany({
      expiresAt: { $lt: new Date() },
    });
    return result.deletedCount || 0;
  }

  async findByToken(token: string): Promise<ITokenBlacklist | null> {
    return await TokenBlacklistModel.findOne({ token });
  }

  async findByUserId(userId: string): Promise<ITokenBlacklist[]> {
    return await TokenBlacklistModel.find({
      userId,
      expiresAt: { $gt: new Date() },
    });
  }
}
