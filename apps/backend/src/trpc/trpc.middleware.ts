import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { createAppRouter, TrpcContext } from './app.router';
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
    const appRouter = createAppRouter();

    // Build the full URL for the Fetch API Request
    const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;

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
    // Express has already parsed it, so we need to re-stringify
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
    });

    // Convert Fetch Response to Express Response
    res.status(response.status);
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    const responseBody = await response.text();
    res.send(responseBody);
  }
}
