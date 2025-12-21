/**
 * Password Value Object
 *
 * TRANSIENT VO - Used only for validation before hashing.
 * This VO is NEVER persisted. The User entity stores `passwordHash: string` directly.
 * The VO exists purely as a validation gate in the Use Case flow.
 */

import type { PasswordPrimitive } from 'shared/domain/types';

export class PasswordVO {
  private constructor(private readonly value: PasswordPrimitive) {}

  /**
   * Creates a VO from schema-validated data.
   * Schema has already validated that value is a non-empty string.
   *
   * Note: This VO is transient - it's only used to validate the password
   * before hashing. It should NOT be stored in entities.
   */
  static create(value: PasswordPrimitive): PasswordVO {
    // Business invariants could go here (e.g., password complexity)
    // Per requirements: only non-empty validation is needed
    return new PasswordVO(value);
  }

  getValue(): PasswordPrimitive {
    return this.value;
  }
}
