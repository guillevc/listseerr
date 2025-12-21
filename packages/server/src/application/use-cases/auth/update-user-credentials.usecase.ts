import type { IUserRepository } from '@/server/application/repositories/user.repository.interface';
import type { IPasswordService } from '@/server/application/services/core/password.service.interface';
import type { ILogger } from '@/server/application/services/core/logger.interface';
import { UsernameVO } from '@/server/domain/value-objects/username.vo';
import { PasswordVO } from '@/server/domain/value-objects/password.vo';
import { UserMapper } from '@/server/application/mappers/user.mapper';
import type { UpdateUserCredentialsCommand } from 'shared/application/dtos';
import type { UpdateUserCredentialsResponse } from 'shared/application/dtos';
import type { IUseCase } from '@/server/application/use-cases/use-case.interface';
import {
  InvalidCredentialsError,
  UserAlreadyExistsError,
  UserNotFoundError,
} from 'shared/domain/errors';

/**
 * Update User Credentials Use Case
 *
 * Updates a user's username and/or password.
 * Requires current password verification for security.
 */
export class UpdateUserCredentialsUseCase implements IUseCase<
  UpdateUserCredentialsCommand,
  UpdateUserCredentialsResponse
> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordService: IPasswordService,
    private readonly logger: ILogger
  ) {}

  async execute(command: UpdateUserCredentialsCommand): Promise<UpdateUserCredentialsResponse> {
    // 1. Get user
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new UserNotFoundError(command.userId);
    }

    // 2. Verify current password
    if (!user.passwordHash) {
      throw new InvalidCredentialsError();
    }
    const isValidPassword = await this.passwordService.verify(
      command.currentPassword,
      user.passwordHash
    );
    if (!isValidPassword) {
      throw new InvalidCredentialsError();
    }

    // 3. Update username if provided
    if (command.newUsername) {
      const newUsernameVO = UsernameVO.create(command.newUsername);
      // Check if username already exists (and not same user)
      const existingUser = await this.userRepository.findByUsername(newUsernameVO.getValue());
      if (existingUser && existingUser.id !== user.id) {
        throw new UserAlreadyExistsError(command.newUsername);
      }
      user.changeUsername(newUsernameVO);
    }

    // 4. Update password if provided
    if (command.newPassword) {
      // PasswordVO is transient - used only for validation, then discarded
      const newPasswordVO = PasswordVO.create(command.newPassword);
      // Hash the raw password value, only the hash is persisted
      const newPasswordHash = await this.passwordService.hash(newPasswordVO.getValue());
      user.changePasswordHash(newPasswordHash);
    }

    // 5. Save user
    const savedUser = await this.userRepository.save(user);

    // 6. Log the change
    this.logger.info(
      {
        userId: savedUser.id,
        usernameChanged: !!command.newUsername,
        passwordChanged: !!command.newPassword,
      },
      'User credentials updated'
    );

    // 7. Return response
    return {
      user: UserMapper.toDTO(savedUser),
    };
  }
}
