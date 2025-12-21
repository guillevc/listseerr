import type { ISessionRepository } from '@/server/application/repositories/session.repository.interface';
import type { ILogger } from '@/server/application/services/core/logger.interface';
import type { LogoutSessionCommand } from 'shared/application/dtos';
import type { LogoutSessionResponse } from 'shared/application/dtos';
import type { IUseCase } from '@/server/application/use-cases/use-case.interface';

/**
 * Logout Session Use Case
 *
 * Invalidates a session by deleting it from the database.
 */
export class LogoutSessionUseCase implements IUseCase<LogoutSessionCommand, LogoutSessionResponse> {
  constructor(
    private readonly sessionRepository: ISessionRepository,
    private readonly logger: ILogger
  ) {}

  async execute(command: LogoutSessionCommand): Promise<LogoutSessionResponse> {
    // 1. Delete session by token
    await this.sessionRepository.deleteByToken(command.token);

    // 2. Log logout
    this.logger.info({ tokenPrefix: command.token.slice(0, 8) + '...' }, 'User logged out');

    // 3. Return success
    return { success: true };
  }
}
