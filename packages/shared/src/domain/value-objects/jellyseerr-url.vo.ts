import { InvalidJellyseerrUrlError } from '../errors/jellyseerr-config.errors';

export class JellyseerrUrlVO {
  private constructor(private readonly value: string) {}

  static create(url: string): JellyseerrUrlVO {
    const cleaned = this.cleanUrl(url);

    if (!this.isValid(cleaned)) {
      throw new InvalidJellyseerrUrlError(url, 'Must be a valid HTTP/HTTPS URL');
    }

    return new JellyseerrUrlVO(cleaned);
  }

  private static cleanUrl(url: string): string {
    // Remove trailing slash
    return url.replace(/\/$/, '');
  }

  private static isValid(url: string): boolean {
    try {
      const parsed = new URL(url);
      // Allow both HTTP and HTTPS protocols
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }

  getValue(): string {
    return this.value;
  }
}
