import type { ISeerrConfigRepository } from '@/server/application/repositories/seerr-config.repository.interface';
import { SeerrConfigMapper } from '@/server/application/mappers/seerr-config.mapper';
import type { GetSeerrConfigCommand } from 'shared/application/dtos';
import type { GetSeerrConfigResponse } from 'shared/application/dtos';
import type { IUseCase } from '@/server/application/use-cases/use-case.interface';

export class GetSeerrConfigUseCase implements IUseCase<
  GetSeerrConfigCommand,
  GetSeerrConfigResponse
> {
  constructor(private readonly seerrConfigRepository: ISeerrConfigRepository) {}

  async execute(command: GetSeerrConfigCommand): Promise<GetSeerrConfigResponse> {
    const config = await this.seerrConfigRepository.findByUserId(command.userId);

    return {
      config: config ? SeerrConfigMapper.toDTO(config) : null,
    };
  }
}
