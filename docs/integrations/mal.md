# My Anime List (MAL) Integration Research

> Research conducted: January 2026
> Status: Planning phase - not yet implemented

## Overview

Integration of MAL into listseerr to allow users to sync their anime watchlists and request anime through Jellyseerr.

## API Research Summary

### 1. Official MyAnimeList API v2 (MAL Data Source)

> **Important:** Jikan API's user list endpoints were **discontinued in May 2022**.
> We must use the official MAL API instead. See: [Jikan User List Discontinuation](https://jikan.moe/discontinued)

**Base URL:** `https://api.myanimelist.net/v2`

**Key Characteristics:**

- Official MyAnimeList API
- **Client ID required** - Users must register an app at [MAL API Config](https://myanimelist.net/apiconfig)
- **No OAuth needed for public lists** - Just `X-MAL-Client-ID` header
- Only works with **public MAL profiles**
- Rate limits: Not publicly documented

**User Anime List Endpoint:**

```
GET https://api.myanimelist.net/v2/users/{username}/animelist
```

**Required Headers:**

```
X-MAL-Client-ID: <your_client_id>
```

**Query Parameters:**

- `status` - Filter: `watching`, `completed`, `on_hold`, `dropped`, `plan_to_watch`
- `sort` - Sort order: `list_score`, `list_updated_at`, `anime_title`, `anime_start_date`
- `limit` - Items per page (max 1000)
- `offset` - Pagination offset
- `fields` - Comma-separated list of fields to include

**Example Request:**

```
GET https://api.myanimelist.net/v2/users/Nekomata1037/animelist?status=plan_to_watch&limit=100&fields=media_type
Headers:
  X-MAL-Client-ID: your_client_id_here
```

> **Note:** With Client ID only authentication, you must provide an explicit username.
> The `@me` placeholder requires OAuth (Bearer token), which we don't use.

### List Configuration (Add List Dialog)

When adding a MAL list, users configure:

| Field         | Description                | Default         | Options                                                        |
| ------------- | -------------------------- | --------------- | -------------------------------------------------------------- |
| **Username**  | MAL username to fetch from | _(required)_    | Any public MAL username                                        |
| **Status**    | Which list to sync         | `plan_to_watch` | `watching`, `completed`, `on_hold`, `dropped`, `plan_to_watch` |
| **Max Items** | Limit items to fetch       | 100             | Number (max 1000)                                              |

> **Important:** With Client ID authentication, `@me` is NOT supported.
> Users must enter their MAL username explicitly, and their list must be **public**.
> See: [MAL API Public Access Announcement](https://myanimelist.net/forum/?topicid=1973077)

This follows the same pattern as other providers where users specify the list identifier and max items.

**Response Structure:**

```json
{
  "data": [
    {
      "node": {
        "id": 1234,
        "title": "Anime Title",
        "main_picture": { ... },
        "media_type": "tv"
      },
      "list_status": {
        "status": "plan_to_watch",
        "score": 0,
        "num_episodes_watched": 0,
        "updated_at": "2024-01-15T..."
      }
    }
  ],
  "paging": {
    "next": "https://api.myanimelist.net/v2/users/..."
  }
}
```

**Key Output:** `node.id` (MyAnimeList ID), `node.media_type`

### Media Type Mapping

MAL returns a `media_type` field that must be mapped to our supported types:

| MAL `media_type` | Description                            | Maps To  | Notes                            |
| ---------------- | -------------------------------------- | -------- | -------------------------------- |
| `tv`             | Regular TV series                      | `tv`     | Direct match                     |
| `movie`          | Theatrical films                       | `movie`  | Direct match                     |
| `ova`            | Original Video Animation (DVD/Blu-ray) | `tv`     | Treated as TV in TMDB            |
| `ona`            | Original Net Animation (streaming)     | `tv`     | Web anime like Netflix originals |
| `special`        | Bonus episodes, side stories           | `tv`     | TV-adjacent content              |
| `music`          | Music videos                           | **skip** | Not requestable                  |
| `unknown`        | Unknown type                           | **skip** | Cannot determine                 |

```typescript
function mapMalMediaType(malType: string): 'tv' | 'movie' | null {
  switch (malType) {
    case 'tv':
    case 'ova':
    case 'ona':
    case 'special':
      return 'tv';
    case 'movie':
      return 'movie';
    default:
      return null; // Skip 'music', 'unknown', etc.
  }
}
```

**How to Get a Client ID:**

1. Go to https://myanimelist.net/apiconfig
2. Click "Create ID"
3. Fill in app details (name, description, redirect URL can be `http://localhost`)
4. Submit and copy the Client ID

---

### 2. Anime ID Mapping (Local Cache)

Instead of using the ARM API at runtime, we cache the source data locally (same approach as StevenLu provider).

**Data Source:** [Fribb/anime-lists](https://github.com/Fribb/anime-lists)

- Same data that powers the ARM API
- Updated weekly upstream
- We cache locally with 24-hour refresh

**File:** `anime-list-full.json`

- **URL:** `https://raw.githubusercontent.com/Fribb/anime-lists/master/anime-list-full.json`
- **Size:** ~7.3 MB
- **Coverage:** 29,765 MAL entries, 7,897 with TMDB IDs (~26.5%)

**Entry Structure:**

```json
{
  "mal_id": 1,
  "themoviedb_id": 30991,
  "thetvdb_id": 76885,
  "anilist_id": 1,
  "type": "TV"
}
```

**Why Local Cache (not ARM API):**
| Aspect | ARM API | Local Cache |
|--------|---------|-------------|
| Runtime dependency | External API | Self-contained |
| Speed | Network calls | In-memory lookup |
| Reliability | Can fail/rate limit | Always available |
| Pattern | New | Existing (StevenLu) |
| Data | Same source | Same source |

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
MAL Client ID (from config) + List settings (username, status, maxItems)
    │
    ▼
┌─────────────────────────────────┐
│ MAL API v2                      │
│ GET /users/{username}/animelist │  ← explicit username (list must be public)
│ ?status={status}                │  ← watching|completed|on_hold|dropped|plan_to_watch
│ &limit={maxItems}               │  ← from list config
│ &fields=media_type              │
│ Header: X-MAL-Client-ID         │
└─────────────────────────────────┘
    │
    ▼
MAL IDs + media_type
    │
    ├─► Filter: skip 'music', 'unknown'
    │
    ▼
┌─────────────────────────────────┐
│ Local Anime ID Cache            │
│ (anime-list-full.json)          │
│ In-memory lookup by mal_id      │
│ 24h cache refresh               │
└─────────────────────────────────┘
    │
    ▼
TMDB IDs (themoviedb_id field)
    │
    ▼
┌─────────────────────────────────┐
│ Jellyseerr                      │
│ POST /api/v1/request            │
│ { mediaType: tv|movie, mediaId }│
└─────────────────────────────────┘
```

> **Note:** Client ID authentication only works with explicit usernames and public lists.
> The `@me` endpoint requires OAuth (Bearer token) which we don't implement.

**Example Cache Entry (MAL ID 1 = Cowboy Bebop):**

```json
{
  "mal_id": 1,
  "themoviedb_id": 30991,
  "thetvdb_id": 76885,
  "anilist_id": 1,
  "type": "TV"
}
```

---

## Design Decisions

- **No TMDB API key needed** - Local cache provides TMDB IDs directly from Fribb/anime-lists
- **No external runtime dependencies** - Local JSON cache (24h refresh) instead of ARM API calls
- **User-selectable list status** - Any status can be synced (watching, plan_to_watch, etc.)
- **Include unmapped in report** - Track in execution history for visibility

---

## Implementation Plan

### 1. Add Provider Type

**File:** `packages/shared/src/domain/types/provider.types.ts`

```typescript
const ProviderValues = {
  // existing...
  MAL: 'mal', // New
};
```

### 2. Create MAL API Client

**File:** `packages/server/src/infrastructure/services/external/mal/client.ts`

- `fetchAnimeList(clientId: string, username: string, status: MalStatus, limit: number): Promise<MalAnimeEntry[]>`
- `username` is required (must be explicit MAL username, list must be public)
- Use `X-MAL-Client-ID` header for authentication
- Request `fields=media_type` to get anime type
- `status` param from list config (watching, completed, on_hold, dropped, plan_to_watch)
- `limit` param from list config (maxItems, capped at 1000)

### 3. Create Anime ID Cache Client

**File:** `packages/server/src/infrastructure/services/external/anime-id-cache/client.ts`

- `getTmdbId(malId: number): Promise<number | null>`
- `refreshCache(): Promise<void>` - Fetch and cache the JSON file
- Cache stored in `providerCache` table with provider='anime-ids'
- 24-hour cache TTL (same as StevenLu pattern)
- In-memory Map for fast lookups after initial load

**Cache Implementation (following StevenLu pattern):**

```typescript
const CACHE_URL = 'https://raw.githubusercontent.com/Fribb/anime-lists/master/anime-list-full.json';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

// Check providerCache table first
// If expired or missing, fetch from GitHub and update cache
// Build Map<malId, tmdbId> for O(1) lookups
```

### 4. Create MAL Media Fetcher

**File:** `packages/server/src/infrastructure/services/adapters/mal-media-fetcher.adapter.ts`

- Implements `IMediaFetcher`
- `fetchItems(url: string, maxItems: number)` where `url` encodes username+status (e.g., `mal:Nekomata1037:plan_to_watch`)
- Orchestrates: MAL API → Anime ID Cache → MediaItemVO[]
- Parses username and status from URL identifier
- Passes `username`, `status`, and `maxItems` to MAL API client
- Maps MAL `media_type` to `tv`/`movie`, skips `music`/`unknown`
- Tracks unmapped items and skipped items for reporting

### 5. Add MAL Configuration

**Files:**

- Entity: `packages/server/src/domain/entities/mal-config.entity.ts`
- Schema: `packages/server/src/infrastructure/db/schema/mal-config.schema.ts`
- Repository: `packages/server/src/infrastructure/repositories/drizzle-mal-config.repository.ts`

**Config fields:**

- `clientId: string` - MAL API Client ID (required, encrypted)
- `userId: number` - FK to users table

> **Note:** Config only stores the Client ID. Username and status are stored per-list
> in the Add List dialog (encoded in the list URL as `mal:{username}:{status}`).

### 6. Update Factory

**File:** `packages/server/src/infrastructure/services/adapters/media-fetcher-factory.adapter.ts`

- Add case for `mal` provider
- Load `clientId` from `MalConfigRepository`

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
│           ├── mal/
│           │   ├── client.ts (new)
│           │   └── types.ts (new)
│           └── anime-id-cache/
│               ├── client.ts (new)       # Cache management & lookups
│               └── types.ts (new)        # AnimeIdEntry interface
```

---

## Frontend Changes

### 1. API Keys Settings (add MAL card)

**File:** `packages/client/src/pages/settings/ApiKeysSettings.tsx`

- Add new Card for MAL configuration (follows Trakt/MDBList pattern)
- Field: `clientId` - MAL API Client ID (encrypted, password input)
- Enable/disable toggle
- Link to [MAL API Config](https://myanimelist.net/apiconfig) for getting Client ID
- Info text: "Syncs your own MAL Plan to Watch list (the account that created this Client ID)"

### 2. Update Provider Config Hook

**File:** `packages/client/src/hooks/use-provider-config.ts`

- Add `malClientId` to `ProviderConfigData`
- Add `trpc.malConfig.get.useQuery()`
- Update `isProviderConfigured` for MAL provider

### 3. Provider Logic (shared)

**File:** `packages/shared/src/domain/logic/provider.logic.ts`

- Add `isMal(provider: ProviderType)` function

### 4. tRPC Router

**File:** `packages/server/src/presentation/trpc/routers/mal-config.router.ts`

- `get` - Get current MAL config (clientId presence only, not the actual key)
- `save` - Save MAL Client ID
- `delete` - Remove MAL config

### 5. Validation Schema

**File:** `packages/shared/src/presentation/schemas/mal.schema.ts`

```typescript
export const malClientIdSchema = z
  .string()
  .trim()
  .min(32, 'MAL Client ID must be at least 32 characters')
  .max(64, 'MAL Client ID cannot exceed 64 characters');

export const malUsernameSchema = z
  .string()
  .trim()
  .min(2, 'MAL username must be at least 2 characters')
  .max(16, 'MAL username cannot exceed 16 characters')
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    'MAL username can only contain letters, numbers, underscores, and hyphens'
  );

export const malStatusSchema = z.enum([
  'watching',
  'completed',
  'on_hold',
  'dropped',
  'plan_to_watch',
]);

export type MalStatus = z.infer<typeof malStatusSchema>;
```

### 6. Add List Dialog (MAL-specific fields)

**File:** `packages/client/src/components/lists/AddListDialog.tsx`

- When MAL provider selected, show:
  - **Username input**: Text field, required (user's MAL username, list must be public)
  - **Status dropdown**: Select which list to sync (watching, completed, etc.)
  - **Max Items input**: Standard input like other providers
- Identifier stored in list's `url` field as `mal:{username}:{status}`
  - Example: `mal:Nekomata1037:plan_to_watch` or `mal:Nekomata1037:watching`

---

## Rate Limiting Strategy

- **MAL API**: Rate limits not publicly documented (be conservative)
- **Anime ID Cache**: No external calls during sync (local lookup)
- **GitHub Raw**: Only fetched once per 24 hours for cache refresh
- **Total for 100 anime**: ~1 MAL call (limit=1000) + instant local lookups

---

## Known Limitations

1. **Public lists only** - Can only fetch public MAL profiles (private lists require OAuth)
2. **Mapping gaps** - Only ~26.5% of MAL entries have TMDB IDs in the mapping database
3. **Skipped types** - `music` and `unknown` media types are skipped
4. **Client ID required** - Users must register an app at MAL to get a Client ID
5. **Rate limits unknown** - MAL API rate limits aren't documented, be conservative
6. **Cache size** - The anime-list-full.json is ~7.3 MB, stored in database as JSON string

---

## Sources

- [MyAnimeList API v2 Documentation](https://myanimelist.net/apiconfig/references/api/v2)
- [MAL API Public Access Announcement](https://myanimelist.net/forum/?topicid=1973077)
- [Jikan User List Discontinuation Notice](https://jikan.moe/discontinued)
- [Fribb/anime-lists Repository](https://github.com/Fribb/anime-lists) - ID mapping data source
- [ARM API Documentation](https://arm.haglund.dev/docs) - Uses same Fribb data
- [Overseerr Search by ID Discussion](https://github.com/sct/overseerr/discussions/1135)
- [Jellyseerr TVDB Discussion](https://github.com/Fallenbagel/jellyseerr/discussions/371)
