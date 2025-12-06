/**
 * Authentication Response Types
 * Used by both frontend and backend for type-safe API responses
 */

// Success response with optional token and user info
export interface AuthSuccessResponse {
  success: true;
  message: string;
  token?: string;
  user?: {
    id: string;
    username: string;
  };
}

// Error response with error code for handling
export interface AuthErrorResponse {
  success: false;
  message: string;
  code: AuthErrorCode;
}

// Union type - response is either success or error
export type AuthResponse = AuthSuccessResponse | AuthErrorResponse;

/**
 * Error codes for authentication failures
 * Frontend can use these to show appropriate error messages
 */
export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_LOCKED = 'USER_LOCKED',
  USERNAME_EXISTS = 'USERNAME_EXISTS',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

/**
 * Rate limiting configuration
 * Matches the requirement: 3 attempts within 5 minutes
 */
export const RATE_LIMIT = {
  MAX_ATTEMPTS: 3,
  WINDOW_MINUTES: 5,
} as const;
