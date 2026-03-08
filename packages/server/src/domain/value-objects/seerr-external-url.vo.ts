/**
 * Seerr External URL Value Object
 *
 * Server-only VO that handles business invariants for Seerr external URLs.
 * This is the user-facing URL used for browser links when the internal URL
 * is not accessible from the web (e.g., Docker internal networks).
 */

import { InvalidSeerrUrlError } from 'shared/domain/errors';
import type { SeerrExternalUrlPrimitive } from 'shared/domain/types';

export class SeerrExternalUrlVO {
  private constructor(private readonly value: SeerrExternalUrlPrimitive) {}

  /**
   * Creates a VO from schema-validated data.
   * Schema has already validated URL format and cleaned it.
   */
  static create(value: SeerrExternalUrlPrimitive): SeerrExternalUrlVO {
    return new SeerrExternalUrlVO(value);
  }

  /**
   * Creates a VO from database/persistence data.
   * Performs structural validation since data bypasses schema.
   */
  static fromPersistence(value: string): SeerrExternalUrlVO {
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

    return new SeerrExternalUrlVO(cleaned);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: SeerrExternalUrlVO): boolean {
    return this.value === other.value;
  }
}
