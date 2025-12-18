/**
 * Invalid Provider Error
 *
 * Thrown when an invalid provider type is provided.
 * Valid providers: trakt, mdblist, traktChart, stevenlu
 */
export class InvalidProviderError extends Error {
  constructor(provider: string) {
    super(`Invalid provider: ${provider}. Must be one of: trakt, mdblist, traktChart, stevenlu`);
    this.name = 'InvalidProviderError';
  }
}

/**
 * URL Does Not Match Provider Error
 *
 * Thrown when a URL doesn't match the expected pattern for the specified provider.
 */
export class UrlDoesNotMatchProviderError extends Error {
  constructor(url: string, provider: string) {
    super(`URL "${url}" does not match provider "${provider}"`);
    this.name = 'UrlDoesNotMatchProviderError';
  }
}
