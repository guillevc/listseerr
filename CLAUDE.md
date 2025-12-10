
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
|**Output (Use Case $\rightarrow$ Router)**|**Response DTO**|**`<UseCaseName>Response`**|**CRITICAL:** Use Case returns a DTO that reflects the outcome. The Use Case **unwraps VOs into primitives** before packaging the Response DTO.|

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
|**DTO Interfaces & Zod Schemas**|**YES** (Source Code)|**`src/shared/application`**|Essential for **end-to-end type safety** with tRPC.|
|**Entity Classes & Use Cases**|**NO**|`src/server/` only|These are tied to the server's I/O, security, and transaction management. They must remain server-authoritative.|

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

-----

### 4\. 🛠️ Implementation Task: Required Structure (Monorepo Layout)

The following structure reflects the final, required monorepo layout:

```bash
/project-root
├── src/
│   ├── client/                          # Frontend Application (e.g., React/tRPC client)
│   │   └── src/                         # Client-side code (views, hooks)
│   │
│   ├── shared/
│   │   ├── domain/
│   │   │   └── email.value-object.ts    # SHARED: EmailAddress VO class (pure logic)
│   │   └── application/
│   │       └── dtos/
│   │           └── create-user.dto.ts   # SHARED: Defines CreateUserCommand/Response interfaces.
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
│       │       └── notification.interface.ts
│       ├── infrastructure/
│       │   ├── db/
│       │   │   ├── drizzle.client.ts        # 3. Infrastructure: DB connection.
│       │   │   └── user.schema.ts
│       │   ├── repositories/
│       │   │   └── sqlite-user.repository.ts # 3. Infrastructure: Implements IUserRepository using Drizzle.
│       │   └── scheduling/
│       │       └── cron-job.service.ts
│       └── presentation/
│           ├── trpc/
│           │   └── app.router.ts        # 4. Presentation: tRPC router, calls Use Cases.
│           └── server.ts                # 4. Presentation: Bun startup, Hono/DI Composition Root.
└── package.json
```
