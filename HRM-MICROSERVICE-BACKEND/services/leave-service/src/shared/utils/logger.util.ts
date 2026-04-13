export class Logger {
  constructor(private context: string = "Application") {}

  info(message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${this.context}] [INFO] ${message}`, data ? data : "");
  }

  debug(message: string, data?: any): void {
    if (process.env.NODE_ENV === "development") {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] [${this.context}] [DEBUG] ${message}`, data ? data : "");
    }
  }

  error(message: string, error?: any): void {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [${this.context}] [ERROR] ${message}`, error ? error : "");
  }

  warn(message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] [${this.context}] [WARN] ${message}`, data ? data : "");
  }
}
