import type { IUserRepository } from '@/server/application/repositories/user.repository.interface';
import type { ISessionRepository } from '@/server/application/repositories/session.repository.interface';
import type { IPasswordService } from '@/server/application/services/core/password.service.interface';
import type { ILogger } from '@/server/application/services/core/logger.interface';
import { User } from '@/server/domain/entities/user.entity';
import { Session } from '@/server/domain/entities/session.entity';
import { UsernameVO } from '@/server/domain/value-objects/username.vo';
import { PasswordVO } from '@/server/domain/value-objects/password.vo';
import { UserMapper } from '@/server/application/mappers/user.mapper';
import type { RegisterUserCommand } from 'shared/application/dtos/auth/commands.dto';
import type { RegisterUserResponse } from 'shared/application/dtos/auth/responses.dto';
import type { IUseCase } from '@/server/application/use-cases/use-case.interface';
import {
  UserAlreadyExistsError,
  RegistrationDisabledError,
} from 'shared/domain/errors/auth.errors';

/**
 * Register User Use Case
 *
 * Creates a new user and auto-logs them in with a session.
 * Returns the user and session token.
 */
export class RegisterUserUseCase implements IUseCase<RegisterUserCommand, RegisterUserResponse> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly sessionRepository: ISessionRepository,
    private readonly passwordService: IPasswordService,
    private readonly logger: ILogger
  ) {}

  async execute(command: RegisterUserCommand): Promise<RegisterUserResponse> {
    // 1. Check if registration is allowed (first user only)
    const userCount = await this.userRepository.count();
    if (userCount > 0) {
      throw new RegistrationDisabledError();
    }

    // 2. Validate input with VOs (structural validation already done by schema)
    const username = UsernameVO.create(command.username);
    const password = PasswordVO.create(command.password); // Transient validation only

    // 3. Check if user already exists (belt and suspenders)
    const existingUser = await this.userRepository.findByUsername(username.getValue());
    if (existingUser) {
      throw new UserAlreadyExistsError(username.getValue());
    }

    // 4. Hash the password
    const passwordHash = await this.passwordService.hash(password.getValue());

    // 5. Create user entity
    const user = User.create({
      username,
      passwordHash,
    });

    // 6. Save user
    const savedUser = await this.userRepository.save(user);

    // 7. Create session (auto-login) - remember me defaults to true for new registrations
    const session = Session.create({
      userId: savedUser.id,
      rememberMe: true,
    });

    // 8. Save session
    const savedSession = await this.sessionRepository.save(session);

    // 9. Log registration
    this.logger.info(
      {
        userId: savedUser.id,
        username: savedUser.username.getValue(),
      },
      'User registered'
    );

    // 10. Return response
    return {
      user: UserMapper.toDTO(savedUser),
      token: savedSession.token.getValue(),
    };
  }
}
