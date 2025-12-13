# CLAUDE.md

## Server Input for AI Coding Agent (TypeScript, Monorepo Structure)

This document provides a comprehensive and structured mandate for implementing the **Server API** using the **Onion Architecture** (or Clean Architecture) and **Domain-Driven Design (DDD)** principles, tailored for the high-performance stack: **TypeScript, Bun Runtime, Hono, tRPC, Drizzle ORM, bun-sqlite, and Croner**.

### 1\. 🎯 Architectural Mandate: Onion/Clean Structure and Monorepo Layout

The system adheres to the concentric layer model on the server and uses a peer-based monorepo structure where server, client, and shared code live side-by-side.

#### A. Inner Core Layers (Server)

| **Layer Name**     | **Responsibility**                                                                   | **Key Components**                                                                                                                       | **Dependency Rule**                      |
| ------------------ | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| **1. Domain**      | Defines Enterprise Business Rules and **Invariants**. **Source of Truth** for logic. | `user.entity.ts` (Entity), Value Objects (imported from `shared/`).                                                                      | **NO Dependencies on any other layer.**  |
| **2. Application** | Defines Use Cases and **Contracts** (Interfaces/Ports).                              | `createUser.usecase.ts` (Application Service), **`IUserRepository.ts`** (Repository Port), **DTO Interfaces** (imported from `shared/`). | Can only depend on the **Domain** layer. |

#### B. Outer Layers (Server)

| **Layer Name**          | **Responsibility**                                                     | **Key Components**                                                        | **Dependency Rule**                                                                                      |
| ----------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| **3. Infrastructure**   | Implements interfaces (Adapters). Handles concrete technology and I/O. | `sqlite-user.repository.ts` (using **Drizzle ORM**), `drizzle.client.ts`. | Depends on **Application** and **Domain** layers.                                                        |
| **4. Presentation/API** | Defines router factory functions. Pure presentation logic only.        | `routers/*.router.ts` (factory functions), `context.ts` (tRPC context).   | Depends on **Application** layer only. Can import from `shared/application/` and `shared/presentation/`. |

#### C. Composition Root (Bootstrap)

| **Component** | **Responsibility**                                           | **Key Components**                                                                    | **Dependency Rule**                                         |
| ------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| **Bootstrap** | Application startup, DI wiring, router assembly, migrations. | `di/`, `routers.ts`, `app.router.ts`, `database.ts`, `http-server.ts`, `scheduler.ts` | Can access **all layers** (wires concrete implementations). |

The Composition Root is **not a layer** in the Onion model - it's the one place where all layers meet to resolve Dependency Inversion by wiring concrete implementations to interfaces.

**Router Factory Pattern:**

- Presentation exports factory functions: `createListsRouter(container)`
- Bootstrap imports factories and builds routers with containers
- This inverts the dependency: Bootstrap depends on Presentation, not vice versa

#### D. Layer Dependency Matrix

| **Server Layer** | **Can Import From (Server)** | **Can Import From (Shared)**                  |
| ---------------- | ---------------------------- | --------------------------------------------- |
| Domain           | Nothing                      | `shared/domain/`                              |
| Application      | Domain                       | `shared/domain/`, `shared/application/`       |
| Infrastructure   | Application, Domain          | `shared/domain/`, `shared/application/`       |
| Presentation     | Application only             | `shared/application/`, `shared/presentation/` |
| Bootstrap        | All layers                   | All shared layers                             |

**Key Constraints:**

- Presentation **cannot** import from: `@/server/infrastructure/`, `@/server/bootstrap/`, `@/server/domain/`, `shared/domain/`
- Each layer defines its own dependency interfaces; concrete implementations are wired in Bootstrap

---

### 2\. 📝 Guiding Principles: Data Flow, DDD, and Repository Pattern

The architecture relies on strategic code sharing for UX gains and strict DTO compliance for architectural integrity.

#### A. Data Flow and DTO Naming

| **Flow Point**                                | **Object Type Used** | **Naming Convention**                          | **Rationale**                                                                                                                                                                    |
| --------------------------------------------- | -------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Input (tRPC $\rightarrow$ Use Case)**       | **Command DTO**      | `<UseCaseName>Command` or `<UseCaseName>Input` | Simple, serializable interface for incoming data.                                                                                                                                |
| **Core Data Structure**                       | **Core DTO**         | `<EntityName>DTO` (e.g., `MediaListDTO`)       | Defines the _atomic_ primitive structure of an entity for transport.                                                                                                             |
| **Output (Use Case $\rightarrow$ Router)**    | **Response DTO**     | **`<UseCaseName>Response`**                    | **CRITICAL:** Use Case returns this **Container DTO** (which wraps the Core DTO) to reflect the outcome. The Use Case unwraps VOs into primitives before packaging.              |
| **Router Return (tRPC $\rightarrow$ Client)** | **Response DTO**     | **`<UseCaseName>Response`**                    | **MANDATE: The router MUST return the full, wrapped Response DTO object. It MUST NOT destructure and return an unwrapped Core DTO (e.g., return `{ list }` instead of `list`).** |

#### B. Router Data Adaptation Policy

The primary goal is to push presentation logic to the client.

| **Action**            | **Instruction**                                                                      | **Boundary Rule**                                                                                                                                                              |
| --------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Direct DTO Return** | The tRPC router **must** return the `Response DTO` directly as the default action.   | Push all simple presentation logic (e.g., `if (status === 'pending') { return true }`) to the client.                                                                          |
| **View DTO Creation** | A separate **Presentation Mapper** and **View DTO** are only created for exceptions. | Required only for server-side concerns: **Localization**, **Security Filtering** (hiding fields based on user role), or **Highly Complex/Expensive Server-Only Calculations**. |

#### C. **Repository Pattern Mandate (Pure DDD)**

All repository interfaces and implementations must enforce Entity integrity.

| **Mandate**            | **Actionable Implementation**                                                                                                             | **Result**                                                                                                                                |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Entity Mutation**    | The Use Case must first load the Entity, call its mutation method (`user.changeName('new')`), and then pass the Entity to the Repository. | Preserves **Entity encapsulation**; ensures all domain logic runs before persistence.                                                     |
| **Repository Methods** | Repository interfaces (`IUserRepository`) must **NOT** expose `update(id, data)` methods.                                                 | Repositories must only expose `findById(id)`, `findAll()`, and a generic **`save(entity)`** method that handles both inserts and updates. |

#### D. The Strategic Sharing Mandate (TypeScript Monorepo)

| **Component**                    | **Shareable?**        | **Location**                   | **Rationale**                                                                                                                                                  |
| -------------------------------- | --------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Value Objects (VOs)**          | **YES** (Source Code) | **`src/shared/domain`**        | Provides the client with **authoritative, instant, local input validation** (UX gain).                                                                         |
| **Domain/Application Errors**    | **YES** (Source Code) | **`src/shared/domain/errors`** | Allows client to import error classes (`DomainError`, `NotFoundError`, etc.) for `instanceof` checks on tRPC responses, enabling user-friendly error messages. |
| **DTO Interfaces & Zod Schemas** | **YES** (Source Code) | **`src/shared/application`**   | Essential for **end-to-end type safety** with tRPC.                                                                                                            |
| **Entity Classes & Use Cases**   | **NO**                | `src/server/` only             | These are tied to the server's I/O, security, and transaction management. They must remain server-authoritative.                                               |

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
export type ProviderType = (typeof ProviderValues)[keyof typeof ProviderValues];
```

**Usage Guidelines:**

| **Component**         | **Usage**                                             | **Example**                           |
| --------------------- | ----------------------------------------------------- | ------------------------------------- |
| **Value Objects**     | Use the type for validation, constants for comparison | `if (value === ProviderValues.TRAKT)` |
| **DTOs**              | Use the type for interface properties                 | `provider: ProviderType`              |
| **Switch Statements** | Use constants in case clauses                         | `case ProviderValues.TRAKT:`          |
| **Error Messages**    | Use string interpolation with variables               | `` `Invalid provider: ${provider}` `` |

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
    return this.value === ProviderValues.TRAKT || this.value === ProviderValues.TRAKT_CHART;
  }
}
```

**Key Components:**

| **Component**             | **Purpose**                                                 | **Example**                                                    |
| ------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------- |
| **Private Constructor**   | Prevents direct instantiation, forces use of factory method | `private constructor(private readonly value: ProviderType) {}` |
| **Static Factory Method** | Validates input and constructs VO                           | `static create(value: string): Provider`                       |
| **Static Validation**     | Reusable validation logic                                   | `static isValid(value: string): boolean`                       |
| **Accessor Method**       | Unwraps primitive for DTOs and persistence                  | `getValue(): ProviderType`                                     |
| **Type Guards**           | Domain-specific boolean checks                              | `isTrakt(): boolean`, `isMdbList(): boolean`                   |
| **Equality Method**       | Value-based equality comparison                             | `equals(other: Provider): boolean`                             |
| **Domain Logic**          | Business rule methods                                       | `requiresUrlConversion(): boolean`                             |

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

---

### 3\. ⚙️ Operational Mandates and Error Handling

To ensure a robust, production-ready server, the following operational details must be implemented:

#### A. Environment and Configuration

Configuration must be loaded from environment variables using the Bun runtime's native capabilities.

| **File**            | **Instruction**                                                                                                      |
| ------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `drizzle.client.ts` | The connection must be initialized using the path defined in `process.env.DB_PATH`.                                  |
| `server.ts`         | The application must fail fast if essential variables (e.g., `process.env.PORT`, `process.env.DB_PATH`) are missing. |

#### B. Error Handling Strategy

Errors must be handled exclusively by translating Domain or Application errors into Presentation layer responses.

1.  **Domain/Application Errors:** Define a base error class (e.g., `DomainError`) to be used in Entities and Use Cases (e.g., `new DomainError('Email taken')`).
2.  **tRPC Translation:** The main tRPC error middleware must catch instances of `DomainError` and translate them into a suitable HTTP status (e.g., `409 Conflict` or `400 Bad Request`). **No raw database or stack trace errors should ever be sent in the tRPC response.**

#### C. Dependency Injection Composition Root

The `bootstrap/` directory acts as the Composition Root. All concrete dependency wiring must occur here, adhering to DIP.

| **File**      | **Definition**                                                                                                                                                                               |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bootstrap/*` | Define `Dependencies` objects or containers that hold all wired use cases and concrete repositories, ensuring the Use Cases receive interfaces (`IUserRepository`) and not concrete classes. |

```typescript
// Example DI Object Structure in bootstrap
interface Dependencies {
  userRepository: IUserRepository; // Concrete SqliteUserRepository instance
  createUserUseCase: CreateUserUseCase; // Instance injected with userRepository
  notificationService: INotificationService;
}
```

#### D. Roles of Core Architectural Components

This section strictly defines the responsibilities and dependencies of the Application and Infrastructure components, enforcing the Dependency Inversion Principle (DIP).

| **Component**                           | **Layer**          | **Responsibility**                                                                                                                                            | **Dependency Rule (Who it uses)**                                                                      |
| --------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **Use Case (Application Service)**      | **Application**    | Coordinates the entire business flow: handles **Authorization**, orchestrates **Domain Entity mutations**, and manages **Transactions**.                      | Uses **Interfaces (Ports)** for Repositories and Services. **Never** imports concrete implementations. |
| **Service Interface (Port)**            | **Application**    | A contract required by a Use Case for external I/O (e.g., `INotificationService`) or specialized Domain logic (e.g., `IDuplicationChecker`).                  | **NO Dependencies on any other layer.**                                                                |
| **Repository Interface (Port)**         | **Application**    | A contract required by a Use Case for fetching and persisting Entities (e.g., `IUserRepository`).                                                             | **NO Dependencies on any other layer.**                                                                |
| **Service Implementation (Adapter)**    | **Infrastructure** | Implements a **Service Interface**. Handles external I/O (e.g., fetch, API client), cross-cutting tasks (e.g., encryption), or scheduling.                    | Depends on the **Application** interface it implements and necessary external libraries.               |
| **Repository Implementation (Adapter)** | **Infrastructure** | Implements a **Repository Interface**. Handles **Database/ORM mapping** (e.g., Drizzle/SQL) to convert between the Entity (Domain) and the persistence layer. | Depends on **Drizzle ORM** (Infrastructure) and the **Domain Entity** it persists.                     |

#### E. Infrastructure Services Organization (Adapters vs Core)

Infrastructure services are organized into three subdirectories to clarify dependencies and responsibilities:

**Directory Structure:**

```
infrastructure/services/
├── adapters/           # Application interface implementations
├── core/              # Base infrastructure services
└── external/          # External API clients
```

**Key Distinction:** Both adapters and core services implement application interfaces, but they differ in their role within the infrastructure layer:

| **Aspect**       | **Core Services**                                                              | **Adapters**                                                                       |
| ---------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| **Purpose**      | Base infrastructure building blocks that other infrastructure layers depend on | Higher-level implementations that may use core services to fulfill their interface |
| **Dependencies** | Independent or depend only on external libraries                               | May depend on core services (not the other way around)                             |
| **Pattern**      | Often singletons or factory functions                                          | Instance-based implementations                                                     |
| **Usage**        | Imported BY adapters, use cases, and other infrastructure                      | Import FROM core services                                                          |
| **Examples**     | Logger, Scheduler, Encryption                                                  | Stats adapters, Media fetchers, Connection testers                                 |
| **Scope**        | Cross-cutting concerns used everywhere                                         | Domain-specific or feature-specific implementations                                |

**Dependency Direction:**

```
Application Layer (Interfaces)
        ▲
        │ implements
        │
    ┌───┴────┐
    │        │
  CORE    ADAPTERS
    ▲        │
    │        │
    └────────┘
     uses
```

**Core Services (`core/`):**

- `logger.service.ts` - Logging factory and service (used throughout infrastructure)
- `scheduler.service.ts` - Cron job management singleton (used by scheduler adapters)
- `aes-encryption.service.ts` - Encryption utility (used by repositories)

**Adapters (`adapters/`):**

- `jellyseerr-stats.adapter.ts` - Implements `IJellyseerrStatsService`, uses logger from core
- `scheduler-info.adapter.ts` - Implements `ISchedulerInfoService`, wraps scheduler from core
- `*-media-fetcher.adapter.ts` - Implement `IMediaFetcher`, use logger from core

**External Clients (`external/`):**

- API-specific client implementations (Jellyseerr, Trakt, MDBList, StevenLu)
- Used by adapters to communicate with external services
- May use logger from core for observability

**Critical Rule:** Adapters can import from `core/` ✅, but core must never import from `adapters/` ❌

---

### 4\. 🔧 Development Environment and Tooling

This project uses modern tooling to enforce code quality, consistency, and efficient development workflows.

#### A. Package Manager and Monorepo

| **Tool**                | **Version** | **Purpose**                                        | **Configuration**                                                                |
| ----------------------- | ----------- | -------------------------------------------------- | -------------------------------------------------------------------------------- |
| **Bun**                 | 1.3.4+      | Package manager, runtime, bundler, and test runner | `package.json` with workspace catalog for shared dependencies                    |
| **Workspace Structure** | N/A         | Monorepo with multiple packages                    | `packages/server`, `packages/client`, `packages/shared`, `packages/api-contract` |

**Key Features:**

- **Catalog Dependencies**: Shared version management across packages using `catalog:` references
- **Workspace Filtering**: Run commands per package using `bun run --filter <package> <script>`
- **Fast Installs**: Bun's native speed for dependency installation

#### B. Code Quality Tools

| **Tool**       | **Purpose**                  | **Configuration**                      | **Usage**           |
| -------------- | ---------------------------- | -------------------------------------- | ------------------- |
| **ESLint**     | Linting (code quality rules) | `eslint.config.js` (FlatConfig format) | `bun run lint`      |
| **Prettier**   | Formatting (code style)      | `.prettierrc`                          | `bun run format`    |
| **TypeScript** | Type checking                | Per-package `tsconfig.json`            | `bun run typecheck` |

**ESLint Configuration:**

- Uses ESLint 9.x with FlatConfig format
- Shared root config (`eslint.config.js`) automatically discovered by all packages
- Includes React hooks and React refresh plugins for client
- `eslint-config-prettier` disables formatting rules to avoid conflicts

**Prettier Configuration:**

- Single quotes (`singleQuote: true`)
- Semicolons (`semi: true`)
- 2-space indentation (`tabWidth: 2`)
- 100-character line length (`printWidth: 100`)
- ES5 trailing commas (`trailingComma: "es5"`)

**TypeScript Configuration:**

- Workspace version ~5.9.3
- Each package has its own `tsconfig.json`
- `tsc --noEmit` for type checking (no emit, build uses Bun/Vite)

#### C. Scripts Organization

**Root Package (`package.json`):**

```json
{
  "scripts": {
    "dev": "bun run --filter server dev & bun run --filter client dev",
    "build": "bun run --filter client build && bun run --filter server build",
    "lint": "bun run --filter '*' lint",
    "typecheck": "bun run --filter '*' typecheck",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "ci": "bun run lint && bun run format:check && bun run typecheck && bun run build"
  }
}
```

**Per-Package Scripts:**
Each package (`packages/*/package.json`) includes:

```json
{
  "scripts": {
    "lint": "eslint .",
    "typecheck": "tsc --noEmit"
  }
}
```

**Benefits:**

- Run checks on all packages: `bun run lint`
- Run checks on specific package: `bun run --filter server lint`
- CI runs all checks: `bun run ci`

#### D. Editor Configuration (VS Code / VSCodium)

**`.vscode/settings.json`:**

- Format on save with Prettier
- Auto-fix ESLint issues on save
- Use workspace TypeScript version

**`.vscode/extensions.json`:**

- Recommended extensions: `prettier.prettier-vscode`, `dbaeumer.vscode-eslint`

**Developer Experience:**

- Save file → Auto-format with Prettier → Auto-fix with ESLint
- No manual formatting needed
- Consistent style across team

#### E. Build and Bundling

| **Package** | **Tool**    | **Command**                                                                                 | **Output**               |
| ----------- | ----------- | ------------------------------------------------------------------------------------------- | ------------------------ |
| **Server**  | Bun bundler | `bun build src/index.ts --outdir ../../dist --target bun --production --minify --splitting` | `dist/index.js` + chunks |
| **Client**  | Vite        | `bunx --bun vite build --outDir ../../dist/client`                                          | `dist/client/`           |

**Server Build Features:**

- Minification (`--minify`)
- Code splitting (`--splitting`)
- Production mode (`--production`)
- Bun-optimized output (`--target bun`)

**Client Build Features:**

- React + TypeScript via Vite
- Tailwind CSS v4 via `@tailwindcss/vite`
- TanStack Router for routing
- tRPC for type-safe API calls

#### F. Docker Optimization

**Multi-stage Dockerfile:**

```dockerfile
# Stage 1: Builder
FROM oven/bun:1-alpine AS builder
# Install deps + build

# Stage 2: Production
FROM oven/bun:1-alpine
# Copy only dist/ and migrations/
# NO node_modules (bundled into dist/)
```

**Optimizations Applied:**

- Alpine base image (minimal size)
- Server bundled with all dependencies
- No `node_modules` in production image
- `pino-pretty` moved to devDependencies (not needed in prod)
- Final image: ~156MB (down from 500MB)

**Key Learnings:**

- Bundle server code to eliminate `node_modules` from production
- Use `--minify --splitting` for smaller bundles
- Move dev-only deps (pretty-loggers, etc.) to `devDependencies`
- Alpine images provide smallest footprint

#### G. CI/CD

**GitHub Actions (`.github/workflows/ci.yaml`):**

- Uses `oven-sh/setup-bun@v2` for native Bun support
- Runs `bun run ci` (lint + format:check + typecheck + build)
- Fast feedback on PRs

**Woodpecker CI (`.woodpecker.yaml`):**

- Self-hosted CI with unlimited build minutes
- Runs both CI checks AND Docker build
- Uses native `oven/bun:1-alpine` image for checks
- Uses `woodpeckerci/plugin-docker-buildx` for Docker builds

**CI Pipeline:**

1. Lint all packages
2. Check Prettier formatting
3. Type-check all packages
4. Build client and server
5. (Woodpecker only) Build Docker image

---

### 5\. 🛠️ Required Structure (Monorepo Layout)

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
│       ├── bootstrap/                   # Composition Root (can access all layers)
│       │   ├── di/                      # DI containers (wire infrastructure + application)
│       │   │   └── lists-container.ts   # Example: Creates repos, services, use cases
│       │   ├── routers.ts               # Builds all routers with their containers
│       │   ├── app.router.ts            # Assembles sub-routers into app router
│       │   ├── database.ts              # DB migrations
│       │   ├── http-server.ts           # Hono app setup, static files
│       │   └── scheduler.ts             # Scheduler initialization
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
│       ├── presentation/
│       │   └── trpc/
│       │       ├── context.ts           # 4. Presentation: tRPC context and router factory.
│       │       └── routers/             # 4. Presentation: Router factory functions (no instantiation).
│       │           └── lists.router.ts  # Exports createListsRouter(container)
│       └── index.ts                     # Entry point, calls bootstrap modules.
└── package.json
```

- run bun run format "path" on the files that we are modifying after we are done
- do not add unnecessary comments that are selfexplanatory reading variable names or simple logic
- avoid heading type comments like:

// ==================== Plugins ====================
plugins: [
react(),
tailwindcss(),

- feel free to modify CLAUDE.md with important decisions (design, build, etc) but do not include documentation about actual features, just stuff that is relevant to the code, style and architecture
- automatic changes to the CLAUDE.md file should be done into a CLAUDE.draft.md file instead, before i manually integrate them into the actual CLAUDE.md file
