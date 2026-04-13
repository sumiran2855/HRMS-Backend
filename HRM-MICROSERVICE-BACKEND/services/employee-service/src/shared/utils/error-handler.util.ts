import { Response } from 'express';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ErrorHandler {
  static handle(error: any, res: Response): void {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';

    res.status(statusCode).json({
      success: false,
      message,
      statusCode,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
  }
}
