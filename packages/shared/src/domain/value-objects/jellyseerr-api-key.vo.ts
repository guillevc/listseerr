import { InvalidJellyseerrApiKeyError } from '../errors/jellyseerr-config.errors';

export class JellyseerrApiKeyVO {
  private constructor(private readonly value: string) {}

  static create(apiKey: string): JellyseerrApiKeyVO {
    const trimmed = apiKey.trim();

    if (trimmed.length === 0) {
      throw new InvalidJellyseerrApiKeyError('API key cannot be empty');
    }

    return new JellyseerrApiKeyVO(trimmed);
  }

  getValue(): string {
    return this.value;
  }
}
