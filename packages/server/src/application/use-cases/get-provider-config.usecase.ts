import type { IProviderConfigRepository } from '../repositories/provider-config.repository.interface';
import type { GetProviderConfigCommand } from 'shared/application/dtos/provider-config/commands.dto';
import type { GetProviderConfigResponse } from 'shared/application/dtos/provider-config/responses.dto';
import { Provider } from 'shared/domain/value-objects/provider.value-object';

export class GetProviderConfigUseCase {
  constructor(private readonly providerConfigRepository: IProviderConfigRepository) {}

  async execute(command: GetProviderConfigCommand): Promise<GetProviderConfigResponse> {
    // Validate provider type
    const provider = Provider.create(command.provider);

    // Fetch config
    const config = await this.providerConfigRepository.findByUserIdAndProvider(
      command.userId,
      provider
    );

    return {
      config: config ? config.toDTO() : null,
    };
  }
}
