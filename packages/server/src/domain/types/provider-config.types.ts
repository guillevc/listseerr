import type { TraktClientId } from 'shared/domain/value-objects/trakt-client-id.value-object';
import type { MdbListApiKey } from 'shared/domain/value-objects/mdblist-api-key.value-object';

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
