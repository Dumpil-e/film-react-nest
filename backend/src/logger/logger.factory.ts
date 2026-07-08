import { LoggerService } from '@nestjs/common';
import { DevLogger } from './dev/dev.logger';
import { JsonLogger } from './json/json.logger';
import { TskvLogger } from './tskv/tskv.logger';

export type LoggerType = 'dev' | 'json' | 'tskv';

export function createLogger(): LoggerService {
  const loggerType = (process.env.LOGGER_TYPE || 'dev') as LoggerType;

  switch (loggerType) {
    case 'json':
      return new JsonLogger();
    case 'tskv':
      return new TskvLogger();
    case 'dev':
    default:
      return new DevLogger();
  }
}
