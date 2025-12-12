import type { IJellyseerrConfigRepository } from '../../repositories/jellyseerr-config.repository.interface';
import type { GetJellyseerrConfigCommand } from 'shared/application/dtos/jellyseerr-config/commands.dto';
import type { GetJellyseerrConfigResponse } from 'shared/application/dtos/jellyseerr-config/responses.dto';
import type { IUseCase } from '../use-case.interface';

export class GetJellyseerrConfigUseCase implements IUseCase<
  GetJellyseerrConfigCommand,
  GetJellyseerrConfigResponse
> {
  constructor(private readonly jellyseerrConfigRepository: IJellyseerrConfigRepository) {}

  async execute(command: GetJellyseerrConfigCommand): Promise<GetJellyseerrConfigResponse> {
    const config = await this.jellyseerrConfigRepository.findByUserId(command.userId);

    return {
      config: config ? config.toDTO() : null,
    };
  }
}
