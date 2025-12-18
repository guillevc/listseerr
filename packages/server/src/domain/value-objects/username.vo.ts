/**
 * Username Value Object
 *
 * Server-only VO that handles business invariants for usernames.
 */

import { InvalidUsernameError } from 'shared/domain/errors/auth.errors';
import type { UsernamePrimitive } from 'shared/domain/types/auth.types';

export class UsernameVO {
  private constructor(private readonly value: UsernamePrimitive) {}

  /**
   * Creates a VO from schema-validated data.
   * Schema has already validated that value is a non-empty string.
   */
  static create(value: UsernamePrimitive): UsernameVO {
    // Business invariants could go here (e.g., reserved usernames)
    return new UsernameVO(value.trim());
  }

  /**
   * Creates a VO from database/persistence data.
   * Performs full validation since data bypasses schema.
   */
  static fromPersistence(value: string): UsernameVO {
    if (!value || typeof value !== 'string' || value.trim().length === 0) {
      throw new InvalidUsernameError('Username cannot be empty');
    }
    return new UsernameVO(value);
  }

  getValue(): UsernamePrimitive {
    return this.value;
  }

  equals(other: UsernameVO): boolean {
    return this.value.toLowerCase() === other.value.toLowerCase();
  }
}
