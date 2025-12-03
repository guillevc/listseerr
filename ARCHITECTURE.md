# Architecture Overview

## System Design

Listseerr follows a clean architecture pattern with clear separation of concerns.

```
┌─────────────────────────────────────────────────────────────┐
│                      Client (React)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Dashboard   │  │    Lists     │  │   Settings   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                         │                                    │
│                    tRPC Client                               │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          │ HTTP/JSON
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                   Server (Hono + tRPC)                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              tRPC Routers (API Layer)                │   │
│  │  • lists         • dashboard      • scheduler        │   │
│  │  • processor     • config         • logs             │   │
│  └────────────────────┬────────────────────────────────┘   │
│                       │                                      │
│  ┌────────────────────▼───────────────────────────────┐    │
│  │           Service Layer (Business Logic)            │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │    │
│  │  │    Trakt     │  │  Jellyseerr  │  │  Dedupe  │ │    │
│  │  │   Service    │  │   Service    │  │ Service  │ │    │
│  │  └──────────────┘  └──────────────┘  └──────────┘ │    │
│  └────────────────────┬───────────────────────────────┘    │
│                       │                                      │
│  ┌────────────────────▼───────────────────────────────┐    │
│  │         Infrastructure Layer (DB, Scheduler)        │    │
│  │  • Drizzle ORM   • Croner Scheduler   • Pino Logger │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
                          │
                          │
                ┌─────────▼──────────┐
                │  SQLite Database   │
                └────────────────────┘
```

## Data Flow: Processing a List

### Manual Trigger

1. User clicks "Process" button
2. UI calls `trpc.processor.processList.mutate({ listId, triggerType: 'manual' })`
3. tRPC router calls `processListById(listId, 'manual', db)`
4. **Fetch Phase**:
   - `fetchTraktList()` fetches items from Trakt API
   - URL parser transforms query params to API path
5. **Deduplication Phase**:
   - `getAlreadyRequestedIds()` fetches cached TMDB IDs
   - Filter out items already in cache
6. **Request Phase**:
   - `requestItemsToJellyseerr()` sends requests to Jellyseerr
   - Only cache items with 200/201 or "already requested" response
   - Failed items (400/500 errors) are NOT cached → will retry next sync
7. **Persistence Phase**:
   - `cacheRequestedItems()` stores successful items
   - Update execution history with results
8. **UI Update**:
   - Mutations invalidate relevant queries
   - Dashboard, lists, and activity refresh automatically

### Scheduled Trigger

1. Croner job fires based on cron expression
2. Scheduler calls `processListById(listId, 'scheduled', db)`
3. Same flow as manual, but `triggerType='scheduled'`
4. Recent Activity groups scheduled runs within 1 minute

## Key Design Decisions

### 1. Service Layer Separation

**Why**: Following Single Responsibility Principle (SOLID)

```typescript
// ❌ Bad: Business logic in router
router({
  processList: publicProcedure.mutation(async ({ ctx, input }) => {
    const response = await fetch(traktUrl);
    const items = await response.json();
    // ... 100 lines of logic
  }),
});

// ✅ Good: Logic in service, router orchestrates
router({
  processList: publicProcedure.mutation(async ({ ctx, input }) => {
    return processListById(input.listId, input.triggerType, ctx.db);
  }),
});
```

**Benefits**:
- Testable without HTTP layer
- Reusable from scheduler and API
- Clear separation of concerns

### 2. Deduplication via Cache

**Why**: Avoid duplicate Jellyseerr requests

- Only successful requests (200/201) are cached
- "Already requested" (400 + message) items are cached
- Failed items (other 400/500) are NOT cached → retry next sync
- Uses Set for O(1) lookup performance

### 3. Execution History with Trigger Type

**Why**: Distinguish manual vs scheduled runs for better UX

- Manual runs appear individually in recent activity
- Scheduled runs (same minute) are grouped visually
- Users can see automation working

### 4. Query Invalidation Strategy

**Why**: Keep UI in sync with server state

All mutations invalidate related queries:
- `lists.getAll` → Dashboard stats, Lists page
- `dashboard.getStats` → Dashboard stats card
- `dashboard.getRecentActivity` → Recent activity feed

### 5. Structured Logging with Context

**Why**: Production debugging and monitoring

```typescript
logger.info(
  {
    listId: 123,
    itemsFound: 50,
    itemsRequested: 10,
    itemsFailed: 2,
  },
  'Processing completed successfully'
);
```

**Benefits**:
- Searchable JSON logs
- Context-aware debugging
- Performance monitoring

## Database Schema Relationships

```
users (1) ──┬─< (N) media_lists
            │        │
            │        └─< (N) execution_history
            │        │
            │        └─< (N) list_items_cache
            │
            ├─< (N) jellyseerr_configs
            ├─< (N) provider_configs
            └─< (1) general_settings
```

## Error Handling Philosophy

### Fail Fast, Fail Gracefully

1. **Validation**: Check preconditions early (list enabled, config exists)
2. **User Feedback**: Clear error messages via toast notifications
3. **Logging**: Structured logs with context for debugging
4. **Partial Success**: Process what we can, report failures separately
5. **Retry Logic**: Don't cache failures → automatic retry on next sync

## Performance Considerations

### Current Optimizations

1. **Database Indexes**: Foreign keys automatically indexed
2. **Query Batching**: tRPC batches requests automatically
3. **Deduplication**: Set-based O(1) lookups prevent N+1 queries
4. **Parallel Processing**: Manual "Process All" runs lists sequentially with delay
5. **Cache Strategy**: SQLite cache faster than repeated API calls

### Future Improvements

- Consider Redis for distributed caching
- Implement job queue for long-running tasks
- Add pagination for large lists (>1000 items)
- Consider database connection pooling for scale

## Security Considerations

1. **API Keys**: Stored in database, not in environment for multi-user support
2. **Input Validation**: Zod schemas validate all inputs
3. **SQL Injection**: Drizzle ORM parameterizes queries
4. **CORS**: Enabled only in development mode
5. **User Isolation**: All queries filter by userId (currently hardcoded to 1)

## Testing Strategy

### Current State

- Type safety via TypeScript
- Runtime validation via Zod
- Manual testing

### Recommended Additions

1. **Unit Tests**: Service layer functions
2. **Integration Tests**: tRPC routers with test database
3. **E2E Tests**: Critical user flows (add list, process, view dashboard)

## Deployment

### Production Build

```bash
bun run build   # Builds client + server
bun run start   # Starts production server
```

### Environment Variables

- `PORT`: Server port (default: 3000)
- Database file: `./data/sqlite.db` (auto-created)

### Production Checklist

- [ ] Set proper `PORT` if needed
- [ ] Ensure SQLite database directory is writable
- [ ] Configure timezone in General Settings
- [ ] Set up Jellyseerr and Trakt API keys
- [ ] Verify cron expressions for scheduled lists
