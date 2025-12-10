import type { IProviderConfigRepository } from '../repositories/provider-config.repository.interface';
import type { DeleteProviderConfigCommand } from '../dtos/provider-config.command.dto';
import type { DeleteProviderConfigResponse } from '../dtos/provider-config.response.dto';
import { ProviderType } from '../../domain/value-objects/provider-type.value-object';
import type { Logger } from 'pino';

export class DeleteProviderConfigUseCase {
  constructor(
    private readonly providerConfigRepository: IProviderConfigRepository,
    private readonly logger: Logger
  ) {}

  async execute(command: DeleteProviderConfigCommand): Promise<DeleteProviderConfigResponse> {
    // Validate provider type
    const providerType = ProviderType.create(command.provider);

    // Delete config
    await this.providerConfigRepository.deleteByUserIdAndProvider(
      command.userId,
      providerType
    );

    // Log deletion
    this.logger.info(
      { userId: command.userId, provider: command.provider },
      'Provider config deleted'
    );

    return { success: true };
  }
}
