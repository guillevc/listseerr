/**
 * Jellyseerr User ID Value Object
 *
 * Server-only VO that handles business invariants for Jellyseerr user IDs.
 */

import { InvalidJellyseerrUserIdError } from 'shared/domain/errors';
import type { JellyseerrUserIdPrimitive } from 'shared/domain/types';

export class JellyseerrUserIdVO {
  private constructor(private readonly value: JellyseerrUserIdPrimitive) {}

  /**
   * Creates a VO from schema-validated data.
   */
  static create(value: JellyseerrUserIdPrimitive): JellyseerrUserIdVO {
    return new JellyseerrUserIdVO(value);
  }

  /**
   * Creates a VO from database/persistence data.
   */
  static fromPersistence(value: number): JellyseerrUserIdVO {
    if (!Number.isInteger(value) || value <= 0) {
      throw new InvalidJellyseerrUserIdError(value);
    }
    return new JellyseerrUserIdVO(value);
  }

  getValue(): number {
    return this.value;
  }

  equals(other: JellyseerrUserIdVO): boolean {
    return this.value === other.value;
  }
}
