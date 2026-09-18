export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  [key: string]: unknown;
}

export class Logger {
  private context: string;

  constructor(context: string = 'Bot') {
    this.context = context;
  }

  private format(level: LogLevel, message: string, meta?: LogContext): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta && Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] [${this.context}]: ${message}${metaStr}`;
  }

  debug(message: string, meta?: LogContext): void {
    if (process.env.NODE_ENV !== 'production' || process.env.DEBUG === 'true') {
      console.debug(this.format('debug', message, meta));
    }
  }

  info(message: string, meta?: LogContext): void {
    console.info(this.format('info', message, meta));
  }

  warn(message: string, meta?: LogContext): void {
    console.warn(this.format('warn', message, meta));
  }

  error(message: string, meta?: LogContext): void {
    console.error(this.format('error', message, meta));
  }

  forSubsystem(subsystem: string): Logger {
    return new Logger(`${this.context}:${subsystem}`);
  }
}

export const logger = new Logger('ASC-Sync');
