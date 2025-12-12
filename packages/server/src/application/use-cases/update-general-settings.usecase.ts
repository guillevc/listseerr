import type { IGeneralSettingsRepository } from '../repositories/general-settings.repository.interface';
import type { UpdateGeneralSettingsCommand } from 'shared/application/dtos/general-settings/commands.dto';
import type { UpdateGeneralSettingsResponse } from 'shared/application/dtos/general-settings/responses.dto';
import { GeneralSettings } from '../../domain/entities/general-settings.entity';
import { Timezone } from 'shared/domain/value-objects/timezone.value-object';
import type { Logger } from 'pino';

export class UpdateGeneralSettingsUseCase {
  constructor(
    private readonly generalSettingsRepository: IGeneralSettingsRepository,
    private readonly scheduler: { loadScheduledLists: () => Promise<void> },
    private readonly logger: Logger
  ) {}

  async execute(command: UpdateGeneralSettingsCommand): Promise<UpdateGeneralSettingsResponse> {
    // 1. Load existing entity or create new one
    let settings = await this.generalSettingsRepository.findByUserId(command.userId);

    if (!settings) {
      // Create new settings with defaults
      settings = new GeneralSettings({
        id: 0, // Temporary ID, DB will assign real ID
        userId: command.userId,
        timezone: Timezone.create(command.data.timezone || 'UTC'),
        automaticProcessingEnabled: command.data.automaticProcessingEnabled ?? false,
        automaticProcessingSchedule: command.data.automaticProcessingSchedule ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // 2. Capture old state for change detection (for logging)
    const oldTimezone = settings.timezone.getValue();
    const oldEnabled = settings.automaticProcessingEnabled;
    const oldSchedule = settings.automaticProcessingSchedule;

    // 3. Apply changes using entity mutation methods
    if (command.data.timezone !== undefined) {
      const timezoneVO = Timezone.create(command.data.timezone);
      settings.changeTimezone(timezoneVO);
    }

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

    // 5. Log changes (match legacy behavior)
    const newTimezone = savedSettings.timezone.getValue();
    const newEnabled = savedSettings.automaticProcessingEnabled;
    const newSchedule = savedSettings.automaticProcessingSchedule;

    if (oldTimezone !== newTimezone) {
      this.logger.info(
        {
          oldTimezone: oldTimezone || 'none',
          newTimezone,
          userId: command.userId,
        },
        '⏰ Timezone changed'
      );
    }

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

    // 6. Reload scheduler if needed (match legacy behavior)
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
    return { settings: savedSettings.toDTO() };
  }
}
