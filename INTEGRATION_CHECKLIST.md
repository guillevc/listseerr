# Integration Checklist

This document verifies that all UI actions are properly connected to the server and update correctly.

## ✅ Dashboard Page

### Stats Cards
- [x] **Total Lists**: Queries `trpc.lists.getAll` 
- [x] **Enabled Lists**: Calculated from lists query
- [x] **Last Processed**: Calculated from lists query
- [x] **Total Requests**: Queries `trpc.dashboard.getStats`

### Recent Activity
- [x] **Activity Feed**: Queries `trpc.dashboard.getRecentActivity`
- [x] **Shows manual/scheduled badge**: Based on `triggerType` field
- [x] **Groups batch processing**: Scheduled runs within 1 min grouped
- [x] **Displays counts**: Requested, skipped, failed items
- [x] **Auto-refreshes**: Invalidated when lists are processed

**Invalidated by**:
- `processor.processList` mutation
- `lists.delete` mutation

## ✅ Lists Page

### List Table Actions
- [x] **Process Button**: 
  - Triggers `trpc.processor.processList` mutation
  - Passes `triggerType: 'manual'`
  - Shows spinner while processing
  - Disabled if list is disabled
  - Shows toast with results (found/requested/skipped/failed)
  
- [x] **Toggle Enabled**: 
  - Triggers `trpc.lists.toggleEnabled` mutation
  - Updates enabled status immediately
  - Reloads scheduler if list has schedule
  
- [x] **Delete Button**: 
  - Triggers `trpc.lists.delete` mutation
  - Unschedules list from scheduler
  - Shows confirmation toast
  - Removes list from UI

**Invalidations**:
- All list mutations invalidate:
  - `lists.getAll`
  - `dashboard.getStats`
  - `dashboard.getRecentActivity` (for delete/process)

### Add List Dialog
- [x] **Form Validation**:
  - Name: Required
  - URL: Required, must be valid Trakt URL
  - Max Items: Required, 1-50, default 20
  
- [x] **Create List**:
  - Triggers `trpc.lists.create` mutation
  - Validates Trakt URL only (others disabled)
  - Reloads scheduler if schedule configured
  - Closes dialog on success
  - Resets form state

**Invalidations**:
- `lists.getAll`
- `dashboard.getStats`

### Process All
- [x] **Batch Processing**:
  - Checks Jellyseerr config first
  - Filters to enabled lists only
  - Processes sequentially with 1s delay
  - Shows toast for batch start
  - Individual toasts for each list

## ✅ Settings Page

### Jellyseerr Settings
- [x] **Get Config**: Queries `trpc.config.get`
- [x] **Save Config**: Triggers `trpc.config.set` mutation
- [x] **Shows/hides password**: Eye icon toggles visibility
- [x] **Validation**: All fields required

### API Keys Settings
- [x] **Get Trakt Config**: Queries `trpc.providerConfig.getTraktConfig`
- [x] **Save Trakt Config**: Triggers `trpc.providerConfig.setTraktConfig` mutation
- [x] **Shows/hides API keys**: Eye icons toggle visibility
- [x] **Validation**: Client ID required

### General Settings
- [x] **Get Settings**: Queries `trpc.generalSettings.get`
- [x] **Save Settings**: Triggers `trpc.generalSettings.set` mutation
- [x] **Timezone Input**: Free text with examples
- [x] **Validation**: Timezone required

## ✅ Scheduler Integration

### Automatic Processing
- [x] **Server Start**: Loads scheduled lists via `scheduler.loadScheduledLists()`
- [x] **List Create**: Reloads scheduler if schedule configured
- [x] **List Update**: Reloads scheduler if schedule fields changed
- [x] **List Delete**: Unschedules list immediately
- [x] **List Toggle**: Reloads scheduler if list has schedule
- [x] **Trigger Type**: Scheduled runs pass `triggerType: 'scheduled'`
- [x] **Error Handling**: Scheduler errors logged, don't crash server

### Cron Job Behavior
- [x] **Interval-based**: Starts from server restart (e.g., `*/6 * * * *`)
- [x] **Specific times**: Uses configured timezone (e.g., `0 2 * * *`)
- [x] **Timezone**: Respects general settings timezone

## ✅ Processing Pipeline

### Data Flow
1. [x] Fetch items from Trakt API
2. [x] Parse URL (transform query params to path)
3. [x] Load cache for deduplication
4. [x] Filter out cached items
5. [x] Request new items to Jellyseerr
6. [x] Cache successful requests (200/201 + "already requested")
7. [x] Don't cache failures (other 400/500) → retry next sync
8. [x] Update execution history
9. [x] Log with structured context

### Error Handling
- [x] **Missing config**: Clear error message
- [x] **Invalid URL**: Validation on frontend + backend
- [x] **API errors**: Logged with context, don't crash
- [x] **Partial success**: Process what we can, report failures
- [x] **Failed items**: Not cached, will retry automatically

## ✅ Real-Time Updates

### Query Invalidation Matrix

| Action                | lists.getAll | dashboard.getStats | dashboard.getRecentActivity |
|-----------------------|--------------|--------------------|-----------------------------|
| Create List           | ✅           | ✅                 | -                           |
| Delete List           | ✅           | ✅                 | ✅                          |
| Toggle Enabled        | ✅           | ✅                 | -                           |
| Process List (manual) | ✅           | ✅                 | ✅                          |
| Process List (sched)  | -            | -                  | -                           |

**Note**: Scheduled processing doesn't invalidate queries (runs in background).
Users will see updates on next page refresh or manual action.

## ✅ Logging System

### Log Levels
- [x] **Info**: Processing start/complete, scheduler events
- [x] **Debug**: Detailed service-level operations
- [x] **Error**: Failures with full context

### Log Destinations
- [x] **Console**: Pretty-printed in development
- [x] **JSON**: Structured in production
- [x] **In-Memory Buffer**: Last 1000 logs for UI

### Logs Page
- [x] **View Logs**: Queries `trpc.logs.getRecentLogs`
- [x] **Filter by Level**: Dropdown (all/info/debug/error)
- [x] **Auto-Refresh**: Every 2 seconds (when enabled)
- [x] **Pause/Resume**: Toggle auto-refresh
- [x] **Auto-Scroll**: Follows new logs
- [x] **Color-Coded**: Different colors per level

## Code Organization

### SOLID Principles Applied

1. **Single Responsibility**
   - ✅ Services handle one domain (Trakt, Jellyseerr, Deduplication)
   - ✅ Components render UI, hooks handle logic
   - ✅ Routers route, services process

2. **Open/Closed**
   - ✅ Adding new providers: Extend provider types, add service
   - ✅ Adding new features: Add router, service, UI component
   - ✅ No need to modify existing code

3. **Dependency Inversion**
   - ✅ Database injected into processing function (testable)
   - ✅ Logger created per module (swappable)
   - ✅ Services depend on interfaces, not concrete DB

4. **DRY (Don't Repeat Yourself)**
   - ✅ Shared types in `src/shared/types.ts`
   - ✅ Common UI components in `src/client/components/ui/`
   - ✅ Reusable hooks in `src/client/hooks/`

5. **KISS (Keep It Simple)**
   - ✅ No premature optimization
   - ✅ Clear function names
   - ✅ Minimal abstractions
   - ✅ Straightforward data flow

### File Organization

- ✅ **Clear hierarchy**: client/server/shared
- ✅ **Grouped by feature**: dashboard/, lists/, settings/
- ✅ **Separated by layer**: services/, trpc/routers/, components/
- ✅ **Consistent naming**: kebab-case for files, PascalCase for components

## Documentation

- [x] **README.md**: Project overview and quick start
- [x] **DEVELOPMENT.md**: Developer guide with patterns
- [x] **ARCHITECTURE.md**: System design and data flow
- [x] **INTEGRATION_CHECKLIST.md**: This file
- [x] **JSDoc Comments**: Key functions documented
- [x] **Inline Comments**: Explain "why", not "what"

## Verification Commands

```bash
# Build succeeds
bun run build

# Type checking passes
bun run typecheck  # (if configured)

# Development server starts
bun run dev

# Production server starts
bun run start
```

## Known Limitations

1. **Single User**: Currently hardcoded to userId=1
2. **No Authentication**: No login system yet
3. **Sequential Processing**: "Process All" runs sequentially
4. **No Job Queue**: Long-running tasks block thread
5. **No Rate Limiting**: No protection against API rate limits

## Future Improvements

1. **Multi-User Support**: Remove hardcoded userId
2. **Authentication**: Add login/sessions
3. **Job Queue**: Bull/BullMQ for background processing
4. **Rate Limiting**: Protect external API calls
5. **Database Migrations**: Track applied migrations in DB
6. **Unit Tests**: Test service layer functions
7. **E2E Tests**: Test critical user flows
