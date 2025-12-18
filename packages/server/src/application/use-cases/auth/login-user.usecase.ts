import type { IUserRepository } from '@/server/application/repositories/user.repository.interface';
import type { ISessionRepository } from '@/server/application/repositories/session.repository.interface';
import type { IPasswordService } from '@/server/application/services/core/password.service.interface';
import type { ILogger } from '@/server/application/services/core/logger.interface';
import { Session } from '@/server/domain/entities/session.entity';
import { UserMapper } from '@/server/application/mappers/user.mapper';
import type { LoginUserCommand } from 'shared/application/dtos/auth/commands.dto';
import type { LoginUserResponse } from 'shared/application/dtos/auth/responses.dto';
import type { IUseCase } from '@/server/application/use-cases/use-case.interface';
import { InvalidCredentialsError } from 'shared/domain/errors/auth.errors';

/**
 * Login User Use Case
 *
 * Authenticates a user and creates a new session.
 * Returns the user and session token.
 */
export class LoginUserUseCase implements IUseCase<LoginUserCommand, LoginUserResponse> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly sessionRepository: ISessionRepository,
    private readonly passwordService: IPasswordService,
    private readonly logger: ILogger
  ) {}

  async execute(command: LoginUserCommand): Promise<LoginUserResponse> {
    // 1. Find user by username
    const user = await this.userRepository.findByUsername(command.username.trim());
    if (!user) {
      throw new InvalidCredentialsError();
    }

    // 2. Check if user has a password
    if (!user.passwordHash) {
      throw new InvalidCredentialsError();
    }

    // 3. Verify password
    const isValid = await this.passwordService.verify(command.password, user.passwordHash);
    if (!isValid) {
      throw new InvalidCredentialsError();
    }

    // 4. Create session
    const session = Session.create({
      userId: user.id,
      rememberMe: command.rememberMe,
    });

    // 5. Save session
    const savedSession = await this.sessionRepository.save(session);

    // 6. Log login
    this.logger.info(
      {
        userId: user.id,
        username: user.username.getValue(),
        rememberMe: command.rememberMe,
      },
      'User logged in'
    );

    // 7. Return response
    return {
      user: UserMapper.toDTO(user),
      token: savedSession.token.getValue(),
    };
  }
}
