import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Logger } from "../utils/logger.util";

const logger = new Logger("AuthMiddleware");

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    organizationId: string;
    role: string;
    permissions: string[];
  };
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      res.status(401).json({
        success: false,
        message: "No token provided",
        statusCode: 401,
      });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as any;

    req.user = {
      userId: decoded.sub || decoded.userId,
      email: decoded.email,
      organizationId: decoded.organizationId,
      role: decoded.role,
      permissions: decoded.permissions || [],
    };

    logger.info(`[${req.user.userId}] Authenticated`);
    next();
  } catch (error) {
    logger.error("Auth middleware error", error);
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
      statusCode: 401,
    });
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
        statusCode: 401,
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      logger.warn(
        `[${req.user.userId}] Unauthorized access attempt. Required roles: ${roles.join(", ")}, User role: ${req.user.role}`
      );
      res.status(403).json({
        success: false,
        message: "Insufficient permissions",
        statusCode: 403,
      });
      return;
    }

    next();
  };
};

export const requirePermission = (...permissions: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
        statusCode: 401,
      });
      return;
    }

    const hasPermission = permissions.every((permission) =>
      req.user!.permissions.includes(permission)
    );

    if (!hasPermission) {
      logger.warn(
        `[${req.user.userId}] Missing permission. Required: ${permissions.join(", ")}`
      );
      res.status(403).json({
        success: false,
        message: "Missing required permissions",
        statusCode: 403,
      });
      return;
    }

    next();
  };
};
