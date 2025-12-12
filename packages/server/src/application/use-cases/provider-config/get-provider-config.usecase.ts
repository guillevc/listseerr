import type { IProviderConfigRepository } from '@/server/application/repositories/provider-config.repository.interface';
import type { GetProviderConfigCommand } from 'shared/application/dtos/provider-config/commands.dto';
import type { GetProviderConfigResponse } from 'shared/application/dtos/provider-config/responses.dto';
import { Provider } from 'shared/domain/value-objects/provider.value-object';
import type { IUseCase } from '@/server/application/use-cases/use-case.interface';
import { LogExecution } from '@/server/infrastructure/services/core/decorators/log-execution.decorator';

export class GetProviderConfigUseCase implements IUseCase<
  GetProviderConfigCommand,
  GetProviderConfigResponse
> {
  constructor(private readonly providerConfigRepository: IProviderConfigRepository) {}

  @LogExecution('provider:get-config')
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
