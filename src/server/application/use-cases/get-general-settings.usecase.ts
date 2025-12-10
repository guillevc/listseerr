import type { IGeneralSettingsRepository } from '../repositories/general-settings.repository.interface';
import type { GetGeneralSettingsCommand } from '../dtos/general-settings.command.dto';
import type { GetGeneralSettingsResponse } from '../dtos/general-settings.response.dto';

export class GetGeneralSettingsUseCase {
  constructor(
    private readonly generalSettingsRepository: IGeneralSettingsRepository
  ) {}

  async execute(command: GetGeneralSettingsCommand): Promise<GetGeneralSettingsResponse> {
    const settings = await this.generalSettingsRepository.findByUserId(command.userId);

    return {
      settings: settings ? settings.toDTO() : null,
    };
  }
}
