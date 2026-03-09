import type { SeerrConfig } from '@/server/domain/entities/seerr-config.entity';
import type { SeerrConfigDTO } from 'shared/application/dtos';

export class SeerrConfigMapper {
  static toDTO(entity: SeerrConfig): SeerrConfigDTO {
    return {
      id: entity.id,
      userId: entity.userId,
      url: entity.url.getValue(),
      externalUrl: entity.externalUrl?.getValue(),
      apiKey: entity.apiKey.getValue(),
      userIdSeerr: entity.userIdSeerr.getValue(),
      tvSeasons: entity.tvSeasons,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
