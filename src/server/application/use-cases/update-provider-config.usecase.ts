import type { IProviderConfigRepository } from '../repositories/provider-config.repository.interface';
import type { UpdateProviderConfigCommand } from '../dtos/provider-config.command.dto';
import type { UpdateProviderConfigResponse } from '../dtos/provider-config.response.dto';
import { ProviderConfig } from '../../domain/entities/provider-config.entity';
import { ProviderType } from '../../domain/value-objects/provider-type.value-object';
import { TraktClientId } from '../../domain/value-objects/trakt-client-id.value-object';
import { MdbListApiKey } from '../../domain/value-objects/mdblist-api-key.value-object';
import type { ProviderConfigData } from '../../domain/types/provider-config.types';
import { InvalidTraktClientIdError, InvalidMdbListApiKeyError } from '../../domain/errors/provider-config.errors';
import type { Logger } from 'pino';

export class UpdateProviderConfigUseCase {
  constructor(
    private readonly providerConfigRepository: IProviderConfigRepository,
    private readonly logger: Logger
  ) {}

  async execute(command: UpdateProviderConfigCommand): Promise<UpdateProviderConfigResponse> {
    // 1. Validate and create provider type VO
    const providerType = ProviderType.create(command.provider);

    // 2. Create provider-specific config data with VOs
    const configData = this.createConfigData(providerType, command.config);

    // 3. Load existing config or create new
    let config = await this.providerConfigRepository.findByUserIdAndProvider(
      command.userId,
      providerType
    );

    if (!config) {
      // Create new config
      config = new ProviderConfig({
        id: 0, // Temporary ID, DB will assign real ID
        userId: command.userId,
        provider: providerType,
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
    providerType: ProviderType,
    config: UpdateProviderConfigCommand['config']
  ): ProviderConfigData {
    if (providerType.isTrakt()) {
      if (!config.clientId) {
        throw new InvalidTraktClientIdError('Client ID is required for Trakt');
      }
      return {
        clientId: TraktClientId.create(config.clientId),
      };
    }

    if (providerType.isMdbList()) {
      if (!config.apiKey) {
        throw new InvalidMdbListApiKeyError('API key is required for MDBList');
      }
      return {
        apiKey: MdbListApiKey.create(config.apiKey),
      };
    }

    // For future providers (traktChart, stevenlu)
    throw new Error(`Unsupported provider: ${providerType.getValue()}`);
  }
}
