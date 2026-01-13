/**
 * Logger Utility
 * Centralized logging for the microservice
 */
export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  /**
   * Log info level message
   */
  info(message: string, data?: any): void {
    console.log(
      `[${this.getTimestamp()}] [${this.context}] [INFO] ${message}`,
      data ? JSON.stringify(data, null, 2) : ""
    );
  }

  /**
   * Log warning level message
   */
  warn(message: string, data?: any): void {
    console.warn(
      `[${this.getTimestamp()}] [${this.context}] [WARN] ${message}`,
      data ? JSON.stringify(data, null, 2) : ""
    );
  }

  /**
   * Log error level message
   */
  error(message: string, error?: any): void {
    console.error(
      `[${this.getTimestamp()}] [${this.context}] [ERROR] ${message}`,
      error instanceof Error ? error.stack : JSON.stringify(error, null, 2)
    );
  }

  /**
   * Log debug level message
   */
  debug(message: string, data?: any): void {
    if (
      process.env.DEBUG === "true" ||
      process.env.NODE_ENV === "development"
    ) {
      console.debug(
        `[${this.getTimestamp()}] [${this.context}] [DEBUG] ${message}`,
        data ? JSON.stringify(data, null, 2) : ""
      );
    }
  }

  /**
   * Get current timestamp in ISO format
   */
  private getTimestamp(): string {
    return new Date().toISOString();
  }
}
