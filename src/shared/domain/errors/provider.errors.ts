/**
 * Invalid Provider Error
 *
 * Thrown when an invalid provider type is provided.
 * Valid providers: trakt, mdblist, traktChart, stevenlu
 */
export class InvalidProviderError extends Error {
  constructor(provider: string) {
    super(
      `Invalid provider: ${provider}. Must be one of: trakt, mdblist, traktChart, stevenlu`
    );
    this.name = 'InvalidProviderError';
  }
}
