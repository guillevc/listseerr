import type { IJellyseerrConfigRepository } from '../repositories/jellyseerr-config.repository.interface';
import type { GetJellyseerrConfigCommand } from '../dtos/jellyseerr-config.command.dto';
import type { GetJellyseerrConfigResponse } from '../dtos/jellyseerr-config.response.dto';

export class GetJellyseerrConfigUseCase {
  constructor(
    private readonly jellyseerrConfigRepository: IJellyseerrConfigRepository
  ) {}

  async execute(command: GetJellyseerrConfigCommand): Promise<GetJellyseerrConfigResponse> {
    const config = await this.jellyseerrConfigRepository.findByUserId(command.userId);

    return {
      config: config ? config.toDTO() : null,
    };
  }
}
