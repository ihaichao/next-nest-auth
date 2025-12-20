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
  // In production, we allow all origins for now to ensure connectivity
  app.enableCors({
    origin: true, // Auto-reflect origin
    credentials: true,
  });

  // Parse JSON body for tRPC requests
  app.use(express.json());

  // Listen on all interfaces (required for Docker)
  await app.listen(port, '0.0.0.0');
  
  const baseUrl = `http://localhost:${port}`;
  console.log('='.repeat(50));
  console.log(`🚀 Backend server running on ${baseUrl}`);
  console.log(`📡 tRPC endpoint: ${baseUrl}/trpc`);
  console.log('='.repeat(50));
}

bootstrap();
