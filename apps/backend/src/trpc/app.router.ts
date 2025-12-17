import { router, createAuthRouter, TrpcContext } from './auth.router';

/**
 * App Router - combines all sub-routers
 * 
 * Structure:
 * - auth.signup
 * - auth.signin
 */
export const createAppRouter = () => {
  return router({
    auth: createAuthRouter(),
  });
};

// Export types for frontend
export type AppRouter = ReturnType<typeof createAppRouter>;
export type { TrpcContext };
