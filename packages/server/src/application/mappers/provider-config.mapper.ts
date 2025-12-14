import type { ProviderConfig } from '@/server/domain/entities/provider-config.entity';
import type {
  TraktConfigData,
  MdbListConfigData,
} from '@/server/domain/types/provider-config.types';
import type { ProviderConfigDTO } from 'shared/application/dtos/core/provider-config.dto';

export class ProviderConfigMapper {
  static toDTO(entity: ProviderConfig): ProviderConfigDTO {
    if (entity.isTraktConfig()) {
      const traktConfig = entity.config as TraktConfigData;
      return {
        id: entity.id,
        userId: entity.userId,
        provider: entity.provider.getValue(),
        clientId: traktConfig.clientId.getValue(),
        apiKey: null,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
      };
    } else if (entity.isMdbListConfig()) {
      const mdbListConfig = entity.config as MdbListConfigData;
      return {
        id: entity.id,
        userId: entity.userId,
        provider: entity.provider.getValue(),
        clientId: null,
        apiKey: mdbListConfig.apiKey.getValue(),
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
      };
    }

    throw new Error(`Unknown provider type: ${entity.provider.getValue()}`);
  }
}
