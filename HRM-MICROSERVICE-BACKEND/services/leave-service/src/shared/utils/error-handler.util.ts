export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: any
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = "Validation failed", details?: any) {
    super(400, message, details);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(404, message);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized access") {
    super(401, message);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Conflict error", details?: any) {
    super(409, message, details);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden access") {
    super(403, message);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

export class ErrorHandler {
  static handle(error: any) {
    if (error instanceof AppError) {
      return {
        statusCode: error.statusCode,
        message: error.message,
        details: error.details,
      };
    }

    return {
      statusCode: 500,
      message: error.message || "Internal Server Error",
      details: process.env.NODE_ENV === "development" ? error : undefined,
    };
  }
}
