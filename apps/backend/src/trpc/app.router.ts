import { router, createAuthRouter, TrpcContext } from './auth.router';

/**
 * App Router - combines all sub-routers
 * 
 * Structure:
 * - auth.signup
 * - auth.signin
 * 
 * Add more routers here as the app grows, e.g.:
 * - user.profile
 * - user.updatePassword
 */
export const createAppRouter = () => {
  return router({
    auth: createAuthRouter(),
    // Add more routers here:
    // user: createUserRouter(),
    // admin: createAdminRouter(),
  });
};

// Export types for frontend
export type AppRouter = ReturnType<typeof createAppRouter>;
export type { TrpcContext };
