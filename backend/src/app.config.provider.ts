import { ConfigService } from '@nestjs/config';

export interface AppConfigDatabase {
  driver: string;
  url: string;
}

export interface AppConfig {
  database: AppConfigDatabase;
}

export const configProvider = {
  provide: 'CONFIG',
  useFactory: (configService: ConfigService) => {
    return {
      database: {
        driver: configService.get<string>('DB_DRIVER') || 'mongodb',
        url: configService.get<string>('DATABASE_URL'),
      },
    } as AppConfig;
  },
  inject: [ConfigService],
};
