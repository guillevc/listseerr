export class ListUrl {
  private constructor(private readonly value: string) {}

  static create(url: string): ListUrl {
    const cleaned = this.cleanUrl(url);

    if (!this.isValid(cleaned)) {
      throw new Error(`Invalid URL: ${url}`);
    }

    return new ListUrl(cleaned);
  }

  private static cleanUrl(url: string): string {
    // Remove query params
    return url.split('?')[0];
  }

  private static isValid(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  getValue(): string {
    return this.value;
  }
}
