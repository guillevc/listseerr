/**
 * Seerr URL Value Object
 *
 * Server-only VO that handles business invariants for Seerr URLs.
 * Schema handles structural validation (URL format, protocol).
 * VO handles business rules (e.g., blocking localhost in production).
 */

import { InvalidSeerrUrlError } from 'shared/domain/errors';
import type { SeerrUrlPrimitive } from 'shared/domain/types';

export class SeerrUrlVO {
  private constructor(private readonly value: SeerrUrlPrimitive) {}

  /**
   * Creates a VO from schema-validated data.
   * Schema has already validated URL format and cleaned it.
   */
  static create(value: SeerrUrlPrimitive): SeerrUrlVO {
    // Business invariants could go here
    // Example: Block internal URLs in production
    // if (process.env.NODE_ENV === 'production' && value.includes('localhost')) {
    //   throw new DomainError('Cannot use localhost in production');
    // }
    return new SeerrUrlVO(value);
  }

  /**
   * Creates a VO from database/persistence data.
   * Performs structural validation since data bypasses schema.
   */
  static fromPersistence(value: string): SeerrUrlVO {
    const cleaned = value.replace(/\/$/, '');

    try {
      const parsed = new URL(cleaned);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        throw new InvalidSeerrUrlError(value, 'Must be a valid HTTP/HTTPS URL');
      }
    } catch (e) {
      if (e instanceof InvalidSeerrUrlError) throw e;
      throw new InvalidSeerrUrlError(value, 'Must be a valid HTTP/HTTPS URL');
    }

    return new SeerrUrlVO(cleaned);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: SeerrUrlVO): boolean {
    return this.value === other.value;
  }
}
