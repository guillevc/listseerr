# AniList Integration Research

> Research conducted: January 2026
> Status: Planning phase - not yet implemented

## Overview

Integration of AniList into listseerr to allow users to sync their anime watchlists and request anime through Jellyseerr. This integration shares the anime ID cache with MAL integration.

## API Research Summary

### 1. AniList GraphQL API (Data Source)

**Endpoint:** `https://graphql.anilist.co` (POST requests only)

**Key Characteristics:**

- Official AniList GraphQL API
- **No authentication required** for public lists
- Only works with **public AniList profiles**
- Rate limits: **90 requests/minute** (normal), 30 req/min (degraded)

**Rate Limit Headers:**

- `X-RateLimit-Limit` - Maximum allowed requests
- `X-RateLimit-Remaining` - Requests remaining in window
- `Retry-After` - Seconds to wait (on 429 response)

**User Anime List Query:**

```graphql
query ($username: String, $status: MediaListStatus) {
  MediaListCollection(userName: $username, type: ANIME, status: $status) {
    lists {
      name
      status
      entries {
        mediaId
        score
        status
        media {
          id
          title {
            romaji
            english
          }
          format
          episodes
        }
      }
    }
  }
}
```

**Variables:**

```json
{
  "username": "AniListUsername",
  "status": "PLANNING"
}
```

**Status Values (MediaListStatus enum):**

- `CURRENT` - Currently watching
- `PLANNING` - Plan to watch
- `COMPLETED` - Finished watching
- `DROPPED` - Dropped
- `PAUSED` - On hold
- `REPEATING` - Re-watching

### List Configuration (Add List Dialog)

When adding an AniList list, users configure:

| Field         | Description                    | Default      | Options                                                              |
| ------------- | ------------------------------ | ------------ | -------------------------------------------------------------------- |
| **Username**  | AniList username to fetch from | _(required)_ | Any public AniList username                                          |
| **Status**    | Which list to sync             | `PLANNING`   | `CURRENT`, `PLANNING`, `COMPLETED`, `DROPPED`, `PAUSED`, `REPEATING` |
| **Max Items** | Limit items to fetch           | 100          | Number                                                               |

> **Note:** AniList GraphQL returns all entries at once (no pagination needed for most users).
> Users must have a **public profile** for their lists to be accessible.

**Response Structure:**

```json
{
  "data": {
    "MediaListCollection": {
      "lists": [
        {
          "name": "Planning",
          "status": "PLANNING",
          "entries": [
            {
              "mediaId": 1,
              "score": 0,
              "status": "PLANNING",
              "media": {
                "id": 1,
                "title": {
                  "romaji": "Cowboy Bebop",
                  "english": "Cowboy Bebop"
                },
                "format": "TV",
                "episodes": 26
              }
            }
          ]
        }
      ]
    }
  }
}
```

**Key Output:** `media.id` (AniList ID), `media.format`

### Media Format Mapping

AniList returns a `format` field that must be mapped to our supported types:

| AniList `format` | Description              | Maps To  | Notes                 |
| ---------------- | ------------------------ | -------- | --------------------- |
| `TV`             | Regular TV series        | `tv`     | Direct match          |
| `MOVIE`          | Theatrical films         | `movie`  | Direct match          |
| `OVA`            | Original Video Animation | `tv`     | Treated as TV in TMDB |
| `ONA`            | Original Net Animation   | `tv`     | Web anime             |
| `SPECIAL`        | Bonus episodes           | `tv`     | TV-adjacent content   |
| `TV_SHORT`       | Short TV episodes        | `tv`     | Mini episodes         |
| `MUSIC`          | Music videos             | **skip** | Not requestable       |

```typescript
function mapAnilistFormat(format: string): 'tv' | 'movie' | null {
  switch (format) {
    case 'TV':
    case 'OVA':
    case 'ONA':
    case 'SPECIAL':
    case 'TV_SHORT':
      return 'tv';
    case 'MOVIE':
      return 'movie';
    default:
      return null; // Skip 'MUSIC', etc.
  }
}
```

---

### 2. Anime ID Mapping (Shared Local Cache)

**Same cache as MAL integration** - The Fribb/anime-lists JSON contains both `mal_id` and `anilist_id` fields.

**Data Source:** [Fribb/anime-lists](https://github.com/Fribb/anime-lists)

- Same data that powers the ARM API
- Updated weekly upstream
- We cache locally with 24-hour refresh

**File:** `anime-list-full.json`

- **URL:** `https://raw.githubusercontent.com/Fribb/anime-lists/master/anime-list-full.json`
- **Size:** ~7.3 MB
- **AniList Coverage:** 20,114 entries with AniList IDs, 7,678 with TMDB IDs (**38.2%**)

**Entry Structure:**

```json
{
  "mal_id": 1,
  "anilist_id": 1,
  "themoviedb_id": 30991,
  "thetvdb_id": 76885,
  "type": "TV"
}
```

**Coverage Comparison (MAL vs AniList):**

| Metric            | MyAnimeList | AniList |
| ----------------- | ----------- | ------- |
| Total entries     | 29,765      | 20,114  |
| Entries with TMDB | 7,711       | 7,678   |
| Coverage %        | 25.9%       | 38.2%   |

> **Note:** The higher AniList percentage is due to fewer total entries, not better TMDB coverage.
> Both sources map to nearly identical TMDB entries (~7,700 anime).

---

### 3. Jellyseerr/Overseerr API

**Current Implementation in Listseerr:**

- Uses `POST /api/v1/request` with `mediaId` (TMDB ID)
- Same flow as MAL - AniList ID → TMDB ID → Jellyseerr request

---

## ID Conversion Chain

```
AniList username + List settings (status, maxItems)
    │
    ▼
┌─────────────────────────────────┐
│ AniList GraphQL API             │
│ POST https://graphql.anilist.co │
│ query: MediaListCollection      │
│ variables: {                    │
│   userName: "username",         │
│   type: ANIME,                  │
│   status: PLANNING              │  ← CURRENT|PLANNING|COMPLETED|etc.
│ }                               │
└─────────────────────────────────┘
    │
    ▼
AniList IDs + format
    │
    ├─► Filter: skip 'MUSIC'
    │
    ▼
┌─────────────────────────────────┐
│ Local Anime ID Cache            │
│ (anime-list-full.json)          │
│ In-memory lookup by anilist_id  │
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

**Example Cache Lookup (AniList ID 1 = Cowboy Bebop):**

```json
{
  "anilist_id": 1,
  "mal_id": 1,
  "themoviedb_id": 30991,
  "thetvdb_id": 76885,
  "type": "TV"
}
```

---

## Design Decisions

- **No authentication needed** - AniList GraphQL API is public for public profiles
- **Shared anime ID cache** - Same Fribb/anime-lists JSON as MAL integration
- **User-selectable list status** - Any status can be synced (PLANNING, CURRENT, etc.)
- **Include unmapped in report** - Track in execution history for visibility

---

## Implementation Plan

### 1. Add Provider Type

**File:** `packages/shared/src/domain/types/provider.types.ts`

```typescript
const ProviderValues = {
  // existing...
  ANILIST: 'anilist', // New
};
```

### 2. Create AniList Client

**File:** `packages/server/src/infrastructure/services/external/anilist/client.ts`

- `fetchAnimeList(username: string, status: AnilistStatus): Promise<AnilistAnimeEntry[]>`
- `username` is required (must be explicit AniList username, profile must be public)
- GraphQL POST request to `https://graphql.anilist.co`
- `status` param from list config (CURRENT, PLANNING, COMPLETED, DROPPED, PAUSED, REPEATING)
- Respect 90 req/min rate limit

### 3. Update Anime ID Cache Client (if MAL not implemented first)

**File:** `packages/server/src/infrastructure/services/external/anime-id-cache/client.ts`

- Add `getTmdbIdFromAnilist(anilistId: number): Promise<number | null>`
- Reuse existing cache (already contains `anilist_id`)
- Build `Map<anilistId, tmdbId>` alongside existing MAL map

### 4. Create AniList Media Fetcher

**File:** `packages/server/src/infrastructure/services/adapters/anilist-media-fetcher.adapter.ts`

- Implements `IMediaFetcher`
- `fetchItems(url: string, maxItems: number)` where `url` encodes username+status (e.g., `anilist:Username:PLANNING`)
- Orchestrates: AniList GraphQL → Anime ID Cache → MediaItemVO[]
- Parses username and status from URL identifier
- Maps AniList `format` to `tv`/`movie`, skips `MUSIC`
- Tracks unmapped items for reporting

### 5. Add AniList Provider Logic

**File:** `packages/shared/src/domain/logic/provider.logic.ts`

- Add `isAnilist(provider: ProviderType)` function

### 6. Update Factory

**File:** `packages/server/src/infrastructure/services/adapters/media-fetcher-factory.adapter.ts`

- Add case for `anilist` provider

### 7. Update Execution History

Track unmapped anime in execution result for user visibility.

---

## File Structure

```
packages/server/src/
├── infrastructure/
│   └── services/
│       ├── adapters/
│       │   └── anilist-media-fetcher.adapter.ts (new)
│       └── external/
│           ├── anilist/
│           │   ├── client.ts (new)
│           │   └── types.ts (new)
│           └── anime-id-cache/
│               ├── client.ts (shared with MAL)
│               └── types.ts (shared with MAL)
```

> **Note:** No separate config entity needed - AniList requires no API key.
> Username is stored per-list in the Add List dialog (encoded in URL).

---

## Frontend Changes

### 1. Provider Logic (shared)

**File:** `packages/shared/src/domain/logic/provider.logic.ts`

- Add `isAnilist(provider: ProviderType)` function

### 2. Validation Schema

**File:** `packages/shared/src/presentation/schemas/anilist.schema.ts`

```typescript
export const anilistUsernameSchema = z
  .string()
  .trim()
  .min(2, 'AniList username must be at least 2 characters')
  .max(20, 'AniList username cannot exceed 20 characters');

export const anilistStatusSchema = z.enum([
  'CURRENT',
  'PLANNING',
  'COMPLETED',
  'DROPPED',
  'PAUSED',
  'REPEATING',
]);

export type AnilistStatus = z.infer<typeof anilistStatusSchema>;
```

### 3. Add List Dialog (AniList-specific fields)

**File:** `packages/client/src/components/lists/AddListDialog.tsx`

- When AniList provider selected, show:
  - **Username input**: Text field, required (user's AniList username, profile must be public)
  - **Status dropdown**: Select which list to sync (CURRENT, PLANNING, etc.)
  - **Max Items input**: Standard input like other providers
- Identifier stored in list's `url` field as `anilist:{username}:{status}`
  - Example: `anilist:Username:PLANNING` or `anilist:Username:CURRENT`

### 4. Update Provider Config Hook

**File:** `packages/client/src/hooks/use-provider-config.ts`

- Update `isProviderConfigured` for AniList provider (always returns `true` - no API key needed)

---

## Rate Limiting Strategy

- **AniList GraphQL**: 90 req/min (normal), 30 req/min (degraded)
- **Anime ID Cache**: No external calls during sync (local lookup)
- **GitHub Raw**: Only fetched once per 24 hours for cache refresh
- **Total for sync**: ~1 AniList call + instant local lookups

---

## Known Limitations

1. **Public profiles only** - Can only fetch public AniList profiles
2. **Mapping gaps** - Only ~38.2% of AniList entries have TMDB IDs in the mapping database
3. **Skipped formats** - `MUSIC` format is skipped
4. **Same TMDB coverage as MAL** - Despite higher percentage, absolute TMDB mappings are similar (~7,700)
5. **Rate limits can change** - AniList may reduce to 30 req/min during high load

---

## Comparison with MAL Integration

| Aspect         | MAL                               | AniList                     |
| -------------- | --------------------------------- | --------------------------- |
| API Type       | REST                              | GraphQL                     |
| Authentication | Client ID required                | None required               |
| Rate Limit     | Undocumented                      | 90 req/min                  |
| Pagination     | Offset-based                      | All at once                 |
| Status Values  | `watching`, `plan_to_watch`, etc. | `CURRENT`, `PLANNING`, etc. |
| TMDB Coverage  | 7,711 entries                     | 7,678 entries               |
| Config Storage | API Key in settings               | None needed                 |

**Key Advantage:** AniList requires no API key configuration, making it simpler for users.

---

## Sources

- [AniList API Documentation](https://docs.anilist.co/)
- [AniList GraphiQL Explorer](https://anilist.co/graphiql)
- [AniList Rate Limiting](https://docs.anilist.co/guide/rate-limiting)
- [Fribb/anime-lists Repository](https://github.com/Fribb/anime-lists) - ID mapping data source
- [ARM API Documentation](https://arm.haglund.dev/docs) - Uses same Fribb data
