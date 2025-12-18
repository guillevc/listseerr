/**
 * Jellyseerr URL Value Object
 *
 * Server-only VO that handles business invariants for Jellyseerr URLs.
 * Schema handles structural validation (URL format, protocol).
 * VO handles business rules (e.g., blocking localhost in production).
 */

import { InvalidJellyseerrUrlError } from 'shared/domain/errors/jellyseerr-config.errors';
import type { JellyseerrUrlPrimitive } from 'shared/domain/types/jellyseerr.types';

export class JellyseerrUrlVO {
  private constructor(private readonly value: JellyseerrUrlPrimitive) {}

  /**
   * Creates a VO from schema-validated data.
   * Schema has already validated URL format and cleaned it.
   */
  static create(value: JellyseerrUrlPrimitive): JellyseerrUrlVO {
    // Business invariants could go here
    // Example: Block internal URLs in production
    // if (process.env.NODE_ENV === 'production' && value.includes('localhost')) {
    //   throw new DomainError('Cannot use localhost in production');
    // }
    return new JellyseerrUrlVO(value);
  }

  /**
   * Creates a VO from database/persistence data.
   * Performs structural validation since data bypasses schema.
   */
  static fromPersistence(value: string): JellyseerrUrlVO {
    const cleaned = value.replace(/\/$/, '');

    try {
      const parsed = new URL(cleaned);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        throw new InvalidJellyseerrUrlError(value, 'Must be a valid HTTP/HTTPS URL');
      }
    } catch (e) {
      if (e instanceof InvalidJellyseerrUrlError) throw e;
      throw new InvalidJellyseerrUrlError(value, 'Must be a valid HTTP/HTTPS URL');
    }

    return new JellyseerrUrlVO(cleaned);
  }

  getValue(): string {
    return this.value;
  }
}
