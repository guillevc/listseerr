import type { ISeerrConfigRepository } from '@/server/application/repositories/seerr-config.repository.interface';
import { SeerrConfigMapper } from '@/server/application/mappers/seerr-config.mapper';
import type { UpdateSeerrConfigCommand } from 'shared/application/dtos';
import type { UpdateSeerrConfigResponse } from 'shared/application/dtos';
import { SeerrConfig } from '@/server/domain/entities/seerr-config.entity';
import { SeerrUrlVO } from '@/server/domain/value-objects/seerr-url.vo';
import { SeerrExternalUrlVO } from '@/server/domain/value-objects/seerr-external-url.vo';
import { SeerrApiKeyVO } from '@/server/domain/value-objects/seerr-api-key.vo';
import { SeerrUserIdVO } from '@/server/domain/value-objects/seerr-user-id.vo';
import type { ILogger } from '@/server/application/services/core/logger.interface';
import type { IUseCase } from '@/server/application/use-cases/use-case.interface';

export class UpdateSeerrConfigUseCase implements IUseCase<
  UpdateSeerrConfigCommand,
  UpdateSeerrConfigResponse
> {
  constructor(
    private readonly seerrConfigRepository: ISeerrConfigRepository,
    private readonly logger: ILogger
  ) {}

  async execute(command: UpdateSeerrConfigCommand): Promise<UpdateSeerrConfigResponse> {
    // 1. Load existing entity or create new one
    let config = await this.seerrConfigRepository.findByUserId(command.userId);

    if (!config) {
      // Create new config with Value Objects
      config = new SeerrConfig({
        id: 0, // Temporary ID, DB will assign real ID
        userId: command.userId,
        url: SeerrUrlVO.create(command.data.url),
        externalUrl: command.data.externalUrl
          ? SeerrExternalUrlVO.create(command.data.externalUrl)
          : null,
        apiKey: SeerrApiKeyVO.create(command.data.apiKey),
        userIdSeerr: SeerrUserIdVO.create(command.data.userIdSeerr),
        tvSeasons: command.data.tvSeasons,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } else {
      // 2. Apply changes using entity mutation methods
      // Entity methods handle VO creation internally for validation
      config.changeUrl(command.data.url);
      config.changeExternalUrl(command.data.externalUrl ?? null);
      config.changeApiKey(command.data.apiKey);
      config.changeSeerrUserId(command.data.userIdSeerr);
      config.changeTvSeasons(command.data.tvSeasons);
    }

    // 3. Save entity (repository handles insert vs update)
    const savedConfig = await this.seerrConfigRepository.save(config);

    // 4. Log changes
    this.logger.info(
      {
        userId: command.userId,
        url: savedConfig.url.getValue(),
        userIdSeerr: savedConfig.userIdSeerr.getValue(),
      },
      config.id === 0 ? 'Seerr config created' : 'Seerr config updated'
    );

    // 5. Return Response DTO
    return { config: SeerrConfigMapper.toDTO(savedConfig) };
  }
}
