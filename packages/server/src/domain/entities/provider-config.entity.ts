import type {
  ProviderConfigData,
  TraktConfigData,
  MdbListConfigData,
} from '@/server/domain/types/provider-config.types';
import type { Provider } from 'shared/domain/value-objects/provider.value-object';
import { InvalidProviderConfigError } from 'shared/domain/errors/provider-config.errors';
/**
 * ProviderConfig Entity - Domain Model with Polymorphic Behavior
 *
 * This entity follows DDD principles:
 * - Private state (encapsulation)
 * - Polymorphic behavior based on provider type (type guards)
 * - Mutation methods enforce business rules
 * - Mappers in Application layer convert to DTOs
 */
export class ProviderConfig {
  // Private state - encapsulated
  private readonly _id: number;
  private readonly _userId: number;
  private readonly _provider: Provider;
  private _config: ProviderConfigData;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(params: {
    id: number;
    userId: number;
    provider: Provider;
    config: ProviderConfigData;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this._id = params.id;
    this._userId = params.userId;
    this._provider = params.provider;
    this._config = params.config;
    this._createdAt = params.createdAt;
    this._updatedAt = params.updatedAt;
  }

  // Getters - expose state for read access
  get id(): number {
    return this._id;
  }

  get userId(): number {
    return this._userId;
  }

  get provider(): Provider {
    return this._provider;
  }

  get config(): ProviderConfigData {
    return this._config;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // Type guards - enable type-safe polymorphism
  isTraktConfig(): this is ProviderConfig & { config: TraktConfigData } {
    return this._provider.isTrakt();
  }

  isMdbListConfig(): this is ProviderConfig & { config: MdbListConfigData } {
    return this._provider.isMdbList();
  }

  // Mutation methods - behavioral API for changing state

  /**
   * Update provider configuration
   * Validates that config matches provider type
   */
  updateConfig(newConfig: ProviderConfigData): void {
    // Validate provider-config match
    if (this._provider.isTrakt() && !('clientId' in newConfig)) {
      throw new InvalidProviderConfigError('Trakt config requires clientId');
    }
    if (this._provider.isMdbList() && !('apiKey' in newConfig)) {
      throw new InvalidProviderConfigError('MDBList config requires apiKey');
    }

    this._config = newConfig;
    this._updatedAt = new Date();
  }
}
