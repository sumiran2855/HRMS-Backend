import { Request, Response, NextFunction } from "express";
import { Logger } from "../../../shared/utils/logger.util";

const logger = new Logger("ValidationMiddleware");

export interface ValidationErrorResponse {
  field: string;
  message: string;
}

export function validateRequestBody(requiredFields: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: ValidationErrorResponse[] = [];

    requiredFields.forEach((field) => {
      if (!req.body[field]) {
        errors.push({
          field,
          message: `${field} is required`,
        });
      }
    });

    if (errors.length > 0) {
      logger.warn(`Validation error in request`, { errors });
      res.status(400).json({
        success: false,
        message: "Validation error",
        statusCode: 400,
        errors,
      });
      return;
    }

    next();
  };
}

export function sanitizeRequestBody(fieldsToRemove: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    fieldsToRemove.forEach((field) => {
      delete req.body[field];
    });
    next();
  };
}

export function trimRequestBody(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  Object.keys(req.body).forEach((key) => {
    if (typeof req.body[key] === "string") {
      req.body[key] = req.body[key].trim();
    }
  });
  next();
}
