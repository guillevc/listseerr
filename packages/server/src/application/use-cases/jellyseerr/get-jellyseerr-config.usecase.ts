import type { IJellyseerrConfigRepository } from '@/server/application/repositories/jellyseerr-config.repository.interface';
import { JellyseerrConfigMapper } from '@/server/application/mappers/jellyseerr-config.mapper';
import type { GetJellyseerrConfigCommand } from 'shared/application/dtos';
import type { GetJellyseerrConfigResponse } from 'shared/application/dtos';
import type { IUseCase } from '@/server/application/use-cases/use-case.interface';

export class GetJellyseerrConfigUseCase implements IUseCase<
  GetJellyseerrConfigCommand,
  GetJellyseerrConfigResponse
> {
  constructor(private readonly jellyseerrConfigRepository: IJellyseerrConfigRepository) {}

  async execute(command: GetJellyseerrConfigCommand): Promise<GetJellyseerrConfigResponse> {
    const config = await this.jellyseerrConfigRepository.findByUserId(command.userId);

    return {
      config: config ? JellyseerrConfigMapper.toDTO(config) : null,
    };
  }
}
