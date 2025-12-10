import type { IProviderConfigRepository } from '../repositories/provider-config.repository.interface';
import type { GetProviderConfigCommand } from '../dtos/provider-config.command.dto';
import type { GetProviderConfigResponse } from '../dtos/provider-config.response.dto';
import { ProviderType } from '../../domain/value-objects/provider-type.value-object';

export class GetProviderConfigUseCase {
  constructor(
    private readonly providerConfigRepository: IProviderConfigRepository
  ) {}

  async execute(command: GetProviderConfigCommand): Promise<GetProviderConfigResponse> {
    // Validate provider type
    const providerType = ProviderType.create(command.provider);

    // Fetch config
    const config = await this.providerConfigRepository.findByUserIdAndProvider(
      command.userId,
      providerType
    );

    return {
      config: config ? config.toDTO() : null,
    };
  }
}
