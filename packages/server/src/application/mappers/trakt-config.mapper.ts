import type { TraktConfig } from '@/server/domain/entities/trakt-config.entity';
import type { TraktConfigDTO } from 'shared/application/dtos';

export class TraktConfigMapper {
  static toDTO(entity: TraktConfig): TraktConfigDTO {
    return {
      id: entity.id,
      userId: entity.userId,
      clientId: entity.clientId.getValue(),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
