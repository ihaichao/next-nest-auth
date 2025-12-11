import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as express from 'express';

/**
 * Bootstrap the NestJS application
 * 
 * Features:
 * - CORS enabled for frontend (localhost:3000)
 * - JSON body parsing for tRPC
 * - Configurable port via BACKEND_PORT env var
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('BACKEND_PORT', 4000);

  // Enable CORS for frontend
  app.enableCors({
    origin: ['http://localhost:3000'],
    credentials: true,
  });

  // Parse JSON body for tRPC requests
  app.use(express.json());

  await app.listen(port);
  
  console.log('='.repeat(50));
  console.log(`🚀 Backend server running on http://localhost:${port}`);
  console.log(`📡 tRPC endpoint: http://localhost:${port}/trpc`);
  console.log('='.repeat(50));
}

bootstrap();
