export class Timezone {
  private constructor(private readonly value: string) {}

  static create(timezone: string): Timezone {
    if (!timezone || timezone.trim().length === 0) {
      throw new Error('Timezone cannot be empty');
    }

    return new Timezone(timezone.trim());
  }

  getValue(): string {
    return this.value;
  }
}
