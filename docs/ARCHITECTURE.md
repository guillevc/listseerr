# Architecture

Listseerr uses a layered architecture split across three packages: `server`, `client`, and `shared`.

```
┌─────────────────────────────────────────────────────────────────┐
│  PRESENTATION — tRPC routers, request/response handling         │
└───────────────────────────────┬─────────────────────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  APPLICATION — Use Cases, Repository/Service Interfaces (Ports) │
└───────────────────────────────┬─────────────────────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  DOMAIN — Entities, Value Objects, Business Rules               │
└─────────────────────────────────────────────────────────────────┘
                                ▲
┌───────────────────────────────┴─────────────────────────────────┐
│  INFRASTRUCTURE — Implements interfaces (Adapters), ORM, I/O    │
└─────────────────────────────────────────────────────────────────┘
```

## Layers

| Layer          | Responsibility                                   | Depends On          |
| -------------- | ------------------------------------------------ | ------------------- |
| Domain         | Business rules, Entities, Value Objects          | Nothing             |
| Application    | Use Cases, Repository/Service Interfaces (Ports) | Domain              |
| Infrastructure | Implements interfaces (Adapters), ORM, I/O       | Application, Domain |
| Presentation   | tRPC routers, request/response handling          | Application only    |
| Bootstrap      | DI wiring, startup, migrations                   | All layers          |

**Key rules:**

- Dependency inversion applies at the Application↔Infrastructure boundary via interfaces
- Inner layers must be compilable without outer layers
- ❌ Domain cannot import from Application or Infrastructure
- ❌ Application cannot import from Infrastructure

## Naming Conventions

| Artifact          | Pattern                     | Location                       | Example                   |
| ----------------- | --------------------------- | ------------------------------ | ------------------------- |
| Runtime Constants | `<Name>Values`              | `shared/domain/types/`         | `ProviderValues`          |
| Enum Type         | `<Name>Type`                | `shared/domain/types/`         | `ProviderType`            |
| Branded Primitive | `<Name>Primitive`           | `shared/domain/types/`         | `TraktClientIdPrimitive`  |
| Value Object      | `<Name>VO`                  | `server/domain/value-objects/` | `ProviderVO`              |
| Entity            | `<Name>`                    | `server/domain/entities/`      | `MediaList`               |
| Logic Function    | `is<Name>()`, `get<Name>()` | `shared/domain/logic/`         | `isTrakt()`               |
| Command DTO       | `<Action><Entity>Command`   | `shared/application/dtos/`     | `SaveTraktConfigCommand`  |
| Response DTO      | `<Action><Entity>Response`  | `shared/application/dtos/`     | `SaveTraktConfigResponse` |
| Zod Schema        | `<name>Schema`              | `shared/presentation/schemas/` | `providerSchema`          |

> **Note:** Don't add `Type` suffix if the name already ends in "Type" (use `MediaType` not `MediaTypeType`).

## Core Patterns

### Type-Safe Enums

```typescript
// shared/domain/types/provider.types.ts
export const ProviderValues = { TRAKT: 'trakt', MDBLIST: 'mdblist' } as const;
export type ProviderType = (typeof ProviderValues)[keyof typeof ProviderValues];
```

### Primitives vs Value Objects

| Aspect   | Primitives                    | Value Objects                     |
| -------- | ----------------------------- | --------------------------------- |
| Location | `shared/`                     | `server/domain/value-objects/`    |
| Purpose  | Shape validation, DTOs, forms | Business rules, integrity         |
| Used by  | Client, Presentation, Schemas | Use Cases, Entities, Repositories |

Primitives **travel** across boundaries. VOs **enforce business rules** on the server.

### Value Objects

```typescript
export class ProviderVO {
  private constructor(private readonly value: ProviderType) {}

  static create(value: ProviderType): ProviderVO {
    return new ProviderVO(value); // Already validated by schema
  }

  static fromPersistence(value: string): ProviderVO {
    if (!isValidProvider(value)) throw new InvalidProviderError(value);
    return new ProviderVO(value as ProviderType);
  }

  getValue(): ProviderType {
    return this.value;
  }
}
```

- `create()` — for data from tRPC (already validated)
- `fromPersistence()` — for data from database (needs validation)

### Entities

- Use `static create()` when entity has defaults or creation-time logic
- New (unpersisted) entities use `id: 0`
- Repository checks `id === 0` to decide INSERT vs UPDATE

### Repositories

```typescript
// Application layer: defines interface
export interface IMediaListRepository {
  findById(id: number, userId: number): Promise<MediaList | null>;
  findAll(userId: number): Promise<MediaList[]>;
  save(entity: MediaList): Promise<MediaList>;
  delete(entity: MediaList): Promise<void>;
}

// Infrastructure layer: implements interface with Drizzle
```

- Infrastructure **can** create VOs and Entities
- Infrastructure **cannot** call Entity mutation methods (only Use Cases do that)

### Use Cases

```typescript
export class SaveTraktConfigUseCase {
  constructor(private readonly repo: ITraktConfigRepository) {}

  async execute(command: SaveTraktConfigCommand): Promise<TraktConfigResponse> {
    const clientId = TraktClientIdVO.create(command.clientId);
    const existing = await this.repo.findByUserId(command.userId);

    if (existing) {
      existing.updateClientId(clientId);
      return TraktConfigMapper.toResponse(await this.repo.save(existing));
    }

    const config = TraktConfig.create({ userId: command.userId, clientId });
    return TraktConfigMapper.toResponse(await this.repo.save(config));
  }
}
```

Use Cases coordinate business flow and depend only on interfaces.

## Data Flow

```
Client → Schema (validates) → DTO → UseCase (VO.create()) → Entity
                                                              ↓
Database ← Repository (getValue()) ← Entity ←────────────────┘

Database → Repository (fromPersistence()) → Entity → Mapper → DTO → Client
```

## Server Structure

```
packages/server/src/
├── domain/
│   ├── entities/           # Business entities
│   └── value-objects/      # Value objects
├── application/
│   ├── use-cases/          # Business logic
│   ├── repositories/       # Repository interfaces
│   ├── services/           # Service interfaces
│   └── mappers/            # Entity ↔ DTO mappers
├── infrastructure/
│   ├── db/                 # Drizzle schema
│   ├── repositories/       # Repository implementations
│   └── services/
│       ├── core/           # Logger, Scheduler, Encryption
│       ├── adapters/       # Interface implementations
│       └── external/       # API clients (Jellyseerr, Trakt)
├── presentation/
│   └── trpc/routers/       # tRPC routers
└── bootstrap/              # DI wiring, startup
```

## Client Architecture

**Stack:** React 19, TanStack Router, TanStack Query, tRPC, Radix UI, Tailwind CSS

```
packages/client/src/
├── components/
│   ├── ui/           # Radix UI primitives
│   ├── lists/        # Feature components
│   ├── dashboard/    # Dashboard components
│   └── layout/       # App layout
├── pages/            # Page components
├── routes/           # TanStack Router definitions
├── hooks/            # Custom hooks
└── lib/              # Utilities (trpc, router)
```

### tRPC Usage

```typescript
// Query
const { data, isLoading } = trpc.lists.getAll.useQuery();

// Mutation
const utils = trpc.useUtils();
const mutation = trpc.lists.create.useMutation({
  onSuccess: () => void utils.lists.getAll.invalidate(),
});
mutation.mutate({ name, url, provider });
```

## Error Handling

- `DomainError` base class for business errors
- tRPC middleware translates errors to HTTP status
- Never expose raw database errors or stack traces
