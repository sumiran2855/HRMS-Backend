import { Request, Response, NextFunction } from "express";
import { JwtService } from "../../../application/services/jwt.service";
import { Logger } from "../../../shared/utils/logger.util";
import { AppError } from "../../../shared/utils/error-handler.util";
import {
  HTTP_STATUS,
  ERROR_MESSAGES,
} from "../../../shared/constants/messages.constant";

const logger = new Logger("AuthMiddleware");
const jwtService = new JwtService();

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError(ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
    }

    const token = authHeader.substring(7);

    const payload = jwtService.verifyToken(token);

    if (!payload) {
      throw new AppError(
        ERROR_MESSAGES.INVALID_TOKEN,
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    (req as any).user = payload;

    logger.debug(`Authenticated user: ${payload.userId}`);
    next();
  } catch (error) {
    const appError =
      error instanceof AppError
        ? error
        : new AppError(ERROR_MESSAGES.INVALID_TOKEN, HTTP_STATUS.UNAUTHORIZED);

    next(appError);
  }
}

export async function optionalAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const payload = jwtService.verifyToken(token);
      if (payload) {
        (req as any).user = payload;
        logger.debug(`Optional auth - Authenticated user: ${payload.userId}`);
      }
    }

    next();
  } catch (error) {
    logger.debug("Optional auth - No valid token provided");
    next();
  }
}

export function createAuthMiddleware(jwtSvc: JwtService) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new AppError(
          ERROR_MESSAGES.UNAUTHORIZED,
          HTTP_STATUS.UNAUTHORIZED
        );
      }

      const token = authHeader.substring(7);
      const payload = jwtSvc.verifyToken(token);

      if (!payload) {
        throw new AppError(
          ERROR_MESSAGES.INVALID_TOKEN,
          HTTP_STATUS.UNAUTHORIZED
        );
      }

      (req as any).user = payload;
      logger.debug(`Authenticated user: ${payload.userId}`);
      next();
    } catch (error) {
      const appError =
        error instanceof AppError
          ? error
          : new AppError(
              ERROR_MESSAGES.INVALID_TOKEN,
              HTTP_STATUS.UNAUTHORIZED
            );

      next(appError);
    }
  };
}
