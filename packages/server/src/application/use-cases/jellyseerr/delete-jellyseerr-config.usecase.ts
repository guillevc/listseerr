import type { IJellyseerrConfigRepository } from '../../repositories/jellyseerr-config.repository.interface';
import type { DeleteJellyseerrConfigCommand } from 'shared/application/dtos/jellyseerr-config/commands.dto';
import type { DeleteJellyseerrConfigResponse } from 'shared/application/dtos/jellyseerr-config/responses.dto';
import type { Logger } from 'pino';

export class DeleteJellyseerrConfigUseCase {
  constructor(
    private readonly jellyseerrConfigRepository: IJellyseerrConfigRepository,
    private readonly logger: Logger
  ) {}

  async execute(command: DeleteJellyseerrConfigCommand): Promise<DeleteJellyseerrConfigResponse> {
    await this.jellyseerrConfigRepository.deleteByUserId(command.userId);

    this.logger.info({ userId: command.userId }, 'Jellyseerr config deleted');

    return { success: true };
  }
}
