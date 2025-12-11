// Re-export all schemas and types from a single entry point
// This allows clean imports like: import { signupSchema, AuthErrorCode } from '@next-nest-auth/shared'

// Zod validation schemas
export { signupSchema, signinSchema } from './schemas/auth';
export type { SignupInput, SigninInput } from './schemas/auth';

// Response types and constants
export { AuthErrorCode, RATE_LIMIT } from './types/auth';
export type {
  AuthSuccessResponse,
  AuthErrorResponse,
  AuthResponse,
} from './types/auth';
