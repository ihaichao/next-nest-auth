import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TrpcMiddleware } from './trpc.middleware';
import { AuthModule } from '../auth/auth.module';

/**
 * TrpcModule - configures tRPC endpoint
 * 
 * Applies TrpcMiddleware to all /trpc/* routes
 * This makes our tRPC procedures accessible at:
 * - POST /trpc/auth.signup
 * - POST /trpc/auth.signin
 */
@Module({
  imports: [AuthModule],  // Import to get AuthService
  providers: [TrpcMiddleware],
})
export class TrpcModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply middleware to /trpc route and all sub-routes
    consumer.apply(TrpcMiddleware).forRoutes('/trpc');
  }
}
