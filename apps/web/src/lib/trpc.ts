import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '../../../backend/src/trpc/app.router';

/**
 * tRPC React client for type-safe API calls
 * Types are inferred from the backend AppRouter
 */
export const trpc = createTRPCReact<AppRouter>();
