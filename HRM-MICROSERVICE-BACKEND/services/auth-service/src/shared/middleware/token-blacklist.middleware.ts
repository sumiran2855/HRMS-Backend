import { Request, Response, NextFunction } from "express";
import { container } from "../../bootstrap/container.bootstrap";
import { ITokenBlacklistService } from "../../application/services/token-blacklist.service";
import { Logger } from "../utils/logger.util";

const logger = new Logger("TokenBlacklistMiddleware");

export const tokenBlacklistCheckMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    // If no auth header, skip blacklist check
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.substring(7);
    const tokenBlacklistService = container.get<ITokenBlacklistService>(
      "TokenBlacklistService"
    );

    // Check if token is blacklisted
    const isBlacklisted = await tokenBlacklistService.isTokenBlacklisted(token);
    
    if (isBlacklisted) {
      logger.warn(
        `[TokenBlacklistMiddleware] Blacklisted token attempt from ${req.ip}`
      );
      res.status(401).json({
        success: false,
        message: "Token has been revoked. Please login again.",
        statusCode: 401,
      });
      return;
    }

    next();
  } catch (error: any) {
    logger.error("[TokenBlacklistMiddleware] Error checking token blacklist:", error);
    // Fail open - if check fails, allow the request to proceed
    next();
  }
};
