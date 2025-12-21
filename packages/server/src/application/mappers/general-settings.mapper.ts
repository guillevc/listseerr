import type { GeneralSettings } from '@/server/domain/entities/general-settings.entity';
import type { GeneralSettingsDTO } from 'shared/application/dtos';

export class GeneralSettingsMapper {
  static toDTO(entity: GeneralSettings): GeneralSettingsDTO {
    return {
      id: entity.id,
      userId: entity.userId,
      automaticProcessingEnabled: entity.automaticProcessingEnabled,
      automaticProcessingSchedule: entity.automaticProcessingSchedule,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
