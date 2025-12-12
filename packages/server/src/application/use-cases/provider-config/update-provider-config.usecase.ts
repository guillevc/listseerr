import type { IProviderConfigRepository } from '../../repositories/provider-config.repository.interface';
import type { UpdateProviderConfigCommand } from 'shared/application/dtos/provider-config/commands.dto';
import type { UpdateProviderConfigResponse } from 'shared/application/dtos/provider-config/responses.dto';
import { ProviderConfig } from '../../../domain/entities/provider-config.entity';
import { Provider } from 'shared/domain/value-objects/provider.value-object';
import { TraktClientId } from 'shared/domain/value-objects/trakt-client-id.value-object';
import { MdbListApiKey } from 'shared/domain/value-objects/mdblist-api-key.value-object';
import type { ProviderConfigData } from '../../../domain/types/provider-config.types';
import {
  InvalidTraktClientIdError,
  InvalidMdbListApiKeyError,
} from 'shared/domain/errors/provider-config.errors';
import type { ILogger } from '../../services/logger.interface';
import type { IUseCase } from '../use-case.interface';
import { LogExecution } from '../../../infrastructure/services/core/decorators/log-execution.decorator';

export class UpdateProviderConfigUseCase implements IUseCase<
  UpdateProviderConfigCommand,
  UpdateProviderConfigResponse
> {
  constructor(
    private readonly providerConfigRepository: IProviderConfigRepository,
    private readonly logger: ILogger
  ) {}

  @LogExecution('provider:update-config')
  async execute(command: UpdateProviderConfigCommand): Promise<UpdateProviderConfigResponse> {
    // 1. Validate and create provider type VO
    const provider = Provider.create(command.provider);

    // 2. Create provider-specific config data with VOs
    const configData = this.createConfigData(provider, command.config);

    // 3. Load existing config or create new
    let config = await this.providerConfigRepository.findByUserIdAndProvider(
      command.userId,
      provider
    );

    if (!config) {
      // Create new config
      config = new ProviderConfig({
        id: 0, // Temporary ID, DB will assign real ID
        userId: command.userId,
        provider: provider,
        config: configData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } else {
      // Update existing config
      config.updateConfig(configData);
    }

    // 4. Save entity (repository handles insert vs update)
    const savedConfig = await this.providerConfigRepository.save(config);

    // 5. Log changes
    this.logger.info(
      {
        userId: command.userId,
        provider: command.provider,
      },
      config.id === 0 ? 'Provider config created' : 'Provider config updated'
    );

    // 6. Return Response DTO
    return { config: savedConfig.toDTO() };
  }

  /**
   * Create provider-specific config data with proper Value Objects
   */
  private createConfigData(
    provider: Provider,
    config: UpdateProviderConfigCommand['config']
  ): ProviderConfigData {
    if (provider.isTrakt()) {
      if (!config.clientId) {
        throw new InvalidTraktClientIdError('Client ID is required for Trakt');
      }
      return {
        clientId: TraktClientId.create(config.clientId),
      };
    }

    if (provider.isMdbList()) {
      if (!config.apiKey) {
        throw new InvalidMdbListApiKeyError('API key is required for MDBList');
      }
      return {
        apiKey: MdbListApiKey.create(config.apiKey),
      };
    }

    // For future providers (traktChart, stevenlu)
    throw new Error(`Unsupported provider: ${provider.getValue()}`);
  }
}
