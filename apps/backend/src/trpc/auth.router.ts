import { initTRPC } from '@trpc/server';
import { signupSchema, signinSchema } from '@next-nest-auth/shared';
import { AuthService } from '../auth/auth.service';

/**
 * tRPC Context - passed to every procedure
 * Contains services that procedures can use
 */
export interface TrpcContext {
  authService: AuthService;
}

/**
 * Initialize tRPC with typed context
 * This is the foundation for all our API procedures
 */
const t = initTRPC.context<TrpcContext>().create();

// Export router and procedure builders
export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Auth Router - handles signup and signin
 * 
 * Procedures:
 * - signup: Create new user (mutation)
 * - signin: Authenticate user, return JWT (mutation)
 */
export const createAuthRouter = () => {
  return router({
    /**
     * Signup Procedure
     * 
     * Input: { username: string, password: string }
     * Output: AuthResponse (success with user, or error)
     * 
     * Uses signupSchema from shared package for validation
     */
    signup: publicProcedure
      .input(signupSchema)  // Validates input with Zod
      .mutation(async ({ input, ctx }) => {
        return ctx.authService.signup(input);
      }),

    /**
     * Signin Procedure
     * 
     * Input: { username: string, password: string }
     * Output: AuthResponse (success with JWT token, or error)
     * 
     * Rate limited: 3 failed attempts = 5 minute lockout
     */
    signin: publicProcedure
      .input(signinSchema)  // Validates input with Zod
      .mutation(async ({ input, ctx }) => {
        return ctx.authService.signin(input);
      }),
  });
};

// Export router type for frontend type inference
export type AuthRouter = ReturnType<typeof createAuthRouter>;
