# Listseerr

A full-stack application for syncing public movie/TV lists to Jellyseerr. Built with modern web technologies and end-to-end type safety.

## Architecture Overview

Listseerr is built as a monorepo with three distinct layers that work together:

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER (React)                     │
│  • UI Components (Radix UI, Tailwind CSS)                   │
│  • State Management (TanStack Query)                        │
│  • Theme System (next-themes)                               │
│  • Animations (Framer Motion)                               │
└────────────────────┬────────────────────────────────────────┘
                     │ tRPC Client
                     │ (Type-safe API calls)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    SERVER LAYER (Bun + Hono)                │
│  • HTTP Server (Hono web framework)                         │
│  • API Layer (tRPC routers)                                 │
│  • Business Logic (sync, validation)                        │
└────────────────────┬────────────────────────────────────────┘
                     │ Drizzle ORM
                     │ (Type-safe SQL)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   DATABASE LAYER (SQLite)                   │
│  • User data, List configurations                           │
│  • Jellyseerr settings, Sync history                        │
│  • Cached list items                                        │
└─────────────────────────────────────────────────────────────┘
```

## How the Layers Interact

### 1. Client → Server Communication

**Technology:** tRPC with React Query

The client makes type-safe API calls to the server without writing any HTTP request code. tRPC automatically:

- Validates inputs using Zod schemas
- Infers TypeScript types from server to client
- Handles serialization/deserialization

**Example:** When you click "Add List" in the UI:

```typescript
// Client code (AddListDialog.tsx)
const createMutation = trpc.lists.create.useMutation({
  onSuccess: (newList) => {
    // newList is fully typed!
    utils.lists.getAll.invalidate();
  },
});

// Server code (lists.ts router)
create: publicProcedure
  .input(listInputSchema) // Zod validates this
  .mutation(async ({ ctx, input }) => {
    // input is typed from the schema
    return await ctx.db.insert(mediaLists).values(input);
  });
```

### 2. Server → Database Communication

**Technology:** Drizzle ORM with Bun's native SQLite

The server interacts with the database using Drizzle, which provides:

- Type-safe query building
- Automatic TypeScript inference
- Zero runtime overhead

**Example:** Creating a new list:

```typescript
// schema.ts defines the types
export const mediaLists = sqliteTable('media_lists', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  // ...
});

// The router uses these types automatically
const [newList] = await ctx.db
  .insert(mediaLists)
  .values({ name: 'My List', ... })
  .returning();  // TypeScript knows the shape of newList
```

### 3. Data Flow Example: Adding a List

```
User clicks "Add List" button
         ↓
React component calls tRPC mutation
         ↓
tRPC validates input with Zod schema
         ↓
Server router receives typed data
         ↓
Drizzle ORM inserts into SQLite
         ↓
Database returns new row
         ↓
Drizzle types the response
         ↓
tRPC sends typed response to client
         ↓
React Query caches & updates UI
         ↓
User sees new list in table
```

## Tech Stack Explained

### Frontend Layer

#### **React 18**

- **Purpose:** UI library for building interactive interfaces
- **Layer:** Client
- **Why:** Industry standard, great ecosystem, hooks API

#### **TypeScript**

- **Purpose:** Type safety across entire application
- **Layer:** All layers
- **Why:** Catches bugs at compile time, better IDE support

#### **Vite 6**

- **Purpose:** Build tool and development server
- **Layer:** Build/Dev
- **Why:** Fast HMR, optimized builds, great DX

#### **Tailwind CSS**

- **Purpose:** Utility-first styling
- **Layer:** Client
- **Why:** Rapid UI development, consistent design system

#### **Radix UI**

- **Purpose:** Unstyled, accessible component primitives
- **Layer:** Client (UI components)
- **Why:** WAI-ARIA compliant, fully accessible, customizable

#### **TanStack Table**

- **Purpose:** Headless table library
- **Layer:** Client (ListsTable component)
- **Why:** Powerful sorting, filtering, flexible rendering

#### **TanStack Query (React Query)**

- **Purpose:** Data fetching and caching
- **Layer:** Client (data management)
- **Why:** Works seamlessly with tRPC, automatic cache invalidation

#### **Framer Motion**

- **Purpose:** Animation library
- **Layer:** Client (UI animations)
- **Why:** Smooth, physics-based animations

#### **next-themes**

- **Purpose:** Theme management (dark/light mode)
- **Layer:** Client
- **Why:** System preference detection, localStorage persistence

### Backend Layer

#### **Bun**

- **Purpose:** JavaScript runtime and package manager
- **Layer:** Runtime/Server
- **Why:** Faster than Node.js, native TypeScript support, built-in SQLite

#### **Hono**

- **Purpose:** Web framework
- **Layer:** Server (HTTP layer)
- **Why:** Lightweight (13KB), fast, edge-compatible, simple API

#### **tRPC v11**

- **Purpose:** End-to-end type-safe APIs
- **Layer:** Client ↔ Server bridge
- **Why:** No code generation, automatic type inference, great DX

#### **Drizzle ORM**

- **Purpose:** TypeScript ORM for database queries
- **Layer:** Server → Database
- **Why:** Type-safe, performant, great migrations system

#### **SQLite with WAL**

- **Purpose:** Embedded database
- **Layer:** Database
- **Why:** Serverless, simple deployment, WAL mode for better concurrency

#### **Zod**

- **Purpose:** Schema validation
- **Layer:** Server (tRPC input validation)
- **Why:** Required by tRPC, runtime validation, TypeScript inference

### Build/Dev Tools

#### **drizzle-kit**

- **Purpose:** Database migration tool
- **Layer:** Database management
- **Why:** Type-safe migrations, automatic schema generation

#### **ESLint + typescript-eslint**

- **Purpose:** Code linting
- **Layer:** Development
- **Why:** Code quality, consistency, catch errors early

## Supported List Providers

- **Trakt** - Movie/TV tracking service
- **Letterboxd** - Film social network
- **MDBList** - Movie database lists
- **IMDB** - Internet Movie Database
- **TheMovieDB** - Community-built movie database

## Features

- ✅ Full-stack TypeScript with end-to-end type safety
- ✅ SQLite database for persistent storage
- ✅ Dark/Light theme with system preference detection
- ✅ Sortable table with TanStack Table
- ✅ Real-time data updates with automatic cache invalidation
- ✅ Type-safe API with tRPC and React Query
- ✅ Accessible UI components from Radix UI
- ✅ Smooth animations with Framer Motion

## Getting Started

### Prerequisites

- **Bun** (install from [bun.sh](https://bun.sh))

### Installation

```bash
bun install
```

### Database Setup

Initialize the database with migrations:

```bash
bun run db:migrate
```

This creates:

- SQLite database at `./data/listseerr.db`
- All required tables (users, jellyseerr_configs, media_lists, etc.)
- A default user account

### Development

Run both frontend and backend servers:

**Terminal 1 - Backend:**

```bash
bun run dev:server
```

**Terminal 2 - Frontend:**

```bash
bun run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the app.

- Frontend dev server: http://localhost:5173 (Vite with HMR)
- Backend API server: http://localhost:3000 (tRPC endpoints)
- The frontend proxies `/trpc` requests to the backend automatically

### Build

```bash
bun run build
```

This builds both:

- Frontend static files → `dist/client/`
- Backend bundle → `dist/index.js`

### Production

```bash
bun run start
```

Serves both frontend and backend from a single Bun server on port 3000.

## Project Structure

```
listseerr/
├── src/
│   ├── client/              # Frontend code (React)
│   │   ├── components/
│   │   │   ├── ui/          # Reusable UI primitives (Radix-based)
│   │   │   │   ├── button.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── table.tsx
│   │   │   │   ├── theme-provider.tsx
│   │   │   │   ├── theme-toggle.tsx
│   │   │   │   └── ...
│   │   │   ├── AddListDialog.tsx       # Feature: Add new list
│   │   │   ├── JellyseerrConfigDialog.tsx
│   │   │   └── ListsTable.tsx          # Feature: Display lists
│   │   ├── hooks/           # React hooks
│   │   │   └── use-toast.ts
│   │   ├── lib/             # Frontend utilities
│   │   │   ├── trpc.ts      # tRPC client setup
│   │   │   ├── utils.ts     # Tailwind merge, etc.
│   │   │   └── url-validator.ts
│   │   ├── App.tsx          # Main app component
│   │   ├── main.tsx         # Entry point (providers setup)
│   │   └── index.css        # Global styles
│   │
│   ├── server/              # Backend code (Bun + Hono)
│   │   ├── db/
│   │   │   ├── schema.ts    # Drizzle schema definitions
│   │   │   ├── index.ts     # DB connection (Bun SQLite)
│   │   │   ├── migrate.ts   # Migration runner
│   │   │   └── migrations/  # SQL migration files
│   │   ├── trpc/
│   │   │   ├── trpc.ts      # tRPC initialization
│   │   │   ├── routers/     # API routers
│   │   │   │   ├── lists.ts     # List CRUD operations
│   │   │   │   ├── config.ts    # Jellyseerr config
│   │   │   │   ├── sync.ts      # Sync operations
│   │   │   │   └── scheduler.ts # Scheduling (future)
│   │   │   └── index.ts     # Root router (combines all)
│   │   └── index.ts         # Hono server setup
│   │
│   └── shared/              # Shared types between client/server
│       └── types.ts
│
├── data/                    # SQLite database (gitignored)
│   └── listseerr.db
│
├── public/                  # Static assets
│
├── drizzle.config.ts        # Drizzle Kit configuration
├── vite.config.ts           # Vite configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript project references
├── tsconfig.client.json     # TypeScript config for client
├── tsconfig.server.json     # TypeScript config for server
├── tsconfig.node.json       # TypeScript config for Vite config
└── package.json
```

## Available Scripts

- `bun run dev` - Start Vite dev server (frontend)
- `bun run dev:server` - Start Bun server with watch mode (backend)
- `bun run build` - Build both frontend and backend for production
- `bun run start` - Start production server
- `bun run db:generate` - Generate Drizzle migrations from schema
- `bun run db:migrate` - Run database migrations
- `bun run lint` - Run ESLint

## Database Schema

### Tables

#### **users**

- Single user by default (single-user application)
- Stores username and creation timestamp

#### **jellyseerr_configs**

- Jellyseerr instance URL, API key, user ID
- One config per user
- Tested before saving

#### **media_lists**

- List name, URL, provider type
- Max items limit, sync schedule
- Enabled/disabled state
- Timestamps (created, updated, last sync)

#### **sync_history**

- Record of all sync operations
- Success/failure status, error logs
- Items found/requested counts

#### **list_items_cache**

- Cached items from list providers
- Reduces API calls to external services
- Stores TMDB IDs and media types

## API Routes (tRPC)

All API routes are available under `/trpc` and are fully type-safe:

### `lists.*`

- `getAll` - Fetch all lists for user
- `create` - Add a new list
- `update` - Modify list settings
- `delete` - Remove a list
- `toggleEnabled` - Enable/disable a list

### `config.*`

- `get` - Get Jellyseerr configuration
- `set` - Save Jellyseerr configuration
- `test` - Test connection to Jellyseerr
- `delete` - Remove configuration

### `sync.*`

- `syncList` - Sync a specific list to Jellyseerr
- `getHistory` - Get sync operation history

### `scheduler.*` (planned)

- Schedule automatic syncs with cron expressions

## Configuration

### Environment Variables

#### **DATABASE_PATH**

Database file location (default: `./data/listseerr.db`)

```bash
DATABASE_PATH=./data/listseerr.db
```

#### **PORT**

Backend server port (default: `3000`)

```bash
PORT=3000
```

## Development Workflow

1. **Make changes** to frontend (`src/client/`) or backend (`src/server/`)
2. **Vite HMR** provides instant updates for frontend changes
3. **Bun watch mode** restarts backend automatically on changes
4. **tRPC** provides full type safety - change server types, client updates automatically
5. **Shared types** (`src/shared/`) are automatically reflected everywhere

### Type Safety Flow

When you modify a tRPC router:

1. Change the input/output schema
2. TypeScript immediately shows type errors in client code
3. Fix the client code with full autocomplete
4. No manual type syncing needed!

## Why This Stack?

### Type Safety First

Every layer is type-safe: React components → tRPC client → tRPC server → Drizzle ORM → SQLite. Change a database column, and TypeScript will tell you everywhere that needs updating.

### Simple Deployment

Single database file (SQLite), single server binary (Bun), static frontend files. No Redis, no PostgreSQL setup, no microservices.

### Great Developer Experience

- Instant HMR with Vite
- Auto-restart with Bun watch
- Type inference everywhere
- Simple configuration

### Modern & Fast

- Bun is faster than Node.js
- Hono is lightweight and edge-ready
- SQLite with WAL mode handles concurrent reads well
- tRPC has zero runtime overhead

## License

MIT
