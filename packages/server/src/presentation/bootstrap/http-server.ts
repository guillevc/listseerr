import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from 'hono/bun';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '../trpc/app.router';
import { createContext } from '../trpc/context';
import { LoggerService } from '../../infrastructure/services/core/logger.service';
import { env } from '../../env';

const logger = new LoggerService('http');

export function createHttpApp(): Hono {
  const app = new Hono();
  const isDev = env.NODE_ENV === 'development';

  // CORS for development
  if (isDev) {
    app.use(
      '/*',
      cors({
        origin: 'http://localhost:5173', // Vite dev server
        credentials: true,
      })
    );
  }

  // Health check endpoint
  app.get('/health', (c) => {
    return c.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // tRPC endpoint
  app.use('/trpc/*', async (c) => {
    return fetchRequestHandler({
      router: appRouter,
      req: c.req.raw,
      endpoint: '/trpc',
      createContext,
    });
  });

  // Serve static files in production builds
  if (!isDev) {
    logger.info('Serving static files from ./dist');
    // Serve static assets
    app.use('/assets/*', serveStatic({ root: './dist' }));
    app.use('/vite.svg', serveStatic({ path: './dist/vite.svg' }));

    // Serve index.html for all other routes (SPA fallback)
    app.get('*', serveStatic({ path: './dist/index.html' }));
  } else {
    logger.info('Development mode - static files served by Vite');
  }

  return app;
}
