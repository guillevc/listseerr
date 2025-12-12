import type { IJellyseerrConfigRepository } from '@/server/application/repositories/jellyseerr-config.repository.interface';
import type { UpdateJellyseerrConfigCommand } from 'shared/application/dtos/jellyseerr-config/commands.dto';
import type { UpdateJellyseerrConfigResponse } from 'shared/application/dtos/jellyseerr-config/responses.dto';
import { JellyseerrConfig } from '@/server/domain/entities/jellyseerr-config.entity';
import { JellyseerrUrl } from 'shared/domain/value-objects/jellyseerr-url.value-object';
import { JellyseerrApiKey } from 'shared/domain/value-objects/jellyseerr-api-key.value-object';
import { JellyseerrUserId } from 'shared/domain/value-objects/jellyseerr-user-id.value-object';
import type { ILogger } from '@/server/application/services/logger.interface';
import type { IUseCase } from '@/server/application/use-cases/use-case.interface';
import { LogExecution } from '@/server/infrastructure/services/core/decorators/log-execution.decorator';

export class UpdateJellyseerrConfigUseCase implements IUseCase<
  UpdateJellyseerrConfigCommand,
  UpdateJellyseerrConfigResponse
> {
  constructor(
    private readonly jellyseerrConfigRepository: IJellyseerrConfigRepository,
    private readonly logger: ILogger
  ) {}

  @LogExecution('jellyseerr:update-config')
  async execute(command: UpdateJellyseerrConfigCommand): Promise<UpdateJellyseerrConfigResponse> {
    // 1. Load existing entity or create new one
    let config = await this.jellyseerrConfigRepository.findByUserId(command.userId);

    if (!config) {
      // Create new config with Value Objects
      config = new JellyseerrConfig({
        id: 0, // Temporary ID, DB will assign real ID
        userId: command.userId,
        url: JellyseerrUrl.create(command.data.url),
        apiKey: JellyseerrApiKey.create(command.data.apiKey),
        userIdJellyseerr: JellyseerrUserId.create(command.data.userIdJellyseerr),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } else {
      // 2. Apply changes using entity mutation methods
      // Entity methods handle VO creation internally for validation
      config.changeUrl(command.data.url);
      config.changeApiKey(command.data.apiKey);
      config.changeJellyseerrUserId(command.data.userIdJellyseerr);
    }

    // 3. Save entity (repository handles insert vs update)
    const savedConfig = await this.jellyseerrConfigRepository.save(config);

    // 4. Log changes
    this.logger.info(
      {
        userId: command.userId,
        url: savedConfig.url.getValue(),
        userIdJellyseerr: savedConfig.userIdJellyseerr.getValue(),
      },
      config.id === 0 ? 'Jellyseerr config created' : 'Jellyseerr config updated'
    );

    // 5. Return Response DTO
    return { config: savedConfig.toDTO() };
  }
}
