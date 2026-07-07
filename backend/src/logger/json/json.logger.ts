import { Injectable, LoggerService, LogLevel } from '@nestjs/common';
import { LogEntry } from '../log-entry.interface';
import { serializeValue } from '../log-utils';

@Injectable()
export class JsonLogger implements LoggerService {
  private formatMessage(
    level: LogLevel,
    message: unknown,
    context?: string,
    stack?: string,
  ): string {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message: serializeValue(message),
      ...(context && { context }),
      ...(stack && { stack }),
    };

    return JSON.stringify(entry);
  }

  log(message: unknown, context?: string): void {
    console.log(this.formatMessage('log', message, context));
  }

  error(message: unknown, stack?: string, context?: string): void {
    console.error(this.formatMessage('error', message, context, stack));
  }

  warn(message: unknown, context?: string): void {
    console.warn(this.formatMessage('warn', message, context));
  }

  debug(message: unknown, context?: string): void {
    console.debug(this.formatMessage('debug', message, context));
  }

  verbose(message: unknown, context?: string): void {
    console.info(this.formatMessage('verbose', message, context));
  }
}
