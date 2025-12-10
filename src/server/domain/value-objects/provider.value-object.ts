import type { ProviderType } from '../types/media-list.types';

export class Provider {
  private constructor(private readonly value: ProviderType) {}

  static create(value: string): Provider {
    if (!this.isValid(value)) {
      throw new Error(`Invalid provider: ${value}`);
    }
    return new Provider(value as ProviderType);
  }

  static isValid(value: string): boolean {
    return ['trakt', 'mdblist', 'traktChart', 'stevenlu'].includes(value);
  }

  getValue(): ProviderType {
    return this.value;
  }

  equals(other: Provider): boolean {
    return this.value === other.value;
  }

  requiresUrlConversion(): boolean {
    return this.value === 'trakt' || this.value === 'traktChart';
  }
}
