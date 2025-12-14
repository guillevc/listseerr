import type { MdbListConfig } from '@/server/domain/entities/mdblist-config.entity';
import type { MdbListConfigDTO } from 'shared/application/dtos/core/mdblist-config.dto';

export class MdbListConfigMapper {
  static toDTO(entity: MdbListConfig): MdbListConfigDTO {
    return {
      id: entity.id,
      userId: entity.userId,
      apiKey: entity.apiKey.getValue(),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
