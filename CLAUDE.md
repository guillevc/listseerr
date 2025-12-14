# CLAUDE.md

Architectural guide for the Server API using **Onion/Clean Architecture** and **DDD** principles.  
Stack: TypeScript, Bun, Hono, tRPC, Drizzle ORM, bun-sqlite, Croner.

---

## 1. Layer Architecture

### Layer Responsibilities

| Layer              | Responsibility                                      | Depends On          |
| ------------------ | --------------------------------------------------- | ------------------- |
| **Domain**         | Business rules, Entities, Value Objects             | Nothing             |
| **Application**    | Use Cases, Repository/Service Interfaces (Ports)    | Domain              |
| **Infrastructure** | Implements interfaces (Adapters), ORM, external I/O | Application, Domain |
| **Presentation**   | tRPC routers, request/response handling             | Application only    |
| **Bootstrap**      | DI wiring, startup, migrations                      | All layers          |

### Import Rules

| Layer          | Can Import From (Server) | Can Import From (Shared)                                               |
| -------------- | ------------------------ | ---------------------------------------------------------------------- |
| Domain         | Nothing                  | `shared/domain/`                                                       |
| Application    | Domain                   | `shared/domain/`, `shared/application/`                                |
| Infrastructure | Application, Domain      | `shared/domain/`, `shared/application/`                                |
| Presentation   | Application only         | `shared/application/`, `shared/domain/types/`, `shared/domain/errors/` |
| Bootstrap      | All layers               | All shared                                                             |

**Presentation access to shared/domain:**

- ✅ `shared/domain/types/` — Primitive constants, type aliases
- ✅ `shared/domain/errors/` — Error classes
- ❌ `shared/domain/value-objects/` — VO classes

### Layer Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│  PRESENTATION — Depends on Application, shared/domain/types/    │
└───────────────────────────────┬─────────────────────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  APPLICATION — Defines Use Cases, Repository/Service Interfaces │
└───────────────────────────────┬─────────────────────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  DOMAIN — Entities, VOs, Business Rules. Depends on nothing.    │
└─────────────────────────────────────────────────────────────────┘
                                ▲
┌───────────────────────────────┴─────────────────────────────────┐
│  INFRASTRUCTURE — Implements interfaces, handles persistence    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Patterns

### Naming Conventions

| Artifact          | Pattern                    | Location                        | Example                   |
| ----------------- | -------------------------- | ------------------------------- | ------------------------- |
| Runtime Constants | `<n>Values`                | `shared/domain/types/`          | `ProviderValues`          |
| Primitive Type    | `<n>Type`                  | `shared/domain/types/`          | `ProviderType`            |
| Value Object      | `<n>VO`                    | `shared/domain/value-objects/`  | `ProviderVO`              |
| Entity            | `<n>`                      | `server/domain/`                | `MediaList`               |
| Command DTO       | `<Action><Entity>Command`  | `shared/application/dtos/`      | `SaveTraktConfigCommand`  |
| Response DTO      | `<Action><Entity>Response` | `shared/application/dtos/`      | `SaveTraktConfigResponse` |
| Core DTO          | `<Entity>DTO`              | `shared/application/dtos/core/` | `MediaListDTO`            |

### Type-Safe Enum Pattern

```typescript
// shared/domain/types/provider.types.ts
export const ProviderValues = {
  TRAKT: 'trakt',
  MDBLIST: 'mdblist',
} as const;

export type ProviderType = (typeof ProviderValues)[keyof typeof ProviderValues];
```

### Value Object Pattern

```typescript
// shared/domain/value-objects/provider.vo.ts
export class ProviderVO {
  private constructor(private readonly value: ProviderType) {}

  static create(value: string): ProviderVO {
    if (!Object.values(ProviderValues).includes(value as ProviderType)) {
      throw new InvalidProviderError(value);
    }
    return new ProviderVO(value as ProviderType);
  }

  getValue(): ProviderType {
    return this.value;
  }
  isTrakt(): boolean {
    return this.value === ProviderValues.TRAKT;
  }
  equals(other: ProviderVO): boolean {
    return this.value === other.value;
  }
}
```

**Cross-Layer VO Usage:**

- Domain, Application, Infrastructure: ✅ Can use VOs
- Presentation: ❌ Uses primitive types only (`ProviderType`)

### Entity Pattern

```typescript
// server/domain/trakt-config.entity.ts
export class TraktConfig {
  private readonly _id: number;
  private _clientId: TraktClientId;
  private _updatedAt: Date;

  constructor(params: { id: number; clientId: TraktClientId /* ... */ }) {
    this._id = params.id;
    this._clientId = params.clientId;
  }

  // Factory for new entities with business rules
  static create(params: { userId: number; clientId: TraktClientId }): TraktConfig {
    return new TraktConfig({
      id: 0, // Set by repository
      clientId: params.clientId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // Mutation method
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

**Use `static create()` when:** Entity has default values, computed initial state, or creation-time business rules.  
**Use constructor alone when:** All fields come from caller, no creation-time logic.

**New Entity Convention:** Unpersisted entities use `id: 0`.

- Entity `static create()` sets `id: 0`
- Repository `exists()` returns `false` for `id === 0` (shortcut, no DB query)
- Repository `save()` checks `exists()` → INSERT if false, UPDATE if true

### Data Flow

```
Client (Primitive) → DTO (ProviderType) → Application (ProviderVO.create()) → Entity (ProviderVO)
                                                                                      ↓
Database (string) ← Repository (entity.provider.getValue()) ← Entity (ProviderVO) ←──┘

Database (string) → Repository (ProviderVO.create()) → Entity (ProviderVO) → Mapper.toDTO() → DTO → Client
```

Both Application and Infrastructure create VOs via `VO.create()`. Entity constructor always receives VOs, never primitives.

---

## 3. Repository Pattern

### Interface (Application Layer)

```typescript
export interface IMediaListRepository {
  findById(id: number, userId: number): Promise<MediaList | null>;
  findAll(userId: number): Promise<MediaList[]>;
  save(entity: MediaList): Promise<MediaList>;
  delete(entity: MediaList): Promise<void>;
  exists(id: number, userId: number): Promise<boolean>;
}
```

### Implementation (Infrastructure Layer)

```typescript
async exists(id: number, userId: number): Promise<boolean> {
  if (id === 0) return false;  // New entity shortcut
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
    name: ListName.create(row.name),        // Validates on hydration
    provider: ProviderVO.create(row.provider),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}
```

**Infrastructure can:** Import Entities/VOs, call `VO.create()`, call Entity constructors, read via getters.  
**Infrastructure cannot:** Call mutation methods (`entity.update()`), trigger business logic.

---

## 4. Use Case Pattern

```typescript
export class SaveTraktConfigUseCase {
  constructor(private readonly repo: ITraktConfigRepository) {}

  async execute(command: SaveTraktConfigCommand): Promise<TraktConfigResponse> {
    const clientId = TraktClientId.create(command.clientId);
    const existing = await this.repo.findByUserId(command.userId);

    if (existing) {
      existing.updateClientId(clientId); // Entity mutation
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

## 5. Component Responsibilities

| Component                     | Layer          | Responsibility                | Dependencies                   |
| ----------------------------- | -------------- | ----------------------------- | ------------------------------ |
| **Use Case**                  | Application    | Orchestrates business flow    | Interfaces only                |
| **Repository Interface**      | Application    | Defines persistence contract  | Domain Entities                |
| **Service Interface**         | Application    | Defines external I/O contract | Domain types/VOs               |
| **Repository Implementation** | Infrastructure | ORM/database mapping          | Application interfaces, Domain |
| **Service Implementation**    | Infrastructure | External APIs, I/O            | Application interfaces, Domain |

### Infrastructure Services Organization

```
infrastructure/services/
├── core/       # Base services (Logger, Scheduler, Encryption)
├── adapters/   # Interface implementations (use core/)
└── external/   # API clients (Jellyseerr, Trakt, etc.)
```

**Rule:** Adapters can import from `core/` ✅, core cannot import from `adapters/` ❌

---

## 6. Error Handling

- Define `DomainError` base class for Entities and Use Cases
- tRPC middleware translates `DomainError` → appropriate HTTP status
- Never expose raw database errors or stack traces

---

## 7. AI Agent Instructions

### CLAUDE.md Modification Policy

**Never modify CLAUDE.md without explicit user approval.**

When proposing changes:

1. Create `CLAUDE.draft.md` with proposed changes
2. Explain rationale
3. Wait for approval before integrating
