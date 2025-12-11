import { InvalidProviderTypeError } from '../errors/provider-config.errors';
import type { ProviderType as ProviderTypeValue } from '../types/provider.types';
import { ProviderValues } from '../types/provider.types';

/**
 * ProviderType Value Object
 *
 * Validates that provider type is one of the supported providers.
 * Uses ProviderValues constants to eliminate magic strings.
 */
export class ProviderType {
  private constructor(private readonly value: ProviderTypeValue) {}

  static create(provider: string): ProviderType {
    const validProviders = Object.values(ProviderValues);

    if (!validProviders.includes(provider as ProviderTypeValue)) {
      throw new InvalidProviderTypeError(provider);
    }

    return new ProviderType(provider as ProviderTypeValue);
  }

  getValue(): ProviderTypeValue {
    return this.value;
  }

  // Type guard helpers
  isTrakt(): boolean {
    return this.value === ProviderValues.TRAKT;
  }

  isMdbList(): boolean {
    return this.value === ProviderValues.MDBLIST;
  }

  isTraktChart(): boolean {
    return this.value === ProviderValues.TRAKT_CHART;
  }

  isStevenLu(): boolean {
    return this.value === ProviderValues.STEVENLU;
  }
}
