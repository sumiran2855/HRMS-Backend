import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Logger } from "../utils/logger.util";

const logger = new Logger("AuthMiddleware");

export interface AuthRequest extends Request {
  headers: any;
  user?: {
    userId: string;
    email: string;
    organizationId: string;
    role: string;
    permissions: string[];
  };
  token?: string;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logger.warn("[AuthMiddleware] Missing or invalid Authorization header");
      res.status(401).json({
        success: false,
        message: "No token provided",
        statusCode: 401,
      });
      return;
    }

    const token = authHeader.substring(7);
    const secret = process.env.JWT_SECRET || "TESTING1D";
    let decoded: any;
    try {
      decoded = jwt.verify(token, secret, {
        algorithms: ["HS256"],
      });
    } catch (jwtError: any) {
      logger.error("[AuthMiddleware] JWT verification failed:", jwtError.message);
      const statusCode = jwtError.name === "TokenExpiredError" ? 401 : 403;
      const message =
        jwtError.name === "TokenExpiredError"
          ? "Token has expired"
          : "Invalid token";
      res.status(statusCode).json({
        success: false,
        message,
        statusCode,
      });
      return;
    }

    if (
      !decoded.userId ||
      !decoded.email ||
      !decoded.sub ||
      decoded.sub !== decoded.userId
    ) {
      logger.error(
        "[AuthMiddleware] Invalid token claims:",
        Object.keys(decoded)
      );
      res.status(403).json({
        success: false,
        message: "Invalid token claims",
        statusCode: 403,
      });
      return;
    }

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      organizationId: decoded.organizationId || "default",
      role: decoded.role || "employee",
      permissions: Array.isArray(decoded.permissions) ? decoded.permissions : [],
    };
    req.token = token;

    logger.info(`[${decoded.userId}] Authenticated with role: ${decoded.role}`);
    next();
  } catch (error: any) {
    logger.error("[AuthMiddleware] Unexpected error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      statusCode: 500,
    });
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      logger.warn(
        "[requireRole] No user in request - authMiddleware not applied"
      );
      res.status(401).json({
        success: false,
        message: "Authentication required",
        statusCode: 401,
      });
      return;
    }

    const userRole = req.user.role;
    const normalizedRoles = roles.map((r) => r.toLowerCase());
    const normalizedUserRole = userRole.toLowerCase();

    if (!normalizedRoles.includes(normalizedUserRole)) {
      logger.warn(
        `[${req.user.userId}] Insufficient role. Required: [${roles.join(
          ", "
        )}], User has: ${userRole}`
      );
      res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(", ")}`,
        statusCode: 403,
      });
      return;
    }

    logger.info(
      `[${req.user.userId}] Role check passed for role: ${userRole}`
    );
    next();
  };
};

export const requirePermission = (...permissions: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      logger.warn(
        "[requirePermission] No user in request - authMiddleware not applied"
      );
      res.status(401).json({
        success: false,
        message: "Authentication required",
        statusCode: 401,
      });
      return;
    }

    const userPermissions = req.user.permissions || [];
    const hasAllPermissions = permissions.every((permission) =>
      userPermissions.includes(permission)
    );

    if (!hasAllPermissions) {
      const missingPermissions = permissions.filter(
        (p) => !userPermissions.includes(p)
      );
      logger.warn(
        `[${req.user.userId}] Missing permissions: [${missingPermissions.join(
          ", "
        )}]`
      );
      res.status(403).json({
        success: false,
        message: "Insufficient permissions",
        statusCode: 403,
        requiredPermissions: permissions,
        missingPermissions,
      });
      return;
    }

    logger.info(
      `[${req.user.userId}] Permission check passed for: [${permissions.join(
        ", "
      )}]`
    );
    next();
  };
};

export const optionalAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      next();
      return;
    }

    const token = authHeader.substring(7);
    const secret = process.env.JWT_SECRET || "TESTING1D";

    const decoded = jwt.verify(token, secret, {
      algorithms: ["HS256"],
    }) as any;

    if (decoded.userId && decoded.email && decoded.sub === decoded.userId) {
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        organizationId: decoded.organizationId || "default",
        role: decoded.role || "employee",
        permissions: Array.isArray(decoded.permissions) ? decoded.permissions : [],
      };
      req.token = token;
      logger.info(
        `[${decoded.userId}] Optionally authenticated with role: ${decoded.role}`
      );
    }

    next();
  } catch (error: any) {
    logger.debug("[optionalAuth] Token validation failed, continuing without auth");
    next();
  }
};
