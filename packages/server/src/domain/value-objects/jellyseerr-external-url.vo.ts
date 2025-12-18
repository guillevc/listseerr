/**
 * Jellyseerr External URL Value Object
 *
 * Server-only VO that handles business invariants for Jellyseerr external URLs.
 * This is the user-facing URL used for browser links when the internal URL
 * is not accessible from the web (e.g., Docker internal networks).
 */

import { InvalidJellyseerrUrlError } from 'shared/domain/errors/jellyseerr-config.errors';
import type { JellyseerrExternalUrlPrimitive } from 'shared/domain/types/jellyseerr.types';

export class JellyseerrExternalUrlVO {
  private constructor(private readonly value: JellyseerrExternalUrlPrimitive) {}

  /**
   * Creates a VO from schema-validated data.
   * Schema has already validated URL format and cleaned it.
   */
  static create(value: JellyseerrExternalUrlPrimitive): JellyseerrExternalUrlVO {
    return new JellyseerrExternalUrlVO(value);
  }

  /**
   * Creates a VO from database/persistence data.
   * Performs structural validation since data bypasses schema.
   */
  static fromPersistence(value: string): JellyseerrExternalUrlVO {
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

    return new JellyseerrExternalUrlVO(cleaned);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: JellyseerrExternalUrlVO): boolean {
    return this.value === other.value;
  }
}
