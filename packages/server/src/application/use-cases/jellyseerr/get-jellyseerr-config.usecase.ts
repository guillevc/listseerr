import type { IJellyseerrConfigRepository } from '@/application/repositories/jellyseerr-config.repository.interface';
import type { GetJellyseerrConfigCommand } from 'shared/application/dtos/jellyseerr-config/commands.dto';
import type { GetJellyseerrConfigResponse } from 'shared/application/dtos/jellyseerr-config/responses.dto';
import type { IUseCase } from '@/application/use-cases/use-case.interface';
import { LogExecution } from '@/infrastructure/services/core/decorators/log-execution.decorator';

export class GetJellyseerrConfigUseCase implements IUseCase<
  GetJellyseerrConfigCommand,
  GetJellyseerrConfigResponse
> {
  constructor(private readonly jellyseerrConfigRepository: IJellyseerrConfigRepository) {}

  @LogExecution('jellyseerr:get-config')
  async execute(command: GetJellyseerrConfigCommand): Promise<GetJellyseerrConfigResponse> {
    const config = await this.jellyseerrConfigRepository.findByUserId(command.userId);

    return {
      config: config ? config.toDTO() : null,
    };
  }
}
