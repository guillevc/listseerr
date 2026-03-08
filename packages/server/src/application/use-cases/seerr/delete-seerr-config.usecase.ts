import type { ISeerrConfigRepository } from '@/server/application/repositories/seerr-config.repository.interface';
import type { DeleteSeerrConfigCommand } from 'shared/application/dtos';
import type { DeleteSeerrConfigResponse } from 'shared/application/dtos';
import type { ILogger } from '@/server/application/services/core/logger.interface';
import type { IUseCase } from '@/server/application/use-cases/use-case.interface';

export class DeleteSeerrConfigUseCase implements IUseCase<
  DeleteSeerrConfigCommand,
  DeleteSeerrConfigResponse
> {
  constructor(
    private readonly seerrConfigRepository: ISeerrConfigRepository,
    private readonly logger: ILogger
  ) {}

  async execute(command: DeleteSeerrConfigCommand): Promise<DeleteSeerrConfigResponse> {
    await this.seerrConfigRepository.deleteByUserId(command.userId);

    this.logger.info({ userId: command.userId }, 'Seerr config deleted');

    return { success: true };
  }
}
