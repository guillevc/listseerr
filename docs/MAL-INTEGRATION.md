# My Anime List (MAL) Integration Research

> Research conducted: January 2026
> Status: Planning phase - not yet implemented

## Overview

Integration of MAL into listseerr to allow users to sync their anime watchlists and request anime through Jellyseerr.

## API Research Summary

### 1. Jikan API (MAL Data Source)
**URL:** https://api.jikan.moe/v4/

**Key Characteristics:**
- Unofficial MyAnimeList REST API (web scraper)
- **No authentication required** - Public API
- **Read-only** - Cannot update lists
- Only works with **public MAL profiles**
- Rate limit: **60 requests/minute**

**User Anime List Endpoint:**
```
GET https://api.jikan.moe/v4/users/{username}/animelist
```

**Query Parameters:**
- `status` - Filter by watch status (watching, completed, on_hold, dropped, plan_to_watch)
- `page` - Pagination
- `limit` - Items per page (max 25)
- `order_by` - Sort order (score, last_updated, title, etc.)

**Response Structure (per item):**
```json
{
  "data": [
    {
      "entry": {
        "mal_id": 1234,
        "title": "Anime Title",
        "images": { ... },
        "type": "TV",
        "episodes": 24
      },
      "score": 8,
      "status": "completed",
      "episodes_watched": 24
    }
  ],
  "pagination": { ... }
}
```

**Key Output:** `mal_id` (MyAnimeList ID)

---

### 2. ARM API (Anime Relations Mapping)
**URL:** https://arm.haglund.dev/api/v2/

**Purpose:** Convert between anime database IDs (MAL → TVDB/TMDB)

**Endpoint:**
```
GET /api/v2/ids?source=myanimelist&id={mal_id}
POST /api/v2/ids (batch - up to 100 queries)
```

**Supported Sources:** anilist, anidb, anime-planet, anisearch, kitsu, livechart, notify-moe, **myanimelist**

**Response on Match:**
```json
{
  "anidb": 1337,
  "anilist": 1337,
  "myanimelist": 1337,
  "thetvdb": 12345,
  "themoviedb": 30991
}
```

**Response on No Match:** `null`

**Key Finding:** ARM returns `themoviedb` directly - no TMDB API key needed!

---

### 3. Jellyseerr/Overseerr API

**Current Implementation in Listseerr:**
- Uses `POST /api/v1/request` with `mediaId` (TMDB ID)
- Does NOT support TVDB ID directly for requests

**Discovery:**
- **Search** supports prefix syntax: `tvdb:12345`, `imdb:tt1234567`
- **Requests** still require TMDB ID as `mediaId`

---

## ID Conversion Chain (Simplified)

```
MAL Username
    │
    ▼
┌─────────────────────────────────┐
│ Jikan API                       │
│ GET /users/{username}/animelist │
│ ?status=plan_to_watch           │
└─────────────────────────────────┘
    │
    ▼
MAL IDs (e.g., 1)
    │
    ▼
┌─────────────────────────────────┐
│ ARM API (batch up to 100)       │
│ POST /api/v2/ids                │
│ body: [{source:"mal",id:1},...] │
└─────────────────────────────────┘
    │
    ▼
TMDB IDs (themoviedb field)
    │
    ▼
┌─────────────────────────────────┐
│ Jellyseerr                      │
│ POST /api/v1/request            │
│ { mediaType: 'tv', mediaId: X } │
└─────────────────────────────────┘
```

**Example ARM Response (MAL ID 1 = Cowboy Bebop):**
```json
{
  "anidb": 23,
  "anilist": 1,
  "myanimelist": 1,
  "themoviedb": 30991,
  "thetvdb": 76885
}
```

---

## Design Decisions

- **No TMDB API key needed** - ARM provides TMDB IDs directly
- **Sync "Plan to Watch" only** - Filter Jikan by `status=plan_to_watch`
- **Include unmapped in report** - Track in execution history for visibility

---

## Implementation Plan

### 1. Add Provider Type
**File:** `packages/shared/src/domain/types/provider.types.ts`
```typescript
const ProviderValues = {
  // existing...
  MAL: 'mal',  // New
}
```

### 2. Create Jikan Client
**File:** `packages/server/src/infrastructure/services/external/jikan/client.ts`
- `fetchUserAnimeList(username: string, status: 'plan_to_watch'): Promise<JikanAnimeEntry[]>`
- Handle pagination (max 25 per page)
- Respect 60 req/min rate limit

### 3. Create ARM Client
**File:** `packages/server/src/infrastructure/services/external/arm/client.ts`
- `convertMalIds(malIds: number[]): Promise<ArmMapping[]>`
- Use batch endpoint (POST with array, max 100)
- Return array of `{ malId, tmdbId, tvdbId }` mappings

### 4. Create MAL Media Fetcher
**File:** `packages/server/src/infrastructure/services/adapters/mal-media-fetcher.adapter.ts`
- Implements `IMediaFetcher`
- Orchestrates: Jikan → ARM → MediaItemVO[]
- Tracks unmapped items for reporting

### 5. Add MAL Configuration
**Files:**
- Entity: `packages/server/src/domain/entities/mal-config.entity.ts`
- Schema: `packages/server/src/infrastructure/db/schema/mal-config.schema.ts`
- Repository: `packages/server/src/infrastructure/repositories/drizzle-mal-config.repository.ts`

**Config fields:**
- `username: string` - MAL username (required)
- `userId: number` - FK to users table

### 6. Update Factory
**File:** `packages/server/src/infrastructure/services/adapters/media-fetcher-factory.adapter.ts`
- Add case for `mal` provider
- Load username from `MalConfigRepository`

### 7. Update Execution History
Track unmapped anime in execution result for user visibility.

---

## File Structure
```
packages/server/src/
├── domain/
│   └── entities/
│       └── mal-config.entity.ts (new)
├── infrastructure/
│   ├── db/schema/
│   │   └── mal-config.schema.ts (new)
│   ├── repositories/
│   │   └── drizzle-mal-config.repository.ts (new)
│   └── services/
│       ├── adapters/
│       │   └── mal-media-fetcher.adapter.ts (new)
│       └── external/
│           ├── jikan/
│           │   ├── client.ts (new)
│           │   └── types.ts (new)
│           └── arm/
│               ├── client.ts (new)
│               └── types.ts (new)
```

---

## Frontend Changes

### 1. API Keys Settings (add MAL card)
**File:** `packages/client/src/pages/settings/ApiKeysSettings.tsx`
- Add new Card for MAL configuration (follows Trakt/MDBList pattern)
- Field: `username` (no API key needed - Jikan is public)
- Enable/disable toggle
- Link to MAL profile page

### 2. Update Provider Config Hook
**File:** `packages/client/src/hooks/use-provider-config.ts`
- Add `malUsername` to `ProviderConfigData`
- Add `trpc.malConfig.get.useQuery()`
- Update `isProviderConfigured` for MAL provider

### 3. Provider Logic (shared)
**File:** `packages/shared/src/domain/logic/provider.logic.ts`
- Add `isMal(provider: ProviderType)` function

### 4. tRPC Router
**File:** `packages/server/src/presentation/trpc/routers/mal-config.router.ts`
- `get` - Get current MAL config
- `save` - Save MAL username
- `delete` - Remove MAL config

### 5. Validation Schema
**File:** `packages/shared/src/presentation/schemas/mal.schema.ts`
```typescript
export const malUsernameSchema = z
  .string()
  .trim()
  .min(2, 'MAL username must be at least 2 characters')
  .max(16, 'MAL username cannot exceed 16 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'MAL username can only contain letters, numbers, underscores, and hyphens');
```

---

## Rate Limiting Strategy
- Jikan: 60 req/min → ~1 req/sec for pagination
- ARM: Batch requests (up to 100 IDs per call)
- Total for 100 anime: ~5 Jikan calls + 1 ARM call

---

## Known Limitations

1. **Public profiles only** - Jikan cannot access private MAL lists
2. **Mapping gaps** - Not all anime have TMDB entries in ARM database
3. **Anime are TV shows** - Will request as `mediaType: 'tv'`
4. **No movies** - Anime movies have different handling (future enhancement)

---

## Sources

- [Jikan REST API v4 Docs](https://docs.api.jikan.moe/)
- [ARM API Documentation](https://arm.haglund.dev/docs)
- [TMDB Find By ID](https://developer.themoviedb.org/reference/find-by-id)
- [Overseerr Search by ID Discussion](https://github.com/sct/overseerr/discussions/1135)
- [Jellyseerr TVDB Discussion](https://github.com/Fallenbagel/jellyseerr/discussions/371)
- [ListSync Project](https://github.com/Woahai321/list-sync)
