import type { ProviderType } from '../types/provider.types';
import { ProviderValues } from '../types/provider.types';

export class Provider {
  private constructor(private readonly value: ProviderType) {}

  static create(value: string): Provider {
    if (!this.isValid(value)) {
      throw new Error(`Invalid provider: ${value}`);
    }
    return new Provider(value as ProviderType);
  }

  static isValid(value: string): boolean {
    return Object.values(ProviderValues).includes(value as ProviderType);
  }

  getValue(): ProviderType {
    return this.value;
  }

  equals(other: Provider): boolean {
    return this.value === other.value;
  }

  requiresUrlConversion(): boolean {
    return this.value === ProviderValues.TRAKT || this.value === ProviderValues.TRAKT_CHART;
  }
}
