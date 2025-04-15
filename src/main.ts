import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get('PORT') || 3000;

  app.enableCors({
    origin: '*',
    methods: ['OPTIONS', 'POST', 'PUT', 'PATCH', 'GET', 'DELETE'],
    allowedHeaders: '*',
    exposedHeaders: '*',
  });

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(port);

  Logger.log(`🚀 Application is running on: http://localhost:${port}`);
}
bootstrap();
