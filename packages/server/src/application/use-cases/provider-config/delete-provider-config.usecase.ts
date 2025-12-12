import type { IProviderConfigRepository } from '@/application/repositories/provider-config.repository.interface';
import type { DeleteProviderConfigCommand } from 'shared/application/dtos/provider-config/commands.dto';
import type { DeleteProviderConfigResponse } from 'shared/application/dtos/provider-config/responses.dto';
import { Provider } from 'shared/domain/value-objects/provider.value-object';
import type { ILogger } from '@/application/services/logger.interface';
import type { IUseCase } from '@/application/use-cases/use-case.interface';
import { LogExecution } from '@/infrastructure/services/core/decorators/log-execution.decorator';

export class DeleteProviderConfigUseCase implements IUseCase<
  DeleteProviderConfigCommand,
  DeleteProviderConfigResponse
> {
  constructor(
    private readonly providerConfigRepository: IProviderConfigRepository,
    private readonly logger: ILogger
  ) {}

  @LogExecution('provider:delete-config')
  async execute(command: DeleteProviderConfigCommand): Promise<DeleteProviderConfigResponse> {
    // Validate provider type
    const provider = Provider.create(command.provider);

    // Delete config
    await this.providerConfigRepository.deleteByUserIdAndProvider(command.userId, provider);

    // Log deletion
    this.logger.info(
      { userId: command.userId, provider: command.provider },
      'Provider config deleted'
    );

    return { success: true };
  }
}
