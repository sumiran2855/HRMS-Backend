import mongoose, { Document, Schema } from 'mongoose';

export interface ITokenBlacklist extends Document {
  token: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
}

const tokenBlacklistSchema = new Schema<ITokenBlacklist>(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: false }
);

tokenBlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const TokenBlacklistModel = mongoose.model<ITokenBlacklist>(
  'TokenBlacklist',
  tokenBlacklistSchema,
  'token_blacklist'
);
