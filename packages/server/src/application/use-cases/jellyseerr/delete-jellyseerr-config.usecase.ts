import type { IJellyseerrConfigRepository } from '@/application/repositories/jellyseerr-config.repository.interface';
import type { DeleteJellyseerrConfigCommand } from 'shared/application/dtos/jellyseerr-config/commands.dto';
import type { DeleteJellyseerrConfigResponse } from 'shared/application/dtos/jellyseerr-config/responses.dto';
import type { ILogger } from '@/application/services/logger.interface';
import type { IUseCase } from '@/application/use-cases/use-case.interface';
import { LogExecution } from '@/infrastructure/services/core/decorators/log-execution.decorator';

export class DeleteJellyseerrConfigUseCase implements IUseCase<
  DeleteJellyseerrConfigCommand,
  DeleteJellyseerrConfigResponse
> {
  constructor(
    private readonly jellyseerrConfigRepository: IJellyseerrConfigRepository,
    private readonly logger: ILogger
  ) {}

  @LogExecution('jellyseerr:delete-config')
  async execute(command: DeleteJellyseerrConfigCommand): Promise<DeleteJellyseerrConfigResponse> {
    await this.jellyseerrConfigRepository.deleteByUserId(command.userId);

    this.logger.info({ userId: command.userId }, 'Jellyseerr config deleted');

    return { success: true };
  }
}
