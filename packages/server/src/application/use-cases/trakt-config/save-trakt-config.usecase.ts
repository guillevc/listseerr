import type { ITraktConfigRepository } from '@/server/application/repositories/trakt-config.repository.interface';
import { TraktConfigMapper } from '@/server/application/mappers/trakt-config.mapper';
import type { SaveTraktConfigCommand } from 'shared/application/dtos';
import type { TraktConfigResponse } from 'shared/application/dtos';
import { TraktConfig } from '@/server/domain/entities/trakt-config.entity';
import { TraktClientIdVO } from '@/server/domain/value-objects/trakt-client-id.vo';
import type { ILogger } from '@/server/application/services/core/logger.interface';
import type { IUseCase } from '@/server/application/use-cases/use-case.interface';

export class SaveTraktConfigUseCase implements IUseCase<
  SaveTraktConfigCommand,
  TraktConfigResponse
> {
  constructor(
    private readonly traktConfigRepository: ITraktConfigRepository,
    private readonly logger: ILogger
  ) {}

  async execute(command: SaveTraktConfigCommand): Promise<TraktConfigResponse> {
    const clientId = TraktClientIdVO.create(command.clientId);
    const existing = await this.traktConfigRepository.findByUserId(command.userId);

    let savedConfig: TraktConfig;

    if (existing) {
      existing.updateClientId(clientId);
      savedConfig = await this.traktConfigRepository.save(existing);
      this.logger.info({ userId: command.userId }, 'Trakt config updated');
    } else {
      const newConfig = TraktConfig.create({ userId: command.userId, clientId });
      savedConfig = await this.traktConfigRepository.save(newConfig);
      this.logger.info({ userId: command.userId }, 'Trakt config created');
    }

    return { config: TraktConfigMapper.toDTO(savedConfig) };
  }
}
