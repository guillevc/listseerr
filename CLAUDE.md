# CLAUDE.md

## Server Input for AI Coding Agent (TypeScript, Monorepo Structure)

This document provides a comprehensive and structured mandate for implementing the **Server API** using the **Onion Architecture** (or Clean Architecture) and **Domain-Driven Design (DDD)** principles, tailored for the high-performance stack: **TypeScript, Bun Runtime, Hono, tRPC, Drizzle ORM, bun-sqlite, and Croner**.

### 1\. 🎯 Architectural Mandate: Onion/Clean Structure and Monorepo Layout

The system adheres to the concentric layer model on the server and uses a peer-based monorepo structure where server, client, and shared code live side-by-side. 

#### A. Inner Core Layers (Server)

|**Layer Name**|**Responsibility**|**Key Components**|**Dependency Rule**|
|---|---|---|---|
|**1. Domain**|Defines Enterprise Business Rules and **Invariants**. **Source of Truth** for logic.|`user.entity.ts` (Entity), Value Objects (imported from `shared/`).|**NO Dependencies on any other layer.**|
|**2. Application**|Defines Use Cases and **Contracts** (Interfaces/Ports).|`createUser.usecase.ts` (Application Service), **`IUserRepository.ts`** (Repository Port), **DTO Interfaces** (imported from `shared/`).|Can only depend on the **Domain** layer.|

#### B. Outer Layers (Server)

|**Layer Name**|**Responsibility**|**Key Components**|**Dependency Rule**|
|---|---|---|---|
|**3. Infrastructure**|Implements interfaces (Adapters). Handles concrete technology and I/O.|`sqlite-user.repository.ts` (using **Drizzle ORM**), `drizzle.client.ts`.|Depends on **Application** and **Domain** layers.|
|**4. Presentation/API**|External entry point, system wiring, **Data Adaptation**.|**`app.router.ts`** (**tRPC** router), `server.ts` (Bun startup and DI Composition Root).|Depends on **Application** and **Infrastructure**.|

-----

### 2\. 📝 Guiding Principles: Data Flow, DDD, and Repository Pattern

The architecture relies on strategic code sharing for UX gains and strict DTO compliance for architectural integrity.

#### A. Data Flow and DTO Naming

|**Flow Point**|**Object Type Used**|**Naming Convention**|**Rationale**|
|---|---|---|---|
|**Input (tRPC $\rightarrow$ Use Case)**|**Command DTO**|`<UseCaseName>Command` or `<UseCaseName>Input`|Simple, serializable interface for incoming data.|
|**Core Data Structure**|**Core DTO**|`<EntityName>DTO` (e.g., `MediaListDTO`)|Defines the *atomic* primitive structure of an entity for transport.|
|**Output (Use Case $\rightarrow$ Router)**|**Response DTO**|**`<UseCaseName>Response`**|**CRITICAL:** Use Case returns this **Container DTO** (which wraps the Core DTO) to reflect the outcome. The Use Case unwraps VOs into primitives before packaging.|
|**Router Return (tRPC $\rightarrow$ Client)**|**Response DTO**|**`<UseCaseName>Response`**|**MANDATE: The router MUST return the full, wrapped Response DTO object. It MUST NOT destructure and return an unwrapped Core DTO (e.g., return `{ list }` instead of `list`).**|

#### B. Router Data Adaptation Policy

The primary goal is to push presentation logic to the client.

|**Action**|**Instruction**|**Boundary Rule**|
|---|---|---|
|**Direct DTO Return**|The tRPC router **must** return the `Response DTO` directly as the default action.|Push all simple presentation logic (e.g., `if (status === 'pending') { return true }`) to the client.|
|**View DTO Creation**|A separate **Presentation Mapper** and **View DTO** are only created for exceptions.|Required only for server-side concerns: **Localization**, **Security Filtering** (hiding fields based on user role), or **Highly Complex/Expensive Server-Only Calculations**.|

#### C. **Repository Pattern Mandate (Pure DDD)**

All repository interfaces and implementations must enforce Entity integrity.

|**Mandate**|**Actionable Implementation**|**Result**|
|---|---|---|
|**Entity Mutation**|The Use Case must first load the Entity, call its mutation method (`user.changeName('new')`), and then pass the Entity to the Repository.|Preserves **Entity encapsulation**; ensures all domain logic runs before persistence.|
|**Repository Methods**|Repository interfaces (`IUserRepository`) must **NOT** expose `update(id, data)` methods.|Repositories must only expose `findById(id)`, `findAll()`, and a generic **`save(entity)`** method that handles both inserts and updates.|

#### D. The Strategic Sharing Mandate (TypeScript Monorepo)

|**Component**|**Shareable?**|**Location**|**Rationale**|
|---|---|---|---|
|**Value Objects (VOs)**|**YES** (Source Code)|**`src/shared/domain`**|Provides the client with **authoritative, instant, local input validation** (UX gain).|
|**Domain/Application Errors**|**YES** (Source Code)|**`src/shared/domain/errors`**|Allows client to import error classes (`DomainError`, `NotFoundError`, etc.) for `instanceof` checks on tRPC responses, enabling user-friendly error messages.|
|**DTO Interfaces & Zod Schemas**|**YES** (Source Code)|**`src/shared/application`**|Essential for **end-to-end type safety** with tRPC.|
|**Entity Classes & Use Cases**|**NO**|`src/server/` only|These are tied to the server's I/O, security, and transaction management. They must remain server-authoritative.|

#### E. Type-Safe Enum Pattern (Runtime Constants + Derived Types)

To achieve type safety while maintaining runtime constants that can be shared between client and server, use the following pattern:

**Pattern Structure:**

```typescript
/**
 * Runtime constants for identification.
 * Provides named constants instead of magic strings.
 *
 * Benefits:
 * - IDE autocomplete for values
 * - Single source of truth
 * - Refactoring-safe
 */
export const ProviderValues = {
  TRAKT: 'trakt',
  MDBLIST: 'mdblist',
  TRAKT_CHART: 'traktChart',
  STEVENLU: 'stevenlu',
} as const;

/**
 * Union type derived from runtime constants.
 * Automatically stays in sync with ProviderValues.
 *
 * Type is inferred as: 'trakt' | 'mdblist' | 'traktChart' | 'stevenlu'
 */
export type ProviderType = typeof ProviderValues[keyof typeof ProviderValues];
```

**Usage Guidelines:**

|**Component**|**Usage**|**Example**|
|---|---|---|
|**Value Objects**|Use the type for validation, constants for comparison|`if (value === ProviderValues.TRAKT)`|
|**DTOs**|Use the type for interface properties|`provider: ProviderType`|
|**Switch Statements**|Use constants in case clauses|`case ProviderValues.TRAKT:`|
|**Error Messages**|Use string interpolation with variables|`` `Invalid provider: ${provider}` ``|

**Key Benefits:**

1. **Type Safety:** TypeScript enforces that only valid values are used
2. **Runtime Constants:** Actual string values available for runtime comparisons
3. **Automatic Synchronization:** Adding a new value updates both the constants object and the derived type
4. **Shared Across Layers:** Both client and server can import from `shared/domain/types`
5. **Refactoring Support:** Renaming a constant updates all usages via IDE refactoring

**Location:** `src/shared/domain/types/<domain>.types.ts`

#### F. Value Object Pattern (Encapsulation with Validation)

Value Objects encapsulate primitive types and enforce domain invariants. They provide type safety, validation, and domain-specific behavior.

**Pattern Structure:**

```typescript
import type { ProviderType } from '../types/provider.types';
import { ProviderValues } from '../types/provider.types';
import { InvalidProviderError } from '../errors/provider.errors';

/**
 * Provider Value Object
 *
 * Encapsulates and validates provider type.
 * Provides domain-specific operations and type guards.
 */
export class Provider {
  // 1. Private constructor - prevents invalid instantiation
  private constructor(private readonly value: ProviderType) {}

  // 2. Static factory method - validates before construction
  static create(value: string): Provider {
    if (!this.isValid(value)) {
      throw new InvalidProviderError(value);
    }
    return new Provider(value as ProviderType);
  }

  // 3. Validation method - reusable validation logic
  static isValid(value: string): boolean {
    return Object.values(ProviderValues).includes(value as ProviderType);
  }

  // 4. Accessor method - unwraps primitive for serialization
  getValue(): ProviderType {
    return this.value;
  }

  // 5. Type guard helpers - domain-specific boolean checks
  isTrakt(): boolean {
    return this.value === ProviderValues.TRAKT;
  }

  isMdbList(): boolean {
    return this.value === ProviderValues.MDBLIST;
  }

  // 6. Equality comparison - value-based equality
  equals(other: Provider): boolean {
    return this.value === other.value;
  }

  // 7. Domain logic methods - encapsulate business rules
  requiresUrlConversion(): boolean {
    return this.value === ProviderValues.TRAKT ||
           this.value === ProviderValues.TRAKT_CHART;
  }
}
```

**Key Components:**

|**Component**|**Purpose**|**Example**|
|---|---|---|
|**Private Constructor**|Prevents direct instantiation, forces use of factory method|`private constructor(private readonly value: ProviderType) {}`|
|**Static Factory Method**|Validates input and constructs VO|`static create(value: string): Provider`|
|**Static Validation**|Reusable validation logic|`static isValid(value: string): boolean`|
|**Accessor Method**|Unwraps primitive for DTOs and persistence|`getValue(): ProviderType`|
|**Type Guards**|Domain-specific boolean checks|`isTrakt(): boolean`, `isMdbList(): boolean`|
|**Equality Method**|Value-based equality comparison|`equals(other: Provider): boolean`|
|**Domain Logic**|Business rule methods|`requiresUrlConversion(): boolean`|

**Usage in Different Layers:**

```typescript
// ❌ BAD: DTOs should use primitives, not VOs
export interface MediaListDTO {
  provider: Provider; // WRONG - not serializable
}

// ✅ GOOD: DTOs use primitive types
export interface MediaListDTO {
  provider: ProviderType; // Primitive string union type
}

// ✅ GOOD: Entities encapsulate primitives in VOs
export class MediaList {
  private readonly _provider: Provider; // VO for validation and behavior

  constructor(params: { provider: ProviderType }) {
    this._provider = Provider.create(params.provider); // Convert primitive to VO
  }

  get provider(): Provider {
    return this._provider;
  }

  toDTO(): MediaListDTO {
    return {
      provider: this._provider.getValue(), // Unwrap VO to primitive for DTO
    };
  }
}

// ✅ GOOD: Use Cases convert DTO primitives to VOs
export class CreateMediaListUseCase {
  async execute(command: CreateMediaListCommand): Promise<CreateMediaListResponse> {
    // Convert primitive from DTO to VO for validation
    const provider = Provider.create(command.provider);

    // Use VO methods for domain logic
    if (provider.requiresUrlConversion()) {
      // ... handle URL conversion
    }
  }
}
```

**Data Flow Pattern:**

```
Client (Primitive)
  → DTO (Primitive: ProviderType)
    → Use Case (converts to VO: Provider.create())
      → Entity (stores VO: Provider)
        → Repository (converts to primitive: provider.getValue())
          → Database (Primitive: string)

Database (Primitive: string)
  → Repository (converts to VO: Provider.create())
    → Entity (stores VO: Provider)
      → Use Case (VO operations)
        → DTO (converts to primitive: provider.getValue())
          → Client (Primitive)
```

**Key Benefits:**

1. **Validation at Boundaries:** Invalid values rejected immediately at VO creation
2. **Type Safety:** TypeScript enforces that only valid VOs are used in domain layer
3. **Encapsulation:** Business logic lives with the data it operates on
4. **Immutability:** `readonly` ensures VOs can't be changed after creation
5. **Shareability:** VOs in `shared/domain` can be used by both client and server for validation
6. **Self-Documenting:** Type guards and domain methods express business rules clearly

**Location:** `src/shared/domain/value-objects/<name>.value-object.ts`

-----

### 3\. ⚙️ Operational Mandates and Error Handling

To ensure a robust, production-ready server, the following operational details must be implemented:

#### A. Environment and Configuration

Configuration must be loaded from environment variables using the Bun runtime's native capabilities.

|**File**|**Instruction**|
|---|---|
|`drizzle.client.ts`|The connection must be initialized using the path defined in `process.env.DB_PATH`.|
|`server.ts`|The application must fail fast if essential variables (e.g., `process.env.PORT`, `process.env.DB_PATH`) are missing.|

#### B. Error Handling Strategy

Errors must be handled exclusively by translating Domain or Application errors into Presentation layer responses.

1.  **Domain/Application Errors:** Define a base error class (e.g., `DomainError`) to be used in Entities and Use Cases (e.g., `new DomainError('Email taken')`).
2.  **tRPC Translation:** The main tRPC error middleware must catch instances of `DomainError` and translate them into a suitable HTTP status (e.g., `409 Conflict` or `400 Bad Request`). **No raw database or stack trace errors should ever be sent in the tRPC response.**

#### C. Dependency Injection Composition Root

The `server.ts` file acts as the Composition Root. All concrete dependency wiring must occur here, adhering to DIP.

|**File**|**Definition**|
|---|---|
|`server.ts`|Define a `Dependencies` object or container that holds all wired use cases and concrete repositories, ensuring the Use Cases receive interfaces (`IUserRepository`) and not concrete classes.|

```typescript
// Example DI Object Structure in server.ts
interface Dependencies {
  userRepository: IUserRepository; // Concrete SqliteUserRepository instance
  createUserUseCase: CreateUserUseCase; // Instance injected with userRepository
  notificationService: INotificationService;
}
```

#### D. Roles of Core Architectural Components

This section strictly defines the responsibilities and dependencies of the Application and Infrastructure components, enforcing the Dependency Inversion Principle (DIP).

|**Component**|**Layer**|**Responsibility**|**Dependency Rule (Who it uses)**|
|---|---|---|---|
|**Use Case (Application Service)**|**Application**|Coordinates the entire business flow: handles **Authorization**, orchestrates **Domain Entity mutations**, and manages **Transactions**.|Uses **Interfaces (Ports)** for Repositories and Services. **Never** imports concrete implementations.|
|**Service Interface (Port)**|**Application**|A contract required by a Use Case for external I/O (e.g., `INotificationService`) or specialized Domain logic (e.g., `IDuplicationChecker`).|**NO Dependencies on any other layer.**|
|**Repository Interface (Port)**|**Application**|A contract required by a Use Case for fetching and persisting Entities (e.g., `IUserRepository`).|**NO Dependencies on any other layer.**|
|**Service Implementation (Adapter)**|**Infrastructure**|Implements a **Service Interface**. Handles external I/O (e.g., fetch, API client), cross-cutting tasks (e.g., encryption), or scheduling.|Depends on the **Application** interface it implements and necessary external libraries.|
|**Repository Implementation (Adapter)**|**Infrastructure**|Implements a **Repository Interface**. Handles **Database/ORM mapping** (e.g., Drizzle/SQL) to convert between the Entity (Domain) and the persistence layer.|Depends on **Drizzle ORM** (Infrastructure) and the **Domain Entity** it persists.|

-----

### 4\. 🛠️ Required Structure (Monorepo Layout)

```bash
/project-root
├── src/
│   ├── client/                          # Frontend Application (e.g., React/tRPC client)
│   │   └── src/                         # Client-side code (views, hooks)
│   │
│   ├── shared/
│   │   ├── domain/
│   │   │   ├── errors/                  # Location for sharable Domain/Application Error classes.
│   │   │   └── email.value-object.ts    # SHARED: Example Value Object (pure logic)
│   │   └── application/
│   │       └── dtos/
│   │           └── create-user.dto.ts   # SHARED: Defines Command/Response interfaces & Zod Schemas.
│   │
│   └── server/
│       ├── domain/
│       │   └── user.entity.ts           # 1. Domain: Defines the User Entity, imports VO from shared.
│       ├── application/
│       │   ├── repositories/
│       │   │   └── IUserRepository.ts     # 2. Application: Repository Port. (Methods: findById, save)
│       │   ├── use-cases/
│       │   │   └── create-user.usecase.ts # 2. Application: Use case logic.
│       │   └── services/
│       │       └── notification.interface.ts # 2. Application: Service Port.
│       ├── infrastructure/
│       │   ├── db/
│       │   │   ├── drizzle.client.ts        # 3. Infrastructure: DB connection.
│       │   │   └── user.schema.ts
│       │   ├── repositories/
│       │   │   └── sqlite-user.repository.ts # 3. Infrastructure: Implements IUserRepository using Drizzle.
│       │   └── scheduling/
│       │       └── cron-job.service.ts       # 3. Infrastructure: Implements ISchedulerService.
│       └── presentation/
│           ├── trpc/
│           │   └── app.router.ts        # 4. Presentation: tRPC router, calls Use Cases.
│           └── server.ts                # 4. Presentation: Bun startup, Hono/DI Composition Root.
└── package.json
```
