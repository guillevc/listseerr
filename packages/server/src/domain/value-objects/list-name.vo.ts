/**
 * List Name Value Object
 *
 * Server-only VO that handles business invariants for list names.
 */

import { InvalidListNameError } from 'shared/domain/errors';
import type { ListNamePrimitive } from 'shared/domain/types';

export class ListNameVO {
  private constructor(private readonly value: ListNamePrimitive) {}

  /**
   * Creates a VO from schema-validated data.
   */
  static create(value: ListNamePrimitive): ListNameVO {
    // Business invariants could go here (e.g., reserved names)
    return new ListNameVO(value);
  }

  /**
   * Creates a VO from database/persistence data.
   */
  static fromPersistence(value: string): ListNameVO {
    if (!value || value.trim().length === 0) {
      throw new InvalidListNameError();
    }
    return new ListNameVO(value.trim());
  }

  getValue(): string {
    return this.value;
  }

  equals(other: ListNameVO): boolean {
    return this.value === other.value;
  }
}
