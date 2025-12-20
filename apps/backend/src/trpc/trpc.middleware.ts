import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter, TrpcContext } from './app.router';
import { AuthService } from '../auth/auth.service';

/**
 * TrpcMiddleware - bridges Express (NestJS) with tRPC
 * 
 * How it works:
 * 1. Intercepts requests to /trpc/*
 * 2. Converts Express Request → Fetch API Request
 * 3. Passes to tRPC's fetchRequestHandler
 * 4. Converts Fetch Response → Express Response
 * 
 * This allows us to use NestJS's dependency injection
 * with tRPC's type-safe procedures
 */
@Injectable()
export class TrpcMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

  async use(req: Request, res: Response) {
    try {
      // Build the full URL for the Fetch API Request
      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      const host = req.headers['x-forwarded-host'] || req.get('host');
      const url = `${protocol}://${host}${req.originalUrl}`;

      console.log(`[tRPC] ${req.method} ${url}`);

      // Create headers object excluding problematic express-specific headers
      const headers: Record<string, string> = {};
      for (const [key, value] of Object.entries(req.headers)) {
        if (typeof value === 'string') {
          headers[key] = value;
        } else if (Array.isArray(value)) {
          headers[key] = value.join(', ');
        }
      }

      // For mutations, we need to pass the body properly
      let body: string | undefined;
      if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
        body = JSON.stringify(req.body);
        headers['content-type'] = 'application/json';
      }

      // Convert Express Request to Fetch API Request
      const fetchRequest = new Request(url, {
        method: req.method,
        headers,
        body,
      });

      // Process with tRPC
      const response = await fetchRequestHandler({
        endpoint: '/trpc',
        req: fetchRequest,
        router: appRouter,
        // Create context with our NestJS services
        createContext: (): TrpcContext => ({
          authService: this.authService,
        }),
        onError: ({ error, path }) => {
          console.error(`[tRPC Error] path: ${path}, code: ${error.code}, message: ${error.message}`);
        },
      });

      // Convert Fetch Response to Express Response
      res.status(response.status);
      response.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });

      const responseBody = await response.text();
      res.send(responseBody);
    } catch (err) {
      console.error('[tRPC Middleware Critical Error]', err);
      res.status(500).json({
        error: {
          message: 'Internal Server Error in tRPC Middleware',
          details: err instanceof Error ? err.message : String(err),
        },
      });
    }
  }
}
