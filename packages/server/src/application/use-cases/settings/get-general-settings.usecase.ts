import type { IGeneralSettingsRepository } from '../../repositories/general-settings.repository.interface';
import type { GetGeneralSettingsCommand } from 'shared/application/dtos/general-settings/commands.dto';
import type { GetGeneralSettingsResponse } from 'shared/application/dtos/general-settings/responses.dto';
import type { IUseCase } from '../use-case.interface';
import { LogExecution } from '../../../infrastructure/services/core/decorators/log-execution.decorator';

export class GetGeneralSettingsUseCase implements IUseCase<
  GetGeneralSettingsCommand,
  GetGeneralSettingsResponse
> {
  constructor(private readonly generalSettingsRepository: IGeneralSettingsRepository) {}

  @LogExecution('settings:get')
  async execute(command: GetGeneralSettingsCommand): Promise<GetGeneralSettingsResponse> {
    const settings = await this.generalSettingsRepository.findByUserId(command.userId);

    return {
      settings: settings ? settings.toDTO() : null,
    };
  }
}
