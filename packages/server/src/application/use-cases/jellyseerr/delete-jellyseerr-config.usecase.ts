import type { IJellyseerrConfigRepository } from '../../repositories/jellyseerr-config.repository.interface';
import type { DeleteJellyseerrConfigCommand } from 'shared/application/dtos/jellyseerr-config/commands.dto';
import type { DeleteJellyseerrConfigResponse } from 'shared/application/dtos/jellyseerr-config/responses.dto';
import type { Logger } from 'pino';
import type { IUseCase } from '../use-case.interface';
import { LogExecution } from '../../../infrastructure/services/core/decorators/log-execution.decorator';

export class DeleteJellyseerrConfigUseCase implements IUseCase<
  DeleteJellyseerrConfigCommand,
  DeleteJellyseerrConfigResponse
> {
  constructor(
    private readonly jellyseerrConfigRepository: IJellyseerrConfigRepository,
    private readonly logger: Logger
  ) {}

  @LogExecution('jellyseerr:delete-config')
  async execute(command: DeleteJellyseerrConfigCommand): Promise<DeleteJellyseerrConfigResponse> {
    await this.jellyseerrConfigRepository.deleteByUserId(command.userId);

    this.logger.info({ userId: command.userId }, 'Jellyseerr config deleted');

    return { success: true };
  }
}
