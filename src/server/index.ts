import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from 'hono/bun';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from './trpc';
import { createContext } from './trpc/trpc';
import { scheduler } from './lib/scheduler';
import { db } from './db';
import { createLogger } from './lib/logger';

const logger = createLogger('server');
const app = new Hono();
const isDev = process.argv.includes('--watch') || import.meta.dir.includes('src/server');

// CORS for development
if (isDev) {
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

// Serve static files in production builds
if (!isDev) {
  console.log('📦 Serving static files from ./dist');
  // Serve static assets
  app.use('/assets/*', serveStatic({ root: './dist' }));
  app.use('/vite.svg', serveStatic({ path: './dist/vite.svg' }));

  // Serve index.html for all other routes (SPA fallback)
  app.get('*', serveStatic({ path: './dist/index.html' }));
} else {
  console.log('⚠️  Development mode - static files served by Vite');
}

const port = process.env.PORT || 3000;

// Initialize scheduler on server start
async function initializeScheduler() {
  try {
    // Initialize scheduler with database and process callbacks
    scheduler.initialize(
      db,
      // Callback for processing individual list
      async (listId: number) => {
        logger.info({ listId }, 'Scheduler triggered - processing list');
        // Import and call the standalone processor function
        const { processListById } = await import('./trpc/routers/lists-processor');
        try {
          await processListById(listId, 'scheduled', db);
        } catch (error) {
          logger.error(
            {
              listId,
              error: error instanceof Error ? error.message : 'Unknown error',
            },
            'Failed to process scheduled list'
          );
        }
      },
      // Callback for processing all enabled lists (global automatic processing)
      async () => {
        logger.info('Global automatic processing triggered - using batch processing with global deduplication');

        try {
          // Import and call the batch processor
          const { processBatchWithDeduplication } = await import('./trpc/routers/lists-processor');
          const result = await processBatchWithDeduplication(db);

          logger.info(
            {
              processedLists: result.processedLists,
              totalItemsFound: result.totalItemsFound,
              globalUniqueItems: result.globalUniqueItems,
              cachedItems: result.cachedItems,
              itemsRequested: result.itemsRequested,
              itemsFailed: result.itemsFailed,
              duplicatesEliminated: result.totalItemsFound - result.globalUniqueItems,
              efficiencyGain: result.totalItemsFound > 0
                ? `${(((result.totalItemsFound - result.globalUniqueItems) / result.totalItemsFound) * 100).toFixed(1)}%`
                : 'N/A',
            },
            'Completed global automatic processing with batch deduplication'
          );
        } catch (error) {
          logger.error(
            {
              error: error instanceof Error ? error.message : 'Unknown error',
            },
            'Failed to complete global automatic processing'
          );
        }
      }
    );

    // Load all scheduled lists
    await scheduler.loadScheduledLists();
    logger.info('Scheduler initialized and scheduled lists loaded');
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      'Failed to initialize scheduler'
    );
  }
}

// Start scheduler initialization (don't block server start)
initializeScheduler().catch(console.error);

logger.info({ port }, 'Server starting');
console.log(`🚀 Server running on http://localhost:${port}`);
console.log(`📡 tRPC endpoint: http://localhost:${port}/trpc`);
console.log(`🏥 Health check: http://localhost:${port}/health`);

export default {
  port,
  fetch: app.fetch,
};
