import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * PrismaService extends PrismaClient to integrate with NestJS lifecycle
 * 
 * Key features:
 * - Connects to database when module initializes
 * - Disconnects when module is destroyed
 * - Provides cleanDatabase() for testing
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  
  /**
   * Called when NestJS module initializes
   * Establishes database connection
   */
  async onModuleInit() {
    await this.$connect();
    console.log('📦 Connected to PostgreSQL database');
  }

  /**
   * Called when NestJS module is destroyed
   * Closes database connection gracefully
   */
  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Utility method to clean all data from database
   * ONLY for testing - blocked in production
   */
  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production');
    }
    // Delete all users (add more tables here as schema grows)
    await this.user.deleteMany();
  }
}
