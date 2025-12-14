import type { IJellyseerrConfigRepository } from '@/server/application/repositories/jellyseerr-config.repository.interface';
import type { DeleteJellyseerrConfigCommand } from 'shared/application/dtos/jellyseerr-config/commands.dto';
import type { DeleteJellyseerrConfigResponse } from 'shared/application/dtos/jellyseerr-config/responses.dto';
import type { ILogger } from '@/server/application/services/logger.interface';
import type { IUseCase } from '@/server/application/use-cases/use-case.interface';

export class DeleteJellyseerrConfigUseCase implements IUseCase<
  DeleteJellyseerrConfigCommand,
  DeleteJellyseerrConfigResponse
> {
  constructor(
    private readonly jellyseerrConfigRepository: IJellyseerrConfigRepository,
    private readonly logger: ILogger
  ) {}

  async execute(command: DeleteJellyseerrConfigCommand): Promise<DeleteJellyseerrConfigResponse> {
    await this.jellyseerrConfigRepository.deleteByUserId(command.userId);

    this.logger.info({ userId: command.userId }, 'Jellyseerr config deleted');

    return { success: true };
  }
}
