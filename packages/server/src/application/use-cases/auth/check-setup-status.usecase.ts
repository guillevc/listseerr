import type { IUserRepository } from '@/server/application/repositories/user.repository.interface';
import type { CheckSetupStatusResponse } from 'shared/application/dtos/auth/responses.dto';
import type { IUseCase } from '@/server/application/use-cases/use-case.interface';

/**
 * Check Setup Status Use Case
 *
 * Returns whether the application needs initial setup (no users exist).
 * Used to determine if the user should be redirected to registration.
 */
export class CheckSetupStatusUseCase implements IUseCase<void, CheckSetupStatusResponse> {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(): Promise<CheckSetupStatusResponse> {
    const userCount = await this.userRepository.count();
    return { needsSetup: userCount === 0 };
  }
}
