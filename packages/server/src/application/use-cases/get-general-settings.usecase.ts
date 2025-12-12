import type { IGeneralSettingsRepository } from '../repositories/general-settings.repository.interface';
import type { GetGeneralSettingsCommand } from 'shared/application/dtos/general-settings/commands.dto';
import type { GetGeneralSettingsResponse } from 'shared/application/dtos/general-settings/responses.dto';

export class GetGeneralSettingsUseCase {
  constructor(private readonly generalSettingsRepository: IGeneralSettingsRepository) {}

  async execute(command: GetGeneralSettingsCommand): Promise<GetGeneralSettingsResponse> {
    const settings = await this.generalSettingsRepository.findByUserId(command.userId);

    return {
      settings: settings ? settings.toDTO() : null,
    };
  }
}
