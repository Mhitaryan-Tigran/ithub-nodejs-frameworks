import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

export function configure(app: Awaited<ReturnType<typeof NestFactory.create>>) {
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  const config = new DocumentBuilder().setTitle('Users API').setDescription('NestJS + Prisma CRUD with class-validator').setVersion('1.0').build();
  SwaggerModule.setup('api/docs', app, () => SwaggerModule.createDocument(app, config));
  return app;
}

async function bootstrap() {
  const app = configure(await NestFactory.create(AppModule));
  await app.listen(process.env.PORT ?? 3000);
}

if (process.env.NODE_ENV !== 'test') await bootstrap();
