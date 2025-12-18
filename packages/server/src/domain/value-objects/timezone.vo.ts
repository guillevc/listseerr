/**
 * Timezone Value Object
 *
 * Server-only VO that handles timezone values.
 */

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
      throw new Error('Timezone cannot be empty');
    }
    return new TimezoneVO(timezone.trim());
  }

  getValue(): string {
    return this.value;
  }
}
