import type { JellyseerrConfig } from '@/server/domain/entities/jellyseerr-config.entity';
import type { JellyseerrConfigDTO } from 'shared/application/dtos';

export class JellyseerrConfigMapper {
  static toDTO(entity: JellyseerrConfig): JellyseerrConfigDTO {
    return {
      id: entity.id,
      userId: entity.userId,
      url: entity.url.getValue(),
      externalUrl: entity.externalUrl?.getValue(),
      apiKey: entity.apiKey.getValue(),
      userIdJellyseerr: entity.userIdJellyseerr.getValue(),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
