import { InvalidJellyseerrApiKeyError } from '../errors/jellyseerr-config.errors';

export class JellyseerrApiKey {
  private constructor(private readonly value: string) {}

  static create(apiKey: string): JellyseerrApiKey {
    const trimmed = apiKey.trim();

    if (trimmed.length === 0) {
      throw new InvalidJellyseerrApiKeyError('API key cannot be empty');
    }

    return new JellyseerrApiKey(trimmed);
  }

  getValue(): string {
    return this.value;
  }
}
