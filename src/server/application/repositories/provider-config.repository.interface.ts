import type { Nullable } from '../../../shared/types';
import type { ProviderConfig } from '../../domain/entities/provider-config.entity';
import type { ProviderType } from '../../domain/value-objects/provider-type.value-object';

/**
 * ProviderConfig Repository Interface (Port)
 *
 * Defines the contract for provider config persistence.
 * Infrastructure layer provides concrete implementation (Adapter).
 */
export interface IProviderConfigRepository {
  /**
   * Find provider config by user ID and provider type
   */
  findByUserIdAndProvider(userId: number, provider: ProviderType): Promise<Nullable<ProviderConfig>>;

  /**
   * Save (insert or update) provider config
   * Repository determines whether to insert or update based on existence
   */
  save(entity: ProviderConfig): Promise<ProviderConfig>;

  /**
   * Delete provider config by user ID and provider type
   */
  deleteByUserIdAndProvider(userId: number, provider: ProviderType): Promise<void>;
}
