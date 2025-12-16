import type { MediaList } from '@/server/domain/entities/media-list.entity';
import type { MediaListDTO } from 'shared/application/dtos/core/media-list.dto';

export class MediaListMapper {
  static toDTO(entity: MediaList): MediaListDTO {
    return {
      id: entity.id,
      userId: entity.userId,
      name: entity.name.getValue(),
      url: entity.url.getValue(),
      displayUrl: entity.displayUrl,
      provider: entity.provider.getValue(),
      enabled: entity.enabled,
      maxItems: entity.maxItems,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
