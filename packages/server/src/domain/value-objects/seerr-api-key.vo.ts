/**
 * Seerr API Key Value Object
 *
 * Server-only VO that handles business invariants for Seerr API keys.
 */

import { InvalidSeerrApiKeyError } from 'shared/domain/errors';
import type { SeerrApiKeyPrimitive } from 'shared/domain/types';

export class SeerrApiKeyVO {
  private constructor(private readonly value: SeerrApiKeyPrimitive) {}

  /**
   * Creates a VO from schema-validated data.
   */
  static create(value: SeerrApiKeyPrimitive): SeerrApiKeyVO {
    return new SeerrApiKeyVO(value);
  }

  /**
   * Creates a VO from database/persistence data.
   */
  static fromPersistence(value: string): SeerrApiKeyVO {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      throw new InvalidSeerrApiKeyError('API key cannot be empty');
    }
    return new SeerrApiKeyVO(trimmed);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: SeerrApiKeyVO): boolean {
    return this.value === other.value;
  }
}
