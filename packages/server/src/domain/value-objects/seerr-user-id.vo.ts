/**
 * Seerr User ID Value Object
 *
 * Server-only VO that handles business invariants for Seerr user IDs.
 */

import { InvalidSeerrUserIdError } from 'shared/domain/errors';
import type { SeerrUserIdPrimitive } from 'shared/domain/types';

export class SeerrUserIdVO {
  private constructor(private readonly value: SeerrUserIdPrimitive) {}

  /**
   * Creates a VO from schema-validated data.
   */
  static create(value: SeerrUserIdPrimitive): SeerrUserIdVO {
    return new SeerrUserIdVO(value);
  }

  /**
   * Creates a VO from database/persistence data.
   */
  static fromPersistence(value: number): SeerrUserIdVO {
    if (!Number.isInteger(value) || value <= 0) {
      throw new InvalidSeerrUserIdError(value);
    }
    return new SeerrUserIdVO(value);
  }

  getValue(): number {
    return this.value;
  }

  equals(other: SeerrUserIdVO): boolean {
    return this.value === other.value;
  }
}
