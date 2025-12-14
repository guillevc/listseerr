import { InvalidMdbListApiKeyError } from '../errors/provider-config.errors';

export class MdbListApiKeyVO {
  private constructor(private readonly value: string) {}

  static create(apiKey: string): MdbListApiKeyVO {
    const trimmed = apiKey.trim();

    // Validate format: 20-50 alphanumeric characters (lenient validation)
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
