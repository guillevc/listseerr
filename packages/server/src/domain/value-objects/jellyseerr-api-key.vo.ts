/**
 * Jellyseerr API Key Value Object
 *
 * Server-only VO that handles business invariants for Jellyseerr API keys.
 */

import { InvalidJellyseerrApiKeyError } from 'shared/domain/errors/jellyseerr-config.errors';
import type { JellyseerrApiKeyPrimitive } from 'shared/domain/types/jellyseerr.types';

export class JellyseerrApiKeyVO {
  private constructor(private readonly value: JellyseerrApiKeyPrimitive) {}

  /**
   * Creates a VO from schema-validated data.
   */
  static create(value: JellyseerrApiKeyPrimitive): JellyseerrApiKeyVO {
    return new JellyseerrApiKeyVO(value);
  }

  /**
   * Creates a VO from database/persistence data.
   */
  static fromPersistence(value: string): JellyseerrApiKeyVO {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      throw new InvalidJellyseerrApiKeyError('API key cannot be empty');
    }
    return new JellyseerrApiKeyVO(trimmed);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: JellyseerrApiKeyVO): boolean {
    return this.value === other.value;
  }
}
