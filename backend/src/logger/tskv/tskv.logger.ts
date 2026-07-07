import { Injectable, LoggerService, LogLevel } from '@nestjs/common';
import { LogEntry } from '../log-entry.interface';
import { serializeValue } from '../log-utils';

@Injectable()
export class TskvLogger implements LoggerService {
  private escapeValue(value: string): string {
    return value
      .replace(/\\/g, '\\\\')
      .replace(/\t/g, '\\t')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r');
  }

  private formatMessage(entry: LogEntry): string {
    const pairs: string[] = [
      `time=${this.escapeValue(entry.timestamp)}`,
      `level=${this.escapeValue(entry.level)}`,
      `message=${this.escapeValue(entry.message)}`,
    ];

    if (entry.context) {
      pairs.push(`context=${this.escapeValue(entry.context)}`);
    }

    if (entry.stack) {
      pairs.push(`stack=${this.escapeValue(entry.stack)}`);
    }

    return pairs.join('\t') + '\n';
  }

  private writeLog(
    level: LogLevel,
    message: unknown,
    stream: NodeJS.WritableStream,
    context?: string,
    stack?: string,
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message: serializeValue(message, true),
      ...(context && { context }),
      ...(stack && { stack }),
    };
    stream.write(this.formatMessage(entry));
  }

  log(message: unknown, context?: string): void {
    this.writeLog('log', message, process.stdout, context);
  }

  error(message: unknown, stack?: string, context?: string): void {
    this.writeLog('error', message, process.stderr, context, stack);
  }

  warn(message: unknown, context?: string): void {
    this.writeLog('warn', message, process.stdout, context);
  }

  debug(message: unknown, context?: string): void {
    this.writeLog('debug', message, process.stdout, context);
  }

  verbose(message: unknown, context?: string): void {
    this.writeLog('verbose', message, process.stdout, context);
  }
}
