import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

/**
 * AuthModule provides authentication functionality
 * 
 * Configures JWT with:
 * - Secret from JWT_SECRET env variable
 * - Expiration from JWT_EXPIRES_IN env variable (default: 24h)
 */
@Module({
  imports: [
    // Configure JWT asynchronously to use ConfigService
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'default-secret-change-me'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '24h'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService],
  exports: [AuthService],  // Export so TrpcModule can use it
})
export class AuthModule {}
