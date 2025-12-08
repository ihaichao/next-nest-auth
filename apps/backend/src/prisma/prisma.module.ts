import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * PrismaModule provides database access throughout the application
 * 
 * @Global() decorator makes PrismaService available in all modules
 * without needing to import PrismaModule everywhere
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
