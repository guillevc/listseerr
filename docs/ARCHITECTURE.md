# ARCHITECTURE.md

## Overview

Listseerr follows a layered architecture with clear separation of concerns. The codebase is split across three packages: `server`, `client`, and `shared`.

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

---

## 1. Layer Architecture

### Layer Responsibilities

| Layer          | Responsibility                                      | Depends On          |
| -------------- | --------------------------------------------------- | ------------------- |
| Domain         | Business rules, Entities, Value Objects             | Nothing             |
| Application    | Use Cases, Repository/Service Interfaces (Ports)    | Domain              |
| Infrastructure | Implements interfaces (Adapters), ORM, external I/O | Application, Domain |
| Presentation   | tRPC routers, request/response handling             | Application only    |
| Bootstrap      | DI wiring, startup, migrations                      | All layers          |

### Import Rules

**Server imports:**

| Layer          | Can Import From                |
| -------------- | ------------------------------ |
| Domain         | `server/domain/value-objects/` |
| Application    | Domain                         |
| Infrastructure | Application, Domain            |
| Presentation   | Application only               |
| Bootstrap      | All layers                     |

**Shared imports:**

| Layer          | Can Import From                                                                                       |
| -------------- | ----------------------------------------------------------------------------------------------------- |
| Domain         | `shared/domain/types/`, `shared/domain/errors/`, `shared/domain/logic/`                               |
| Application    | `shared/domain/`, `shared/application/`                                                               |
| Infrastructure | `shared/domain/`, `shared/application/`                                                               |
| Presentation   | `shared/application/`, `shared/domain/types/`, `shared/domain/errors/`, `shared/presentation/`        |
| Client         | `shared/domain/types/`, `shared/domain/logic/`, `shared/presentation/schemas/`, `shared/application/` |

### Dependency Rules

- Outer layers can depend on **any** inner layer directly (no layer-by-layer chain required)
- **Dependency inversion applies only at the Application↔Infrastructure boundary** via interfaces (Ports/Adapters)
- Application defines interfaces (`IUserRepository`), Infrastructure implements them
- No need for interfaces between other layers—the one-way dependency flow is sufficient

**What these rules prevent:**

- ❌ Domain importing from Infrastructure
- ❌ Domain importing from Application
- ❌ Application importing from Infrastructure

**The test:** Inner layers must be compilable/testable without outer layers existing.

### Presentation/Client Access to Shared

| Path                           | Allowed | Notes                             |
| ------------------------------ | ------- | --------------------------------- |
| `shared/domain/types/`         | ✅      | Primitive constants, type aliases |
| `shared/domain/errors/`        | ✅      | Error classes                     |
| `shared/domain/logic/`         | ✅      | Pure display/detection functions  |
| `shared/presentation/schemas/` | ✅      | Zod schemas for validation        |
| `server/domain/value-objects/` | ❌      | Server-only                       |

---

## 2. Naming Conventions

### Types and Values

| Artifact            | Pattern                   | Location               | Example                  |
| ------------------- | ------------------------- | ---------------------- | ------------------------ |
| Runtime Constants   | `<Name>Values`            | `shared/domain/types/` | `ProviderValues`         |
| Enum Type           | `<Name>Type`              | `shared/domain/types/` | `ProviderType`           |
| Branded Primitive   | `<Name>Primitive`         | `shared/domain/types/` | `TraktClientIdPrimitive` |
| Composite Primitive | `<Action><Name>Primitive` | `shared/domain/types/` | `CreateListPrimitive`    |

### Domain

| Artifact         | Pattern                                                           | Location                       | Example                                  |
| ---------------- | ----------------------------------------------------------------- | ------------------------------ | ---------------------------------------- |
| Value Object     | `<Name>VO`                                                        | `server/domain/value-objects/` | `ProviderVO`                             |
| Entity           | `<Name>`                                                          | `server/domain/entities/`      | `MediaList`                              |
| Logic Functions  | `is<Name>()`, `get<Name>()`, `normalize<Type>()`, `parse<Type>()` | `shared/domain/logic/`         | `isTrakt()`, `normalizeTraktMediaType()` |
| Display Names    | `<Type>DisplayNames`                                              | `shared/domain/logic/`         | `TraktChartDisplayNames`                 |
| URL Pattern      | `<TYPE>_URL_PATTERN`                                              | `shared/domain/logic/`         | `TRAKT_CHART_URL_PATTERN`                |
| URL Patterns Map | `<Type>UrlPatterns`                                               | `shared/domain/types/`         | `ProviderUrlPatterns`                    |

### Application & Presentation

| Artifact     | Pattern                    | Location                        | Example                   |
| ------------ | -------------------------- | ------------------------------- | ------------------------- |
| Command DTO  | `<Action><Entity>Command`  | `shared/application/dtos/`      | `SaveTraktConfigCommand`  |
| Response DTO | `<Action><Entity>Response` | `shared/application/dtos/`      | `SaveTraktConfigResponse` |
| Core DTO     | `<Entity>DTO`              | `shared/application/dtos/core/` | `MediaListDTO`            |
| Zod Schema   | `<name>Schema`             | `shared/presentation/schemas/`  | `providerSchema`          |

> **Note:** When the domain name already ends in "Type" (e.g., `MediaType`, `TriggerType`), don't add another `Type` suffix. Use `MediaType` not `MediaTypeType`.

---

## 3. Core Patterns

### Type-Safe Enum Pattern

```typescript
// shared/domain/types/provider.types.ts
export const ProviderValues = {
  TRAKT: 'trakt',
  MDBLIST: 'mdblist',
} as const;

export type ProviderType = (typeof ProviderValues)[keyof typeof ProviderValues];
```

Export `<Name>Values` and `<Name>Type` from types file. VOs import and use these for validation—no need to duplicate the values.

### Primitive Type Hierarchy

Domain types define contracts that DTOs and schemas must satisfy:

```typescript
// shared/domain/types/list.types.ts
export type ListNamePrimitive = string;
export type ListUrlPrimitive = string;

export interface CreateListPrimitive {
  name: ListNamePrimitive;
  url: ListUrlPrimitive;
  provider: ProviderType;
  enabled: boolean;
  maxItems: number;
}

export type UpdateListPrimitive = Partial<CreateListPrimitive>;
```

DTOs reference primitives instead of generic `string`:

```typescript
// Command DTO - extends composite primitive, adds request context
export interface CreateMediaListCommand extends CreateListPrimitive {
  userId: number;
}

// Core DTO - uses branded primitives for VO-backed fields
export interface MediaListDTO {
  id: number;
  name: ListNamePrimitive;
  url: ListUrlPrimitive;
  provider: ProviderType;
}
```

**Primitive categories:**

| Category            | Purpose                         | Example                                       |
| ------------------- | ------------------------------- | --------------------------------------------- |
| Branded Primitive   | Type alias for VO-backed values | `type TraktClientIdPrimitive = string`        |
| Enum Type           | Constrained set of values       | `type ProviderType = 'trakt' \| 'mdblist'`    |
| Composite Primitive | Groups related fields           | `interface CreateListPrimitive { name, url }` |

**Benefits:**

- DTOs are self-documenting (field types reveal domain meaning)
- Zod schemas satisfy primitive interfaces (compile-time check)
- Refactoring primitives propagates through all DTOs

### Primitives vs Value Objects

**Mental model:** Primitives are the "Blueprint", VOs are the "Actual Door"

| Aspect       | Primitives (Shape)                                           | Value Objects (Behavior)                        |
| ------------ | ------------------------------------------------------------ | ----------------------------------------------- |
| Location     | `shared/`                                                    | `server/domain/value-objects/`                  |
| Purpose      | Communication & Validation                                   | Integrity & Logic                               |
| Used by      | Forms, Network, DTOs, Schemas                                | Use Cases, Entities                             |
| What it does | Defines structure, prevents slot mismatches                  | Enforces business rules, provides methods       |
| Example      | `ListNamePrimitive` prevents passing URL where name expected | `ListNameVO.isReserved()` checks business rules |

**Why both?**

- Primitives **travel** (Forms → Routers → DTOs → Network)
- VOs **think** (Use Cases → Entities → Domain Logic)

```typescript
// Router: Uses Primitive + Zod Schema for "Shape" validation
.input(createListSchema)
.mutation(({ input }) => {
  // Use Case: Wraps primitive in VO for "Behavior"
  const name = ListNameVO.create(input.name);

  // Now 'name' is a smart object, not just a string
  if (name.isReserved()) { throw new ReservedNameError(); }
})
```

---

## 4. Validation Architecture

The codebase uses a **Contract-Driven** validation architecture:

- **Domain types** are pure TypeScript (no Zod dependency in domain)
- **Zod schemas** live at Presentation edge, typed against Domain types
- **VOs** focus on business invariants, not structural validation
- **Logic functions** are shared for display/detection behavior (DRY)

```
┌─────────────────────────────────────────────────────────────────┐
│  CLIENT (Form) / PRESENTATION (tRPC Router)                     │
│    Uses Zod Schema for structural validation                    │
│    Schema typed as: z.ZodType<TraktClientIdPrimitive>           │
└───────────────────────────────┬─────────────────────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  APPLICATION (Use Case)                                         │
│    Receives type-safe primitives, creates VOs                   │
└───────────────────────────────┬─────────────────────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  DOMAIN (Value Object)                                          │
│    Business invariants only (reserved words, thresholds, etc.)  │
│    Pure TypeScript - NO Zod dependency                          │
└─────────────────────────────────────────────────────────────────┘
```

**Validation types:**

| Type                      | Where                          | Example                                                   |
| ------------------------- | ------------------------------ | --------------------------------------------------------- |
| Structural (Zod Schema)   | `shared/presentation/schemas/` | Is URL? Is 64 hex chars? Is positive number?              |
| Business Invariant (VO)   | `server/domain/value-objects/` | Is reserved username? Is below min threshold?             |
| Display/Detection (Logic) | `shared/domain/logic/`         | What's the display name? Which provider matches this URL? |

---

## 5. Value Object Pattern

VOs have two creation methods:

```typescript
// server/domain/value-objects/provider.vo.ts
import { InvalidProviderError } from 'shared/domain/errors/provider.errors';
import type { ProviderType } from 'shared/domain/types/provider.types';
import * as providerLogic from 'shared/domain/logic/provider.logic';

export class ProviderVO {
  private constructor(private readonly value: ProviderType) {}

  // Receives already-validated ProviderType from schema
  static create(value: ProviderType): ProviderVO {
    return new ProviderVO(value);
  }

  // For database hydration (validates untrusted string)
  static fromPersistence(value: string): ProviderVO {
    if (!providerLogic.isValidProvider(value)) {
      throw new InvalidProviderError(value);
    }
    return new ProviderVO(value);
  }

  getValue(): ProviderType {
    return this.value;
  }

  isTrakt(): boolean {
    return providerLogic.isTrakt(this.value);
  }

  getDisplayName(): string {
    return providerLogic.getProviderDisplayName(this.value);
  }
}
```

**Methods:**

| Method                           | Purpose                     | When Used                   |
| -------------------------------- | --------------------------- | --------------------------- |
| `static create(primitive)`       | Wrap already-validated data | Use Case receives from tRPC |
| `static fromPersistence(string)` | Validate + wrap DB data     | Repository hydration        |
| `getValue()`                     | Extract primitive           | Serialization, comparison   |

**Cross-Layer VO Usage:**

- Domain, Application, Infrastructure: ✅ Can use VOs
- Presentation/Client: ❌ Uses primitive types and logic functions only

---

## 6. Entity Pattern

```typescript
// server/domain/trakt-config.entity.ts
export class TraktConfig {
  private readonly _id: number;
  private _clientId: TraktClientId;
  private _updatedAt: Date;

  constructor(params: { id: number; clientId: TraktClientId }) {
    this._id = params.id;
    this._clientId = params.clientId;
  }

  static create(params: { userId: number; clientId: TraktClientId }): TraktConfig {
    return new TraktConfig({
      id: 0,
      clientId: params.clientId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  updateClientId(clientId: TraktClientId): void {
    this._clientId = clientId;
    this._updatedAt = new Date();
  }

  get id(): number {
    return this._id;
  }

  get clientId(): TraktClientId {
    return this._clientId;
  }
}
```

**When to use `static create()`:** Entity has default values, computed initial state, or creation-time business rules.

**When to use constructor alone:** All fields come from caller, no creation-time logic.

**New entity convention:** Unpersisted entities use `id: 0`.

- Entity `static create()` sets `id: 0`
- Repository `exists()` returns `false` for `id === 0` (shortcut, no DB query)
- Repository `save()` checks `exists()` → INSERT if false, UPDATE if true

---

## 7. Repository Pattern

### Interface (Application Layer)

```typescript
// server/application/repositories/media-list.repository.interface.ts
export interface IMediaListRepository {
  findById(id: number, userId: number): Promise<MediaList | null>;
  findAll(userId: number): Promise<MediaList[]>;
  save(entity: MediaList): Promise<MediaList>;
  delete(entity: MediaList): Promise<void>;
}
```

### Implementation (Infrastructure Layer)

```typescript
// server/infrastructure/repositories/media-list.repository.ts
private async exists(id: number, userId: number): Promise<boolean> {
  if (id === 0) return false;
  const [row] = await this.db
    .select({ id: table.id })
    .from(table)
    .where(and(eq(table.id, id), eq(table.userId, userId)))
    .limit(1);
  return !!row;
}

async save(entity: MediaList): Promise<MediaList> {
  const entityExists = await this.exists(entity.id, entity.userId);

  if (entityExists) {
    const [row] = await this.db
      .update(table)
      .set({
        name: entity.name.getValue(),
        provider: entity.provider.getValue(),
        updatedAt: entity.updatedAt,
      })
      .where(eq(table.id, entity.id))
      .returning();
    return this.toDomain(row);
  }

  const [row] = await this.db
    .insert(table)
    .values({
      userId: entity.userId,
      name: entity.name.getValue(),
      provider: entity.provider.getValue(),
    })
    .returning();
  return this.toDomain(row);
}

private toDomain(row: typeof table.$inferSelect): MediaList {
  return new MediaList({
    id: row.id,
    userId: row.userId,
    name: ListNameVO.fromPersistence(row.name),
    provider: ProviderVO.fromPersistence(row.provider),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}
```

**Infrastructure can:** Import Entities/VOs, call `VO.create()`, call Entity constructors, read via getters.

**Infrastructure cannot:** Call Entity mutation methods—only Application (Use Cases) orchestrates business logic.

### Singleton-per-User Variant

For entities where each user has exactly one record (e.g., `JellyseerrConfig`, `GeneralSettings`):

```typescript
private async exists(userId: number): Promise<boolean> {
  const [row] = await this.db
    .select({ id: table.id })
    .from(table)
    .where(eq(table.userId, userId))
    .limit(1);
  return !!row;
}
```

Uses `exists(userId)` instead of `exists(id, userId)` because the semantic is "does this user have a config?" not "does this specific entity exist?"

---

## 8. Use Case Pattern

```typescript
// server/application/use-cases/save-trakt-config.use-case.ts
export class SaveTraktConfigUseCase {
  constructor(private readonly repo: ITraktConfigRepository) {}

  async execute(command: SaveTraktConfigCommand): Promise<TraktConfigResponse> {
    const clientId = TraktClientId.create(command.clientId);
    const existing = await this.repo.findByUserId(command.userId);

    if (existing) {
      existing.updateClientId(clientId);
      const saved = await this.repo.save(existing);
      return TraktConfigMapper.toResponse(saved);
    }

    const newConfig = TraktConfig.create({ userId: command.userId, clientId });
    const saved = await this.repo.save(newConfig);
    return TraktConfigMapper.toResponse(saved);
  }
}
```

**Use Cases:** Coordinate business flow, handle authorization, orchestrate Entity mutations.

**Never:** Import concrete implementations, access database directly.

---

## 9. Data Flow

```
Client (Primitive) → Schema (validates) → DTO (ProviderType) → UseCase (VO.create()) → Entity (ProviderVO)
                                                                                              ↓
Database (string) ← Repository (entity.provider.getValue()) ← Entity (ProviderVO) ←──────────┘

Database (string) → Repository (VO.fromPersistence()) → Entity (ProviderVO) → Mapper.toDTO() → DTO → Client
```

- **Schema validates** structural correctness and produces typed primitives
- **Application** creates VOs via `VO.create(typedPrimitive)` - no validation needed
- **Infrastructure** creates VOs via `VO.fromPersistence(string)` - validates untrusted DB data
- Entity constructor always receives VOs, never primitives

---

## 10. Component Responsibilities

| Component                 | Layer          | Responsibility                | Dependencies                   |
| ------------------------- | -------------- | ----------------------------- | ------------------------------ |
| Use Case                  | Application    | Orchestrates business flow    | Interfaces only                |
| Repository Interface      | Application    | Defines persistence contract  | Domain Entities                |
| Service Interface         | Application    | Defines external I/O contract | Domain types/VOs               |
| Repository Implementation | Infrastructure | ORM/database mapping          | Application interfaces, Domain |
| Service Implementation    | Infrastructure | External APIs, I/O            | Application interfaces, Domain |

### Infrastructure Services Organization

```
infrastructure/services/
├── core/       # Base services (Logger, Scheduler, Encryption)
├── adapters/   # Interface implementations (use core/)
└── external/   # API clients (Jellyseerr, Trakt, etc.)
```

**Rule:** Adapters can import from `core/` ✅, core cannot import from `adapters/` ❌

---

## 11. Error Handling

- Define `DomainError` base class for Entities and Use Cases
- tRPC middleware translates `DomainError` → appropriate HTTP status
- Never expose raw database errors or stack traces

---

## 12. Client Architecture

**Stack:** React 19, TanStack Router, TanStack Query, tRPC Client, Radix UI, Tailwind CSS

### Folder Structure

```
packages/client/src/
├── components/
│   ├── ui/           # Radix UI primitives (Button, Dialog, Select, etc.)
│   ├── lists/        # Feature components (AddListDialog, ListsTable)
│   ├── dashboard/    # Dashboard feature components
│   └── layout/       # App layout (Navigation, AppLayout)
├── pages/            # Page components mapped to routes
├── routes/           # TanStack Router route definitions
├── hooks/            # Custom React hooks
├── lib/              # Utilities (trpc client, router, utils)
└── main.tsx          # App entry (providers)
```

### tRPC Client Usage

```typescript
// Query
const { data, isLoading } = trpc.lists.getAll.useQuery();

// Mutation with cache invalidation
const utils = trpc.useUtils();
const createMutation = trpc.lists.create.useMutation({
  onSuccess: () => {
    void utils.lists.getAll.invalidate();
    toast({ title: 'Success' });
  },
  onError: (error) => {
    toast({ title: 'Error', description: error.message, variant: 'destructive' });
  },
});

// Execute
createMutation.mutate({ name, url, provider });
```

### Component Types

| Type              | Location                | Purpose                    | Example         |
| ----------------- | ----------------------- | -------------------------- | --------------- |
| UI Primitive      | `components/ui/`        | Styled Radix wrappers      | `Button`        |
| Feature Component | `components/<feature>/` | Business logic + UI        | `AddListDialog` |
| Page Component    | `pages/`                | Route entry, orchestration | `ListsPage`     |

### Form Validation

Client uses shared Zod schemas for structural validation:

```typescript
import { listNameSchema } from 'shared/presentation/schemas/list.schema';

const handleSave = () => {
  const result = listNameSchema.safeParse(name);
  if (!result.success) {
    toast({ title: 'Error', description: result.error.issues[0]?.message });
    return;
  }
  createMutation.mutate({ name: result.data });
};
```

**Flow:** Form Input → Zod Schema → Validated Primitive → tRPC Mutation → Server VO

### State Management

| State Type   | Tool               | Example                                       |
| ------------ | ------------------ | --------------------------------------------- |
| Server State | tRPC + React-Query | `trpc.lists.getAll.useQuery()`                |
| Form State   | `useState`         | `const [name, setName] = useState('')`        |
| UI State     | `useState`         | `const [isOpen, setIsOpen] = useState(false)` |

No global state manager—React-Query handles caching and server state.

### Client Import Rules

| From Shared             | Allowed | Example                                            |
| ----------------------- | ------- | -------------------------------------------------- |
| `domain/types/`         | ✅      | `ProviderType`, `TraktChartTypeValues`             |
| `domain/logic/`         | ✅      | `getProviderDisplayName()`, `parseTraktChartUrl()` |
| `domain/errors/`        | ✅      | `InvalidProviderError`                             |
| `presentation/schemas/` | ✅      | `listNameSchema`, `traktClientIdSchema`            |
| `application/dtos/`     | ✅      | `SerializedMediaList`                              |
| `server/`               | ❌      | VOs live server-side only                          |

### Custom Hooks Pattern

```typescript
export function useListProcessor() {
  const [processingLists, setProcessingLists] = useState<Set<number>>(new Set());
  const utils = trpc.useUtils();

  const processMutation = trpc.processor.processList.useMutation({
    onSuccess: (_, variables) => {
      setProcessingLists((prev) => {
        prev.delete(variables.listId);
        return new Set(prev);
      });
      void utils.lists.getAll.invalidate();
    },
  });

  const handleProcess = (id: number) => {
    setProcessingLists((prev) => new Set(prev).add(id));
    processMutation.mutate({ listId: id, triggerType: 'manual' });
  };

  return { processingLists, handleProcess };
}
```
