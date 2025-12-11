import type { IProviderConfigRepository } from '../repositories/provider-config.repository.interface';
import type { DeleteProviderConfigCommand } from 'shared/application/dtos/provider-config/commands.dto';
import type { DeleteProviderConfigResponse } from 'shared/application/dtos/provider-config/responses.dto';
import { Provider } from 'shared/domain/value-objects/provider.value-object';
import type { Logger } from 'pino';

export class DeleteProviderConfigUseCase {
  constructor(
    private readonly providerConfigRepository: IProviderConfigRepository,
    private readonly logger: Logger
  ) {}

  async execute(command: DeleteProviderConfigCommand): Promise<DeleteProviderConfigResponse> {
    // Validate provider type
    const provider = Provider.create(command.provider);

    // Delete config
    await this.providerConfigRepository.deleteByUserIdAndProvider(
      command.userId,
      provider
    );

    // Log deletion
    this.logger.info(
      { userId: command.userId, provider: command.provider },
      'Provider config deleted'
    );

    return { success: true };
  }
}
