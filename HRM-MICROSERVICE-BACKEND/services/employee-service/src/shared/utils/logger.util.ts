export class Logger {
  constructor(private context: string = 'App') {}

  info(message: string, data?: any): void {
    console.log(`[${this.context}] INFO: ${message}`, data || '');
  }

  warn(message: string, data?: any): void {
    console.warn(`[${this.context}] WARN: ${message}`, data || '');
  }

  error(message: string, error?: any): void {
    console.error(`[${this.context}] ERROR: ${message}`, error || '');
  }

  debug(message: string, data?: any): void {
    console.log(`[${this.context}] DEBUG: ${message}`, data || '');
  }
}
