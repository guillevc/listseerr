import type { Nullable } from 'shared/domain/types/utility.types';
import type { ProviderConfig } from '@/domain/entities/provider-config.entity';
import type { Provider } from 'shared/domain/value-objects/provider.value-object';

/**
 * ProviderConfig Repository Interface (Port)
 *
 * Defines the contract for provider config persistence.
 * Infrastructure layer provides concrete implementation (Adapter).
 */
export interface IProviderConfigRepository {
  /**
   * Find provider config by user ID and provider
   */
  findByUserIdAndProvider(userId: number, provider: Provider): Promise<Nullable<ProviderConfig>>;

  /**
   * Save (insert or update) provider config
   * Repository determines whether to insert or update based on existence
   */
  save(entity: ProviderConfig): Promise<ProviderConfig>;

  /**
   * Delete provider config by user ID and provider
   */
  deleteByUserIdAndProvider(userId: number, provider: Provider): Promise<void>;
}
