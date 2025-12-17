import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthErrorCode, RATE_LIMIT } from '@next-nest-auth/shared';

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn(),
}));

import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let authService: AuthService;

  // Mock PrismaService
  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  // Mock JwtService
  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock_jwt_token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('signup', () => {
    const signupInput = { username: 'testuser', password: 'password123' };

    const mockUser = {
      id: 'user-123',
      username: 'testuser',
      password: 'hashed_password',
      failedAttempts: 0,
      lastFailedAt: null,
      lockedUntil: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create a new user successfully', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      // Act
      const result = await authService.signup(signupInput);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('User created successfully');
      if (result.success) {
        expect(result.user?.username).toBe('testuser');
      }
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'testuser' },
      });
      expect(mockPrismaService.user.create).toHaveBeenCalled();
    });

    it('should return error if username already exists', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      // Act
      const result = await authService.signup(signupInput);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe(AuthErrorCode.USERNAME_EXISTS);
        expect(result.message).toBe('Username already exists');
      }
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });

    it('should hash the password before storing', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      // Act
      await authService.signup(signupInput);

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    });
  });

  describe('signin', () => {
    const signinInput = { username: 'testuser', password: 'password123' };

    const mockUser = {
      id: 'user-123',
      username: 'testuser',
      password: 'hashed_password',
      failedAttempts: 0,
      lastFailedAt: null,
      lockedUntil: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return token on successful login', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await authService.signin(signinInput);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.token).toBe('mock_jwt_token');
        expect(result.user?.username).toBe('testuser');
      }
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: 'user-123',
        username: 'testuser',
      });
    });

    it('should return error for non-existent user', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      // Act
      const result = await authService.signin(signinInput);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe(AuthErrorCode.INVALID_CREDENTIALS);
      }
    });

    it('should return error for wrong password', async () => {
      // Arrange
      mockPrismaService.user.findUnique
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce({ ...mockUser, failedAttempts: 1 });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act
      const result = await authService.signin(signinInput);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe(AuthErrorCode.INVALID_CREDENTIALS);
      }
    });

    it('should return locked error for locked account', async () => {
      // Arrange
      const lockedUser = {
        ...mockUser,
        lockedUntil: new Date(Date.now() + 60000), // Locked for 1 minute
      };
      mockPrismaService.user.findUnique.mockResolvedValue(lockedUser);

      // Act
      const result = await authService.signin(signinInput);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe(AuthErrorCode.USER_LOCKED);
      }
    });

    it('should increment failed attempts on wrong password', async () => {
      // Arrange
      mockPrismaService.user.findUnique
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce({ ...mockUser, failedAttempts: 1 });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act
      await authService.signin(signinInput);

      // Assert
      expect(mockPrismaService.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockUser.id },
          data: expect.objectContaining({
            failedAttempts: 1,
          }),
        }),
      );
    });

    it('should lock account after max failed attempts', async () => {
      // Arrange - User already has MAX_ATTEMPTS - 1 failed attempts
      const userWithAttempts = {
        ...mockUser,
        failedAttempts: RATE_LIMIT.MAX_ATTEMPTS - 1,
        lastFailedAt: new Date(),
      };

      mockPrismaService.user.findUnique
        .mockResolvedValueOnce(userWithAttempts)
        .mockResolvedValueOnce({ ...userWithAttempts, lockedUntil: new Date() });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act
      const result = await authService.signin(signinInput);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe(AuthErrorCode.USER_LOCKED);
      }
      expect(mockPrismaService.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            lockedUntil: expect.any(Date),
          }),
        }),
      );
    });

    it('should reset failed attempts on successful login', async () => {
      // Arrange
      const userWithAttempts = {
        ...mockUser,
        failedAttempts: 2,
        lastFailedAt: new Date(),
      };
      mockPrismaService.user.findUnique.mockResolvedValue(userWithAttempts);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      await authService.signin(signinInput);

      // Assert
      expect(mockPrismaService.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            failedAttempts: 0,
            lastFailedAt: null,
            lockedUntil: null,
          },
        }),
      );
    });

    it('should reset failed attempts counter if outside time window', async () => {
      // Arrange - Last failed attempt was more than 5 minutes ago
      const oldFailedUser = {
        ...mockUser,
        failedAttempts: 2,
        lastFailedAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      };

      mockPrismaService.user.findUnique
        .mockResolvedValueOnce(oldFailedUser)
        .mockResolvedValueOnce({ ...oldFailedUser, failedAttempts: 1 });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act
      await authService.signin(signinInput);

      // Assert - Should reset to 1, not increment to 3
      expect(mockPrismaService.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            failedAttempts: 1, // Reset to 1, not 3
          }),
        }),
      );
    });
  });
});
