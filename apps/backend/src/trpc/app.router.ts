import { router, authRouter, TrpcContext } from './auth.router';

/**
 * App Router - combines all sub-routers
 * 
 * Structure:
 * - auth.signup
 * - auth.signin
 */
export const appRouter = router({
  auth: authRouter,
});

// Export types for frontend
export type AppRouter = typeof appRouter;
export type { TrpcContext };
