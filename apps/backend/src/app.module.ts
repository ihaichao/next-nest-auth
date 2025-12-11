import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TrpcModule } from './trpc/trpc.module';

/**
 * AppModule - Root module of the NestJS application
 * 
 * Imports:
 * - ConfigModule: Loads environment variables (.env file)
 * - PrismaModule: Database access (global)
 * - AuthModule: Authentication service
 * - TrpcModule: tRPC API endpoints
 */
@Module({
  imports: [
    // Load environment variables globally
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],  // Check both local and root .env
    }),
    PrismaModule,
    AuthModule,
    TrpcModule,
  ],
})
export class AppModule {}
