import type { ProviderConfigProps, ProviderConfigData, TraktConfigData, MdbListConfigData } from '../types/provider-config.types';
import type { ProviderType } from '../../../shared/domain/value-objects/provider-type.value-object';
import { InvalidProviderConfigError } from '../../../shared/domain/errors/provider-config.errors';
import type { ProviderConfigDTO } from '../../../shared/application/dtos/core/provider-config.dto';

/**
 * ProviderConfig Entity - Domain Model with Polymorphic Behavior
 *
 * This entity follows DDD principles:
 * - Private state (encapsulation)
 * - Polymorphic behavior based on provider type (type guards)
 * - Mutation methods enforce business rules
 * - toDTO() method for crossing application boundary
 */
export class ProviderConfig {
  // Private state - encapsulated
  private readonly _id: number;
  private readonly _userId: number;
  private readonly _provider: ProviderType;
  private _config: ProviderConfigData;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: ProviderConfigProps) {
    this._id = props.id;
    this._userId = props.userId;
    this._provider = props.provider;
    this._config = props.config;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  // Getters - expose state for read access
  get id(): number {
    return this._id;
  }

  get userId(): number {
    return this._userId;
  }

  get provider(): ProviderType {
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

  /**
   * Convert entity to DTO for crossing application boundary
   * This is the ONLY way entities should leave the domain layer
   */
  toDTO(): ProviderConfigDTO {
    if (this.isTraktConfig()) {
      const traktConfig = this.config as TraktConfigData;
      return {
        id: this._id,
        userId: this._userId,
        provider: this._provider.getValue(),
        clientId: traktConfig.clientId.getValue(),
        apiKey: null,
        createdAt: this._createdAt,
        updatedAt: this._updatedAt,
      };
    } else if (this.isMdbListConfig()) {
      const mdbListConfig = this.config as MdbListConfigData;
      return {
        id: this._id,
        userId: this._userId,
        provider: this._provider.getValue(),
        clientId: null,
        apiKey: mdbListConfig.apiKey.getValue(),
        createdAt: this._createdAt,
        updatedAt: this._updatedAt,
      };
    }

    // Should never reach here due to type guards
    throw new Error(`Unknown provider type: ${this._provider.getValue()}`);
  }
}
