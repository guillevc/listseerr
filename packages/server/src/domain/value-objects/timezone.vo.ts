/**
 * Timezone Value Object
 *
 * Server-only VO that handles timezone values.
 */

import { InvalidTimezoneError } from 'shared/domain/errors/general-settings.errors';

export class TimezoneVO {
  private constructor(private readonly value: string) {}

  /**
   * Creates a VO from schema-validated data.
   */
  static create(timezone: string): TimezoneVO {
    return new TimezoneVO(timezone);
  }

  /**
   * Creates a VO from database/persistence data.
   */
  static fromPersistence(timezone: string): TimezoneVO {
    if (!timezone || timezone.trim().length === 0) {
      throw new InvalidTimezoneError(timezone ?? 'empty');
    }
    return new TimezoneVO(timezone.trim());
  }

  getValue(): string {
    return this.value;
  }

  equals(other: TimezoneVO): boolean {
    return this.value === other.value;
  }
}
