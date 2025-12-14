export class TimezoneVO {
  private constructor(private readonly value: string) {}

  static create(timezone: string): TimezoneVO {
    if (!timezone || timezone.trim().length === 0) {
      throw new Error('TimezoneVO cannot be empty');
    }

    return new TimezoneVO(timezone.trim());
  }

  getValue(): string {
    return this.value;
  }
}
