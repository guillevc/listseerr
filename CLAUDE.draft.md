# Proposed CLAUDE.md Update - Decorator Pattern for Use Case Logging

**Location:** Add as new subsection after **3.D. Roles of Core Architectural Components**

---

## E. Use Case Decorator Pattern (Cross-Cutting Concerns)

The architecture uses the **Decorator Pattern** (Gang of Four) to add cross-cutting concerns (logging, timing, error tracking) to use cases without violating Clean Architecture principles.

### Pattern Structure

```
┌─────────────────────────────────────┐
│     Application Layer               │
│                                     │
│  IUseCase<TCommand, TResponse>      │  ← Generic interface
│         ▲                           │
│         │ implements                │
│         │                           │
│  Use Cases (pure business logic)    │  ← No logging code!
└─────────────────────────────────────┘
            ▲
            │ wraps
            │
┌───────────┴─────────────────────────┐
│     Infrastructure Layer            │
│                                     │
│  LoggingUseCaseDecorator            │  ← Adds logging
│    - implements IUseCase            │
│    - wraps any use case             │
│    - logs entry/exit/errors         │
│    - measures execution time        │
└─────────────────────────────────────┘
            ▲
            │ wired by
            │
┌───────────┴─────────────────────────┐
│     DI Containers                   │
│                                     │
│  Transparently wrap use cases       │
│  in decorator before exposing       │
└─────────────────────────────────────┘
```

### Implementation

#### 1. Use Case Interface (Application Layer)

**File:** `packages/server/src/application/use-cases/use-case.interface.ts`

```typescript
/**
 * Base interface for all use cases.
 * Enables decorator pattern for cross-cutting concerns.
 */
export interface IUseCase<TCommand, TResponse> {
  execute(command: TCommand): Promise<TResponse>;
}
```

**Purpose:** Defines contract that both use cases and decorators must implement.

#### 2. Use Case Implementation (Application Layer)

**Example:** `packages/server/src/application/use-cases/lists/create-media-list.usecase.ts`

```typescript
import type { IUseCase } from '../use-case.interface';
import type { CreateMediaListCommand } from 'shared/application/dtos/media-list/commands.dto';
import type { CreateMediaListResponse } from 'shared/application/dtos/media-list/responses.dto';

export class CreateMediaListUseCase
  implements IUseCase<CreateMediaListCommand, CreateMediaListResponse>
{
  constructor(private readonly mediaListRepository: IMediaListRepository) {}

  async execute(command: CreateMediaListCommand): Promise<CreateMediaListResponse> {
    // Pure business logic - no logging code
    const entity = MediaList.create({
      userId: command.userId,
      name: ListName.create(command.name),
      // ... other fields
    });

    await this.mediaListRepository.save(entity);
    return { list: entity.toDTO() };
  }
}
```

**Key Points:**
- Use case implements `IUseCase<TCommand, TResponse>`
- **No infrastructure dependencies** (no logger imports)
- Pure business logic only

#### 3. Logging Decorator (Infrastructure Layer)

**File:** `packages/server/src/infrastructure/services/core/decorators/logging-use-case.decorator.ts`

```typescript
import type { IUseCase } from '../../../../application/use-cases/use-case.interface';
import type { Logger } from 'pino';
import { createLogger } from '../logger.service';

/**
 * Decorator that adds logging to any use case.
 * Implements Gang of Four Decorator Pattern.
 */
export class LoggingUseCaseDecorator<TCommand, TResponse>
  implements IUseCase<TCommand, TResponse>
{
  private readonly logger: Logger;

  constructor(
    private readonly wrappedUseCase: IUseCase<TCommand, TResponse>,
    context: string
  ) {
    this.logger = createLogger(context);
  }

  async execute(command: TCommand): Promise<TResponse> {
    const startTime = Date.now();
    const useCaseName = this.wrappedUseCase.constructor.name;

    // Log entry with full command (structured logging)
    this.logger.debug({ useCaseName, command }, `Executing ${useCaseName}`);

    try {
      const result = await this.wrappedUseCase.execute(command);

      // Log success with timing
      const duration = Date.now() - startTime;
      this.logger.info(
        { useCaseName, duration },
        `Completed ${useCaseName} in ${duration}ms`
      );

      return result;
    } catch (error) {
      // Log error with timing and stack trace
      const duration = Date.now() - startTime;
      this.logger.error(
        {
          useCaseName,
          duration,
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        },
        `Failed ${useCaseName} after ${duration}ms`
      );

      throw error; // Re-throw to preserve error handling
    }
  }
}
```

**Key Points:**
- Implements same `IUseCase` interface as use cases
- Wraps any use case transparently
- Logs complete command objects (structured logging)
- Measures execution time
- Captures error stack traces
- Belongs in infrastructure layer (uses infrastructure services)

#### 4. DI Container Wiring (Presentation Layer)

**Example:** `packages/server/src/presentation/di/lists-container.ts`

```typescript
import { LoggingUseCaseDecorator } from '../../infrastructure/services/core/decorators/logging-use-case.decorator';
import type { IUseCase } from '../../application/use-cases/use-case.interface';
import type { CreateMediaListCommand } from 'shared/application/dtos/media-list/commands.dto';
import type { CreateMediaListResponse } from 'shared/application/dtos/media-list/responses.dto';

export class ListsContainer {
  // Type uses interface, not concrete class
  public readonly createMediaListUseCase: IUseCase<
    CreateMediaListCommand,
    CreateMediaListResponse
  >;

  constructor(db: BunSQLiteDatabase<typeof schema>) {
    // 1. Instantiate concrete use case
    const actualCreateMediaListUseCase = new CreateMediaListUseCase(
      this.mediaListRepository
    );

    // 2. Wrap in decorator (transparent to consumers)
    this.createMediaListUseCase = new LoggingUseCaseDecorator(
      actualCreateMediaListUseCase,
      'lists:create'
    );
  }
}
```

**Key Points:**
- Container property typed as `IUseCase<TCommand, TResponse>` (interface, not concrete class)
- Instantiate concrete use case with dependencies
- Wrap in decorator with appropriate logging context
- Router consumes the interface (doesn't know about decorator)

### Benefits

| **Benefit**                       | **Explanation**                                                                             |
| --------------------------------- | ------------------------------------------------------------------------------------------- |
| **Clean Architecture Compliance** | Use cases no longer depend on infrastructure (no logger imports)                            |
| **Separation of Concerns**        | Business logic separated from logging concerns                                              |
| **Consistent Logging**            | All use cases get same logging behavior automatically                                       |
| **Complete Information**          | Logs entire command objects (structured logging), execution time, and error stack traces    |
| **Easy to Test**                  | Test use cases without logging, test decorator separately                                   |
| **Composable**                    | Can add more decorators (validation, caching, metrics, etc.)                                |
| **Transparent**                   | Routers/controllers don't know about decorators (depend on `IUseCase` interface)            |

### Testing Strategy

```typescript
// Test use case in isolation (no decorator)
describe('CreateMediaListUseCase', () => {
  it('should create a media list', async () => {
    const mockRepository = createMockRepository();
    const useCase = new CreateMediaListUseCase(mockRepository);

    const result = await useCase.execute({
      userId: 1,
      name: 'Test List',
      // ...
    });

    expect(result.list.name).toBe('Test List');
    expect(mockRepository.save).toHaveBeenCalled();
  });
});

// Test decorator separately
describe('LoggingUseCaseDecorator', () => {
  it('should log entry and exit', async () => {
    const mockUseCase = { execute: jest.fn().mockResolvedValue({ success: true }) };
    const decorator = new LoggingUseCaseDecorator(mockUseCase, 'test');

    await decorator.execute({ test: 'data' });

    expect(mockUseCase.execute).toHaveBeenCalledWith({ test: 'data' });
    // Verify logs were written (using logger mock)
  });
});
```

### Adding New Use Cases

When creating a new use case:

1. **Define the interface (Application Layer):**
   ```typescript
   export class MyNewUseCase implements IUseCase<MyCommand, MyResponse> {
     async execute(command: MyCommand): Promise<MyResponse> {
       // Pure business logic only
     }
   }
   ```

2. **Wire in DI Container (Presentation Layer):**
   ```typescript
   // Type as interface
   public readonly myNewUseCase: IUseCase<MyCommand, MyResponse>;

   // Wrap in constructor
   const actualUseCase = new MyNewUseCase(...dependencies);
   this.myNewUseCase = new LoggingUseCaseDecorator(
     actualUseCase,
     'domain:action'  // Choose appropriate logging context
   );
   ```

3. **Consume in Router (Presentation Layer):**
   ```typescript
   myProcedure: publicProcedure
     .input(MyCommandSchema)
     .mutation(async ({ input, ctx }) => {
       // Use case already has logging
       return ctx.container.myNewUseCase.execute(input);
     }),
   ```

**That's it!** The decorator automatically adds:
- Entry logging (with full command)
- Exit logging (with execution time)
- Error logging (with stack traces)

### Extending with More Decorators

The decorator pattern is composable. You can add more decorators for other concerns:

```typescript
// Example: Validation decorator
export class ValidationUseCaseDecorator<TCommand, TResponse>
  implements IUseCase<TCommand, TResponse>
{
  constructor(
    private readonly wrappedUseCase: IUseCase<TCommand, TResponse>,
    private readonly schema: ZodSchema<TCommand>
  ) {}

  async execute(command: TCommand): Promise<TResponse> {
    const validated = this.schema.parse(command); // Throws if invalid
    return this.wrappedUseCase.execute(validated);
  }
}

// Compose decorators
const useCase = new LoggingUseCaseDecorator(
  new ValidationUseCaseDecorator(
    actualUseCase,
    commandSchema
  ),
  'domain:action'
);
```

**Order matters:** Outer decorators run first.
- Logging → Validation → Use Case (logs include validation)
- Validation → Logging → Use Case (logs exclude validation)

### Related Patterns

| **Pattern**             | **Purpose**                                      | **Used In**          |
| ----------------------- | ------------------------------------------------ | -------------------- |
| **Decorator**           | Add behavior to objects dynamically              | Use case logging     |
| **Dependency Injection** | Provide implementations to constructors          | All layers           |
| **Repository**          | Abstract data access                             | Infrastructure layer |
| **Strategy**            | Swap algorithms at runtime                       | Media fetchers       |

---

**Note for Integration:**
- This section should be added after section **3.D. Roles of Core Architectural Components** in CLAUDE.md
- All 25 use cases in the codebase already implement this pattern
- All 8 DI containers already wrap use cases in `LoggingUseCaseDecorator`
