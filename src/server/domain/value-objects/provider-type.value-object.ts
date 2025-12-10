import { InvalidProviderTypeError } from '../errors/provider-config.errors';

export type ProviderTypeValue = 'trakt' | 'mdblist' | 'traktChart' | 'stevenlu';

/**
 * ProviderType Value Object
 *
 * Validates that provider type is one of the supported providers.
 */
export class ProviderType {
  private constructor(private readonly value: ProviderTypeValue) {}

  static create(provider: string): ProviderType {
    const validProviders: ProviderTypeValue[] = ['trakt', 'mdblist', 'traktChart', 'stevenlu'];

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
    return this.value === 'trakt';
  }

  isMdbList(): boolean {
    return this.value === 'mdblist';
  }

  isTraktChart(): boolean {
    return this.value === 'traktChart';
  }

  isStevenLu(): boolean {
    return this.value === 'stevenlu';
  }
}
