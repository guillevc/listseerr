import { DomainError } from './domain.error';
import { ProviderValues } from '../types/provider.types';

// Generate valid providers list dynamically to stay in sync
const validProviders = Object.values(ProviderValues).join(', ');

/**
 * Invalid Provider Error
 *
 * Thrown when an invalid provider type is provided.
 */
export class InvalidProviderError extends DomainError {
  constructor(provider: string) {
    super(`Invalid provider: ${provider}. Must be one of: ${validProviders}`);
  }
}

/**
 * URL Does Not Match Provider Error
 *
 * Thrown when a URL doesn't match the expected pattern for the specified provider.
 */
export class UrlDoesNotMatchProviderError extends DomainError {
  constructor(url: string, provider: string) {
    super(`URL "${url}" does not match provider "${provider}"`);
  }
}
