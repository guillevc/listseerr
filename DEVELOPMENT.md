# Development Guide

This guide helps developers understand the codebase structure and patterns used in Listseerr.

## Project Overview

Listseerr is a tool that automatically fetches media from public lists (Trakt.tv, etc.) and requests them to Jellyseerr instances. It uses:

- **Runtime**: Bun
- **Backend**: Hono + tRPC
- **Frontend**: React + TanStack Router
- **Database**: SQLite with Drizzle ORM
- **Scheduler**: Croner for cron jobs
- **Logging**: Pino for structured logging

## Architecture Principles

We follow **SOLID principles** without over-engineering:

1. **Single Responsibility**: Each service/component has one job
2. **Open/Closed**: Extend behavior without modifying existing code
3. **Dependency Inversion**: Depend on abstractions, not implementations
4. **DRY**: Share types and logic, avoid duplication
5. **KISS**: Keep implementations simple and readable

## Project Structure

```
src/
├── client/              # Frontend React application
│   ├── components/      # Reusable UI components
│   │   ├── ui/         # shadcn/ui base components
│   │   ├── dashboard/  # Dashboard-specific components
│   │   ├── lists/      # List management components
│   │   └── layout/     # App layout components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Client utilities (router, trpc client, utils)
│   ├── pages/          # Page components
│   └── routes/         # Route definitions
│
├── server/             # Backend Hono + tRPC application
│   ├── db/            # Database configuration & migrations
│   │   ├── schema.ts  # Drizzle schema definitions
│   │   └── migrations/ # SQL migration files
│   ├── lib/           # Server utilities
│   │   ├── logger.ts  # Pino logging configuration
│   │   ├── log-buffer.ts # In-memory log storage
│   │   └── scheduler.ts  # Cron job scheduler
│   ├── services/      # Business logic layer
│   │   ├── trakt/     # Trakt API integration
│   │   ├── jellyseerr/ # Jellyseerr API integration
│   │   └── list-processor/ # Processing logic
│   ├── trpc/          # tRPC routers
│   │   └── routers/   # API endpoint definitions
│   └── index.ts       # Server entry point
│
└── shared/            # Shared types between client/server
    └── types.ts       # Common TypeScript types
```

## Key Patterns

### 1. Service Layer Pattern

Business logic is isolated in services, not in tRPC routers:

```typescript
// ✅ Good: Logic in service
export async function fetchTraktList(url: string, maxItems: number, clientId: string) {
  // Parse URL, fetch data, transform results
  return mediaItems;
}

// Router just calls the service
processList: publicProcedure.mutation(async ({ ctx, input }) => {
  return processListById(input.listId, input.triggerType, ctx.db);
});
```

### 2. Shared Types

Use types from `src/shared/types.ts` to avoid duplication:

```typescript
import type { Provider, MediaType, ProcessingResult } from '../shared/types';
```

### 3. Query Invalidation

When data changes, invalidate all related queries:

```typescript
const createMutation = trpc.lists.create.useMutation({
  onSuccess: () => {
    // Invalidate all affected queries
    utils.lists.getAll.invalidate();
    utils.dashboard.getStats.invalidate();
    utils.dashboard.getRecentActivity.invalidate();
  },
});
```

### 4. Error Handling

Consistent error handling with user-friendly messages:

```typescript
try {
  await processListById(listId, 'scheduled', db);
} catch (error) {
  logger.error(
    { listId, error: error instanceof Error ? error.message : 'Unknown error' },
    'Failed to process list'
  );
  // Re-throw or handle gracefully
}
```

### 5. Logging

Use structured logging with context:

```typescript
import { createLogger } from '../../lib/logger';

const logger = createLogger('module-name');

logger.info({ listId, itemsFound: 10 }, 'Processing started');
logger.error({ error: err.message }, 'Processing failed');
```

## Data Flow

### List Processing Flow

1. **User triggers** (manual button or scheduled cron)
2. **processListById()** orchestrates the flow:
   - Fetch items from Trakt
   - Check cache for duplicates (deduplication)
   - Request new items to Jellyseerr
   - Cache successful requests
   - Update execution history
3. **UI updates** via query invalidation

### Database Schema

Key tables:

- `users`: User accounts
- `media_lists`: List configurations
- `execution_history`: Processing logs (with triggerType)
- `list_items_cache`: Deduplication cache
- `jellyseerr_configs`: Jellyseerr settings
- `provider_configs`: Provider API keys (Trakt, etc.)
- `general_settings`: App settings (timezone, etc.)

## Making Changes

### Adding a New Feature

1. **Update schema** (if needed):
   ```bash
   # Edit src/server/db/schema.ts
   bun run db:generate  # Generate migration
   bun run db:migrate   # Apply migration
   ```

2. **Create service** (business logic):
   ```typescript
   // src/server/services/my-feature/client.ts
   export async function doSomething() {
     // Implementation
   }
   ```

3. **Add tRPC router**:
   ```typescript
   // src/server/trpc/routers/my-feature.ts
   export const myFeatureRouter = router({
     doSomething: publicProcedure.mutation(async ({ ctx }) => {
       return doSomething();
     }),
   });
   ```

4. **Wire up in index**:
   ```typescript
   // src/server/trpc/index.ts
   export const appRouter = router({
     // ...existing routers
     myFeature: myFeatureRouter,
   });
   ```

5. **Use in frontend**:
   ```typescript
   const mutation = trpc.myFeature.doSomething.useMutation();
   ```

### Adding UI Components

Follow the component structure:

```typescript
// src/client/components/feature/ComponentName.tsx
export function ComponentName({ prop }: Props) {
  const { data } = trpc.someRoute.useQuery();
  
  return <div>{/* JSX */}</div>;
}
```

## Best Practices

1. **Keep functions small**: Max ~50 lines per function
2. **Use TypeScript**: Leverage type safety
3. **Comment intent, not implementation**: Explain why, not what
4. **Test edge cases**: Handle errors gracefully
5. **Follow existing patterns**: Be consistent with codebase
6. **Avoid premature optimization**: Solve real problems first

## Common Tasks

### Run Development Server

```bash
bun run dev        # Start dev server (client + server)
bun run dev:client # Client only (Vite)
bun run dev:server # Server only (Bun watch mode)
```

### Database Operations

```bash
bun run db:generate  # Generate migration from schema changes
bun run db:migrate   # Apply migrations
bun run db:reset     # Reset database (dev only!)
bun run db:studio    # Open Drizzle Studio
```

### Build & Deploy

```bash
bun run build        # Build for production
bun run start        # Start production server
```

## Debugging

### Check Logs

- **Server logs**: Structured JSON output via Pino
- **UI logs page**: View live logs at `/logs`
- **Browser console**: Client-side errors

### Common Issues

- **tRPC errors**: Check server logs for details
- **Scheduler not running**: Verify timezone and cron expression
- **No items processed**: Check Trakt API key and list URL

## Resources

- [tRPC Docs](https://trpc.io/)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [TanStack Router Docs](https://tanstack.com/router)
- [Bun Docs](https://bun.sh/docs)
- [Hono Docs](https://hono.dev/)

## Getting Help

1. Check this development guide
2. Review existing code patterns
3. Search logs for errors
4. Open an issue on GitHub
