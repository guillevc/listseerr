import type { IMdbListConfigRepository } from '@/server/application/repositories/mdblist-config.repository.interface';
import { MdbListConfigMapper } from '@/server/application/mappers/mdblist-config.mapper';
import type {
  SaveMdbListConfigCommand,
  MdbListConfigResponse,
} from 'shared/application/dtos/mdblist-config.commands.dto';
import { MdbListConfig } from '@/server/domain/entities/mdblist-config.entity';
import { MdbListApiKeyVO } from '@/server/domain/value-objects/mdblist-api-key.vo';
import type { ILogger } from '@/server/application/services/core/logger.interface';
import type { IUseCase } from '@/server/application/use-cases/use-case.interface';

export class SaveMdbListConfigUseCase implements IUseCase<
  SaveMdbListConfigCommand,
  MdbListConfigResponse
> {
  constructor(
    private readonly mdbListConfigRepository: IMdbListConfigRepository,
    private readonly logger: ILogger
  ) {}

  async execute(command: SaveMdbListConfigCommand): Promise<MdbListConfigResponse> {
    const apiKey = MdbListApiKeyVO.create(command.apiKey);
    const existing = await this.mdbListConfigRepository.findByUserId(command.userId);

    let savedConfig: MdbListConfig;

    if (existing) {
      existing.updateApiKey(apiKey);
      savedConfig = await this.mdbListConfigRepository.save(existing);
      this.logger.info({ userId: command.userId }, 'MdbList config updated');
    } else {
      const newConfig = MdbListConfig.create({ userId: command.userId, apiKey });
      savedConfig = await this.mdbListConfigRepository.save(newConfig);
      this.logger.info({ userId: command.userId }, 'MdbList config created');
    }

    return { config: MdbListConfigMapper.toDTO(savedConfig) };
  }
}
