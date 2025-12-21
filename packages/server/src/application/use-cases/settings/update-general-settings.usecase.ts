import type { IGeneralSettingsRepository } from '@/server/application/repositories/general-settings.repository.interface';
import type { ISchedulerService } from '@/server/application/services/core/scheduler.service.interface';
import { GeneralSettingsMapper } from '@/server/application/mappers/general-settings.mapper';
import type { UpdateGeneralSettingsCommand } from 'shared/application/dtos';
import type { UpdateGeneralSettingsResponse } from 'shared/application/dtos';
import type { ILogger } from '@/server/application/services/core/logger.interface';
import type { IUseCase } from '@/server/application/use-cases/use-case.interface';
import { GeneralSettingsNotFoundError } from 'shared/domain/errors';

export class UpdateGeneralSettingsUseCase implements IUseCase<
  UpdateGeneralSettingsCommand,
  UpdateGeneralSettingsResponse
> {
  constructor(
    private readonly generalSettingsRepository: IGeneralSettingsRepository,
    private readonly scheduler: ISchedulerService,
    private readonly logger: ILogger
  ) {}

  async execute(command: UpdateGeneralSettingsCommand): Promise<UpdateGeneralSettingsResponse> {
    // 1. Load existing entity (must exist after registration)
    const settings = await this.generalSettingsRepository.findByUserId(command.userId);
    if (!settings) {
      throw new GeneralSettingsNotFoundError(command.userId);
    }

    // 2. Capture old state for change detection (for logging)
    const oldEnabled = settings.automaticProcessingEnabled;
    const oldSchedule = settings.automaticProcessingSchedule;

    // 3. Apply changes using entity mutation methods
    if (command.data.automaticProcessingEnabled !== undefined) {
      if (command.data.automaticProcessingEnabled) {
        settings.enableAutomaticProcessing();
      } else {
        settings.disableAutomaticProcessing();
      }
    }

    if (command.data.automaticProcessingSchedule !== undefined) {
      settings.changeSchedule(command.data.automaticProcessingSchedule);
    }

    // 4. Save entity (repository handles insert vs update)
    const savedSettings = await this.generalSettingsRepository.save(settings);

    // 5. Log changes
    const newEnabled = savedSettings.automaticProcessingEnabled;
    const newSchedule = savedSettings.automaticProcessingSchedule;

    if (oldEnabled !== newEnabled || oldSchedule !== newSchedule) {
      this.logger.info(
        {
          oldEnabled,
          newEnabled,
          oldSchedule: oldSchedule || 'none',
          newSchedule: newSchedule || 'none',
          userId: command.userId,
        },
        newEnabled ? '⚙️ Automatic processing enabled' : '⏸️ Automatic processing disabled'
      );
    }

    // 6. Reload scheduler if needed
    if (savedSettings.requiresSchedulerReload(command.data)) {
      try {
        await this.scheduler.loadScheduledLists();
        this.logger.info('✅ Scheduler reloaded successfully');
      } catch (error) {
        this.logger.error(
          {
            error: error instanceof Error ? error.message : 'Unknown error',
          },
          '❌ Failed to reload scheduler'
        );
        // Don't throw - settings saved successfully, scheduler reload is best-effort
      }
    }

    // 7. Return Response DTO
    return { settings: GeneralSettingsMapper.toDTO(savedSettings) };
  }
}
