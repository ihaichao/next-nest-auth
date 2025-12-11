import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import {
  AuthResponse,
  AuthErrorCode,
  RATE_LIMIT,
  SignupInput,
  SigninInput,
} from '@next-nest-auth/shared';
import { User } from '@prisma/client';

/**
 * AuthService handles all authentication logic:
 * - User registration (signup)
 * - User authentication (signin)
 * - Password hashing with bcrypt
 * - JWT token generation
 * - Rate limiting (3 attempts per 5 minutes)
 */
@Injectable()
export class AuthService {
  // bcrypt salt rounds - higher = more secure but slower
  private readonly SALT_ROUNDS = 10;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Register a new user
   * 
   * @param input - username and password
   * @returns Success with user info, or error if username exists
   */
  async signup(input: SignupInput): Promise<AuthResponse> {
    const { username, password } = input;

    // Check if username already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return {
        success: false,
        message: 'Username already exists',
        code: AuthErrorCode.USERNAME_EXISTS,
      };
    }

    // Hash password with bcrypt (never store plain text!)
    const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);

    // Create user in database
    const user = await this.prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    return {
      success: true,
      message: 'User created successfully',
      user: {
        id: user.id,
        username: user.username,
      },
    };
  }

  /**
   * Authenticate user and return JWT token
   * Implements rate limiting: 3 failed attempts = 5 minute lockout
   * 
   * @param input - username and password
   * @returns Success with JWT token, or error with reason
   */
  async signin(input: SigninInput): Promise<AuthResponse> {
    const { username, password } = input;

    // Find user by username
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    // User not found - return generic error (don't reveal if user exists)
    if (!user) {
      return {
        success: false,
        message: 'Invalid username or password',
        code: AuthErrorCode.INVALID_CREDENTIALS,
      };
    }

    // Check if account is locked
    const lockStatus = this.checkLockStatus(user);
    if (lockStatus.isLocked) {
      return {
        success: false,
        message: lockStatus.message,
        code: AuthErrorCode.USER_LOCKED,
      };
    }

    // Verify password with bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // Record failed attempt and possibly lock account
      await this.recordFailedAttempt(user);

      // Check if this attempt triggered a lock
      const updatedUser = await this.prisma.user.findUnique({
        where: { id: user.id },
      });

      if (updatedUser?.lockedUntil) {
        return {
          success: false,
          message: 'Account locked due to too many failed attempts. Try again in 5 minutes.',
          code: AuthErrorCode.USER_LOCKED,
        };
      }

      return {
        success: false,
        message: 'Invalid username or password',
        code: AuthErrorCode.INVALID_CREDENTIALS,
      };
    }

    // Success! Reset failed attempts
    await this.resetFailedAttempts(user);

    // Generate JWT token
    const token = this.generateToken(user);

    return {
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
      },
    };
  }

  /**
   * Check if user account is currently locked
   * Account is locked if lockedUntil is in the future
   */
  private checkLockStatus(user: User): { isLocked: boolean; message: string } {
    if (!user.lockedUntil) {
      return { isLocked: false, message: '' };
    }

    const now = new Date();
    if (user.lockedUntil > now) {
      const remainingMs = user.lockedUntil.getTime() - now.getTime();
      const remainingMinutes = Math.ceil(remainingMs / 60000);
      return {
        isLocked: true,
        message: `Account is locked. Try again in ${remainingMinutes} minute(s).`,
      };
    }

    // Lock has expired
    return { isLocked: false, message: '' };
  }

  /**
   * Record a failed login attempt
   * If MAX_ATTEMPTS reached within WINDOW_MINUTES, lock the account
   */
  private async recordFailedAttempt(user: User): Promise<void> {
    const now = new Date();
    const windowStart = new Date(
      now.getTime() - RATE_LIMIT.WINDOW_MINUTES * 60 * 1000
    );

    // Check if last failed attempt was within the window
    let newFailedAttempts: number;

    if (user.lastFailedAt && user.lastFailedAt > windowStart) {
      // Within window - increment counter
      newFailedAttempts = user.failedAttempts + 1;
    } else {
      // Outside window - reset counter to 1
      newFailedAttempts = 1;
    }

    // Lock account if max attempts reached
    const shouldLock = newFailedAttempts >= RATE_LIMIT.MAX_ATTEMPTS;
    const lockedUntil = shouldLock
      ? new Date(now.getTime() + RATE_LIMIT.WINDOW_MINUTES * 60 * 1000)
      : null;

    // Update user in database
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedAttempts: newFailedAttempts,
        lastFailedAt: now,
        lockedUntil,
      },
    });
  }

  /**
   * Reset failed attempts after successful login
   */
  private async resetFailedAttempts(user: User): Promise<void> {
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedAttempts: 0,
        lastFailedAt: null,
        lockedUntil: null,
      },
    });
  }

  /**
   * Generate JWT token for authenticated user
   * Token contains user ID and username
   */
  private generateToken(user: User): string {
    const payload = {
      sub: user.id,        // 'sub' is standard JWT claim for subject
      username: user.username,
    };

    return this.jwtService.sign(payload);
  }
}
