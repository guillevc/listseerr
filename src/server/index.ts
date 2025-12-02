import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from 'hono/bun';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from './trpc';
import { createContext } from './trpc/trpc';

const app = new Hono();

// CORS for development
if (process.env.NODE_ENV !== 'production') {
  app.use('/*', cors({
    origin: 'http://localhost:5173', // Vite dev server
    credentials: true,
  }));
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

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use('/*', serveStatic({ root: './dist/client' }));
  app.get('*', serveStatic({ path: './dist/client/index.html' }));
}

const port = process.env.PORT || 3000;

console.log(`🚀 Server running on http://localhost:${port}`);
console.log(`📡 tRPC endpoint: http://localhost:${port}/trpc`);
console.log(`🏥 Health check: http://localhost:${port}/health`);

export default {
  port,
  fetch: app.fetch,
};
