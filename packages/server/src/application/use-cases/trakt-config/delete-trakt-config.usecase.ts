import type { ITraktConfigRepository } from '@/server/application/repositories/trakt-config.repository.interface';
import type { DeleteTraktConfigCommand } from 'shared/application/dtos';
import type { DeleteTraktConfigResponse } from 'shared/application/dtos';
import { TraktConfigNotFoundError } from 'shared/domain/errors';
import type { ILogger } from '@/server/application/services/core/logger.interface';
import type { IUseCase } from '@/server/application/use-cases/use-case.interface';

export class DeleteTraktConfigUseCase implements IUseCase<
  DeleteTraktConfigCommand,
  DeleteTraktConfigResponse
> {
  constructor(
    private readonly traktConfigRepository: ITraktConfigRepository,
    private readonly logger: ILogger
  ) {}

  async execute(command: DeleteTraktConfigCommand): Promise<DeleteTraktConfigResponse> {
    const config = await this.traktConfigRepository.findByUserId(command.userId);

    if (!config) {
      throw new TraktConfigNotFoundError(command.userId);
    }

    await this.traktConfigRepository.delete(config);

    this.logger.info({ userId: command.userId }, 'Trakt config deleted');

    return { success: true };
  }
}
