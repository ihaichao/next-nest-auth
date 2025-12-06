import { z } from 'zod';

/**
 * Schema for user signup validation
 * - Username: 3-50 characters, alphanumeric + underscore only
 * - Password: 8-100 characters
 */
export const signupSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be at most 50 characters')
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'Username can only contain letters, numbers, and underscores'
    ),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be at most 100 characters'),
});

/**
 * Schema for user signin validation
 * Only requires non-empty strings (actual validation happens on backend)
 */
export const signinSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

// Infer TypeScript types from Zod schemas
// This ensures frontend and backend use the same types!
export type SignupInput = z.infer<typeof signupSchema>;
export type SigninInput = z.infer<typeof signinSchema>;
