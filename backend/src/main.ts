import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { createLogger } from './logger/logger.factory';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  app.useLogger(createLogger());
  app.setGlobalPrefix('api/afisha');
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  const port = process.env.PORT || 3000;
  await app.listen(port);
}
bootstrap();
