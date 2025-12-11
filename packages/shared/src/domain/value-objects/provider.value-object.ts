import type { ProviderType } from '../types/provider.types';
import { ProviderValues } from '../types/provider.types';
import { InvalidProviderError } from '../errors/provider.errors';

/**
 * Provider Value Object
 *
 * Validates and encapsulates provider type.
 * Unified VO combining features from previous ProviderType and Provider classes.
 *
 * Features:
 * - Validation with descriptive error
 * - Type guard helpers (isTrakt, isMdbList, etc.)
 * - Equality comparison
 * - URL conversion detection
 */
export class Provider {
  private constructor(private readonly value: ProviderType) {}

  static create(value: string): Provider {
    if (!this.isValid(value)) {
      throw new InvalidProviderError(value);
    }
    return new Provider(value as ProviderType);
  }

  static isValid(value: string): boolean {
    return Object.values(ProviderValues).includes(value as ProviderType);
  }

  getValue(): ProviderType {
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

  // Utility methods
  equals(other: Provider): boolean {
    return this.value === other.value;
  }

  requiresUrlConversion(): boolean {
    return this.value === ProviderValues.TRAKT || this.value === ProviderValues.TRAKT_CHART;
  }
}
