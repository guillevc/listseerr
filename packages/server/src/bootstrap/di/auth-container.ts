import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import * as schema from '@/server/infrastructure/db/schema';

// Infrastructure layer
import { DrizzleUserRepository } from '@/server/infrastructure/repositories/drizzle-user.repository';
import { DrizzleSessionRepository } from '@/server/infrastructure/repositories/drizzle-session.repository';
import { BunPasswordService } from '@/server/infrastructure/services/core/bun-password.adapter';
import { LoggingUseCaseDecorator } from '@/server/infrastructure/services/core/logging-usecase.decorator';
import { LoggerService } from '@/server/infrastructure/services/core/logger.adapter';
import { schedulerService } from '@/server/infrastructure/services/core/scheduler.adapter';

// Application layer - Interfaces
import type { IGeneralSettingsRepository } from '@/server/application/repositories/general-settings.repository.interface';

// Application layer - Use cases
import { CheckSetupStatusUseCase } from '@/server/application/use-cases/auth/check-setup-status.usecase';
import { RegisterUserUseCase } from '@/server/application/use-cases/auth/register-user.usecase';
import { LoginUserUseCase } from '@/server/application/use-cases/auth/login-user.usecase';
import { ValidateSessionUseCase } from '@/server/application/use-cases/auth/validate-session.usecase';
import { LogoutSessionUseCase } from '@/server/application/use-cases/auth/logout-session.usecase';
import { UpdateUserCredentialsUseCase } from '@/server/application/use-cases/auth/update-user-credentials.usecase';
import type { IUseCase } from '@/server/application/use-cases/use-case.interface';
import type {
  RegisterUserCommand,
  LoginUserCommand,
  ValidateSessionCommand,
  LogoutSessionCommand,
  UpdateUserCredentialsCommand,
} from 'shared/application/dtos';
import type {
  CheckSetupStatusResponse,
  RegisterUserResponse,
  LoginUserResponse,
  ValidateSessionResponse,
  LogoutSessionResponse,
  UpdateUserCredentialsResponse,
} from 'shared/application/dtos';

/**
 * Dependency Injection Container for Authentication Domain
 *
 * Wires together all layers following Clean Architecture:
 * - Infrastructure: Concrete implementations (repositories, services)
 * - Application: Use cases with injected dependencies
 * - Presentation: tRPC routers that consume use cases
 *
 * This container implements the Dependency Inversion Principle:
 * Use cases depend on interfaces, this container provides concrete implementations.
 */
export class AuthContainer {
  // Infrastructure - Repositories
  private readonly userRepository: DrizzleUserRepository;
  private readonly sessionRepository: DrizzleSessionRepository;

  // Infrastructure - Services
  private readonly passwordService: BunPasswordService;
  private readonly logger: LoggerService;

  // Application - Use Cases (public for consumption by routers)
  public readonly checkSetupStatusUseCase: IUseCase<void, CheckSetupStatusResponse>;
  public readonly registerUserUseCase: IUseCase<RegisterUserCommand, RegisterUserResponse>;
  public readonly loginUserUseCase: IUseCase<LoginUserCommand, LoginUserResponse>;
  public readonly validateSessionUseCase: IUseCase<ValidateSessionCommand, ValidateSessionResponse>;
  public readonly logoutSessionUseCase: IUseCase<LogoutSessionCommand, LogoutSessionResponse>;
  public readonly updateUserCredentialsUseCase: IUseCase<
    UpdateUserCredentialsCommand,
    UpdateUserCredentialsResponse
  >;

  constructor(
    db: BunSQLiteDatabase<typeof schema>,
    generalSettingsRepository: IGeneralSettingsRepository
  ) {
    // 1. Instantiate infrastructure layer (adapters)
    this.userRepository = new DrizzleUserRepository(db);
    this.sessionRepository = new DrizzleSessionRepository(db);
    this.passwordService = new BunPasswordService();
    this.logger = new LoggerService('auth');

    // 2. Instantiate use cases wrapped with logging decorator
    this.checkSetupStatusUseCase = new LoggingUseCaseDecorator(
      new CheckSetupStatusUseCase(this.userRepository),
      this.logger,
      'CheckSetupStatusUseCase'
    );

    this.registerUserUseCase = new LoggingUseCaseDecorator(
      new RegisterUserUseCase(
        this.userRepository,
        this.sessionRepository,
        generalSettingsRepository,
        schedulerService,
        this.passwordService,
        this.logger
      ),
      this.logger,
      'RegisterUserUseCase'
    );

    this.loginUserUseCase = new LoggingUseCaseDecorator(
      new LoginUserUseCase(
        this.userRepository,
        this.sessionRepository,
        this.passwordService,
        this.logger
      ),
      this.logger,
      'LoginUserUseCase'
    );

    this.validateSessionUseCase = new LoggingUseCaseDecorator(
      new ValidateSessionUseCase(this.sessionRepository, this.userRepository),
      this.logger,
      'ValidateSessionUseCase'
    );

    this.logoutSessionUseCase = new LoggingUseCaseDecorator(
      new LogoutSessionUseCase(this.sessionRepository, this.logger),
      this.logger,
      'LogoutSessionUseCase'
    );

    this.updateUserCredentialsUseCase = new LoggingUseCaseDecorator(
      new UpdateUserCredentialsUseCase(this.userRepository, this.passwordService, this.logger),
      this.logger,
      'UpdateUserCredentialsUseCase'
    );
  }
}
