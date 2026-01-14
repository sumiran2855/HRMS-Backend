import { Request, Response } from "express";
import { Logger } from "./logger.util";

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ErrorHandler {
  static handle(error: any, req: Request, res: Response, logger: Logger): void {
    const requestId = (req as any).id;

    logger.error(`[${requestId}] ${error.message}`, error);

    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
        statusCode: error.statusCode,
        requestId,
      });
      return;
    }

    if (error.name === "ValidationError") {
      res.status(400).json({
        success: false,
        message: "Validation error",
        statusCode: 400,
        errors: error.errors,
        requestId,
      });
      return;
    }

    if (error.name === "CastError") {
      res.status(400).json({
        success: false,
        message: "Invalid ID format",
        statusCode: 400,
        requestId,
      });
      return;
    }

    if (error.name === "JsonWebTokenError") {
      res.status(401).json({
        success: false,
        message: "Invalid token",
        statusCode: 401,
        requestId,
      });
      return;
    }

    if (error.name === "TokenExpiredError") {
      res.status(401).json({
        success: false,
        message: "Token expired",
        statusCode: 401,
        requestId,
      });
      return;
    }

    logger.error(`[${requestId}] Unhandled error:`, error);

    const isDevelopment = process.env.NODE_ENV === "development";
    const message = isDevelopment ? error.message : "Internal server error";

    res.status(500).json({
      success: false,
      message,
      statusCode: 500,
      ...(isDevelopment && { error: error.message }),
      requestId,
    });
  }
}
