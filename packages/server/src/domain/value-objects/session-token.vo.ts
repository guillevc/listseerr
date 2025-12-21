/**
 * Session Token Value Object
 *
 * Server-only VO that handles session token creation and validation.
 * Generates cryptographically secure random tokens.
 */

import type { SessionTokenPrimitive } from 'shared/domain/types';
import { InvalidSessionTokenError } from 'shared/domain/errors';

const TOKEN_BYTES = 32; // 32 bytes = 64 hex characters

export class SessionTokenVO {
  private constructor(private readonly value: SessionTokenPrimitive) {}

  /**
   * Creates a VO from schema-validated data.
   * Schema has already validated that value is a valid token string.
   */
  static create(value: SessionTokenPrimitive): SessionTokenVO {
    return new SessionTokenVO(value);
  }

  /**
   * Creates a VO from database/persistence data.
   * Performs full validation since data bypasses schema.
   */
  static fromPersistence(value: string): SessionTokenVO {
    if (!value || typeof value !== 'string' || value.length === 0) {
      throw new InvalidSessionTokenError();
    }
    return new SessionTokenVO(value);
  }

  /**
   * Generates a new cryptographically secure session token.
   * Returns a 64-character hex string (32 random bytes).
   */
  static generate(): SessionTokenVO {
    const bytes = new Uint8Array(TOKEN_BYTES);
    crypto.getRandomValues(bytes);
    const token = Array.from(bytes)
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
    return new SessionTokenVO(token);
  }

  getValue(): SessionTokenPrimitive {
    return this.value;
  }

  equals(other: SessionTokenVO): boolean {
    return this.value === other.value;
  }
}
