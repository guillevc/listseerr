import { InvalidMdbListApiKeyError } from '../errors/provider-config.errors';

/**
 * MdbListApiKey Value Object
 *
 * Represents an MDBList API key.
 * Validates that the API key is non-empty.
 */
export class MdbListApiKey {
  private constructor(private readonly value: string) {}

  static create(apiKey: string): MdbListApiKey {
    const trimmed = apiKey.trim();

    // Validate format: 20-50 alphanumeric characters (lenient validation)
    const pattern = /^[A-Za-z0-9-]{20,50}$/;
    if (!pattern.test(trimmed)) {
      throw new InvalidMdbListApiKeyError(
        'MDBList API key must be 20-50 alphanumeric characters. ' +
        'Get your API key from https://mdblist.com/preferences/'
      );
    }

    return new MdbListApiKey(trimmed);
  }

  getValue(): string {
    return this.value;
  }
}
