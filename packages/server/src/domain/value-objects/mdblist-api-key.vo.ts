/**
 * MDBList API Key Value Object
 *
 * Server-only VO that handles business invariants for MDBList API keys.
 */

import { InvalidMdbListApiKeyError } from 'shared/domain/errors/provider-config.errors';
import type { MdblistApiKeyPrimitive } from 'shared/domain/types/mdblist.types';

export class MdbListApiKeyVO {
  private constructor(private readonly value: MdblistApiKeyPrimitive) {}

  /**
   * Creates a VO from schema-validated data.
   */
  static create(value: MdblistApiKeyPrimitive): MdbListApiKeyVO {
    return new MdbListApiKeyVO(value);
  }

  /**
   * Creates a VO from database/persistence data.
   */
  static fromPersistence(value: string): MdbListApiKeyVO {
    const trimmed = value.trim();
    const pattern = /^[A-Za-z0-9-]{20,50}$/;

    if (!pattern.test(trimmed)) {
      throw new InvalidMdbListApiKeyError(
        'MDBList API key must be 20-50 alphanumeric characters. ' +
          'Get your API key from https://mdblist.com/preferences/'
      );
    }

    return new MdbListApiKeyVO(trimmed);
  }

  getValue(): string {
    return this.value;
  }
}
