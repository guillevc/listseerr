/**
 * Provider Value Object
 *
 * Server-only VO that handles business invariants for providers.
 * Delegates display/detection logic to shared logic functions (DRY).
 */

import { InvalidProviderError } from 'shared/domain/errors/provider.errors';
import { ProviderValues, type ProviderType } from 'shared/domain/types/provider.types';
import * as providerLogic from 'shared/domain/logic/provider.logic';

export { ProviderValues, type ProviderType };

export class ProviderVO {
  private constructor(private readonly value: ProviderType) {}

  /**
   * Creates a VO from schema-validated data.
   * Schema has already validated that value is a valid ProviderType.
   */
  static create(value: ProviderType): ProviderVO {
    // Business invariants could go here (e.g., disabled providers)
    return new ProviderVO(value);
  }

  /**
   * Creates a VO from database/persistence data.
   * Performs full validation since data bypasses schema.
   */
  static fromPersistence(value: string): ProviderVO {
    if (!providerLogic.isValidProvider(value)) {
      throw new InvalidProviderError(value);
    }
    return new ProviderVO(value);
  }

  /**
   * Detects the provider from a URL.
   * Returns the VO if a match is found, null otherwise.
   */
  static detectFromUrl(url: string): ProviderVO | null {
    const detected = providerLogic.detectProviderFromUrl(url);
    return detected ? new ProviderVO(detected) : null;
  }

  getValue(): ProviderType {
    return this.value;
  }

  // Delegate to shared logic functions
  isTrakt(): boolean {
    return providerLogic.isTrakt(this.value);
  }

  isMdbList(): boolean {
    return providerLogic.isMdbList(this.value);
  }

  isTraktChart(): boolean {
    return providerLogic.isTraktChart(this.value);
  }

  isStevenLu(): boolean {
    return providerLogic.isStevenLu(this.value);
  }

  getDisplayName(): string {
    return providerLogic.getProviderDisplayName(this.value);
  }

  requiresUrlConversion(): boolean {
    return providerLogic.requiresUrlConversion(this.value);
  }

  matchesUrl(url: string): boolean {
    return providerLogic.matchesProviderUrl(this.value, url);
  }

  equals(other: ProviderVO): boolean {
    return this.value === other.value;
  }
}
