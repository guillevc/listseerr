import type { ITraktConfigRepository } from '@/server/application/repositories/trakt-config.repository.interface';
import { TraktConfigMapper } from '@/server/application/mappers/trakt-config.mapper';
import type {
  GetTraktConfigCommand,
  GetTraktConfigResponse,
} from 'shared/application/dtos/trakt-config.commands.dto';
import type { IUseCase } from '@/server/application/use-cases/use-case.interface';

export class GetTraktConfigUseCase implements IUseCase<
  GetTraktConfigCommand,
  GetTraktConfigResponse
> {
  constructor(private readonly traktConfigRepository: ITraktConfigRepository) {}

  async execute(command: GetTraktConfigCommand): Promise<GetTraktConfigResponse> {
    const config = await this.traktConfigRepository.findByUserId(command.userId);

    return {
      config: config ? TraktConfigMapper.toDTO(config) : null,
    };
  }
}
