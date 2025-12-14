import type { JellyseerrConfig } from '@/server/domain/entities/jellyseerr-config.entity';
import type { JellyseerrConfigDTO } from 'shared/application/dtos/core/jellyseerr-config.dto';

export class JellyseerrConfigMapper {
  static toDTO(entity: JellyseerrConfig): JellyseerrConfigDTO {
    return {
      id: entity.id,
      userId: entity.userId,
      url: entity.url.getValue(),
      apiKey: entity.apiKey.getValue(),
      userIdJellyseerr: entity.userIdJellyseerr.getValue(),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
