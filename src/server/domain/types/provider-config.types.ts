import type { ProviderType } from '../value-objects/provider-type.value-object';
import type { TraktClientId } from '../value-objects/trakt-client-id.value-object';
import type { MdbListApiKey } from '../value-objects/mdblist-api-key.value-object';

/**
 * Provider-specific configuration data types
 */

export type TraktConfigData = {
  clientId: TraktClientId;
};

export type MdbListConfigData = {
  apiKey: MdbListApiKey;
};

/**
 * Union type for all provider configurations
 */
export type ProviderConfigData = TraktConfigData | MdbListConfigData;

/**
 * Props for ProviderConfig entity construction
 */
export interface ProviderConfigProps {
  id: number;
  userId: number;
  provider: ProviderType;
  config: ProviderConfigData;
  createdAt: Date;
  updatedAt: Date;
}
