import type { ISessionRepository } from '@/server/application/repositories/session.repository.interface';
import type { IUserRepository } from '@/server/application/repositories/user.repository.interface';
import { UserMapper } from '@/server/application/mappers/user.mapper';
import type { ValidateSessionCommand } from 'shared/application/dtos';
import type { ValidateSessionResponse } from 'shared/application/dtos';
import type { IUseCase } from '@/server/application/use-cases/use-case.interface';

/**
 * Validate Session Use Case
 *
 * Checks if a session token is valid and returns the associated user.
 * Used for authentication middleware.
 */
export class ValidateSessionUseCase implements IUseCase<
  ValidateSessionCommand,
  ValidateSessionResponse
> {
  constructor(
    private readonly sessionRepository: ISessionRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(command: ValidateSessionCommand): Promise<ValidateSessionResponse> {
    // 1. Find session by token
    const session = await this.sessionRepository.findByToken(command.token);

    // 2. Check if session exists and is valid
    if (!session || session.isExpired()) {
      return { user: null, valid: false };
    }

    // 3. Find user
    const user = await this.userRepository.findById(session.userId);
    if (!user) {
      return { user: null, valid: false };
    }

    // 4. Return valid session with user
    return {
      user: UserMapper.toDTO(user),
      valid: true,
    };
  }
}
