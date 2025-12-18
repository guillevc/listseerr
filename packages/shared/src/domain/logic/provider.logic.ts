/**
 * Provider Logic Functions
 *
 * Pure functions for provider display and detection behavior.
 * These are shared between the frontend and server VOs (DRY principle).
 */

import { ProviderValues, ProviderUrlPatterns, type ProviderType } from '../types/provider.types';

/**
 * Display names for provider types.
 * Used in UI labels and messages.
 */
export const ProviderDisplayNames: Record<ProviderType, string> = {
  trakt: 'Trakt List',
  traktChart: 'Trakt Chart',
  mdblist: 'MDBList',
  stevenlu: 'StevenLu',
};

/**
 * Checks if a value is a valid provider type.
 */
export function isValidProvider(value: string): value is ProviderType {
  return Object.values(ProviderValues).includes(value as ProviderType);
}

/**
 * Detects the provider from a URL by testing against all provider patterns.
 * Returns the provider type if a match is found, null otherwise.
 */
export function detectProviderFromUrl(url: string): ProviderType | null {
  if (!url || typeof url !== 'string') return null;

  const trimmedUrl = url.trim();
  for (const [provider, patterns] of Object.entries(ProviderUrlPatterns)) {
    for (const pattern of patterns) {
      if (pattern.test(trimmedUrl)) {
        return provider as ProviderType;
      }
    }
  }
  return null;
}

/**
 * Gets the human-readable display name for a provider.
 */
export function getProviderDisplayName(provider: ProviderType): string {
  return ProviderDisplayNames[provider];
}

/**
 * Checks if a URL matches a specific provider's patterns.
 */
export function matchesProviderUrl(provider: ProviderType, url: string): boolean {
  if (!url || typeof url !== 'string') return false;

  const patterns = ProviderUrlPatterns[provider];
  const trimmedUrl = url.trim();
  return patterns.some((pattern) => pattern.test(trimmedUrl));
}

// Type guard functions
export function isTrakt(provider: ProviderType): boolean {
  return provider === ProviderValues.TRAKT;
}

export function isMdbList(provider: ProviderType): boolean {
  return provider === ProviderValues.MDBLIST;
}

export function isTraktChart(provider: ProviderType): boolean {
  return provider === ProviderValues.TRAKT_CHART;
}

export function isStevenLu(provider: ProviderType): boolean {
  return provider === ProviderValues.STEVENLU;
}

/**
 * Checks if a provider requires URL conversion (Trakt-based providers).
 */
export function requiresUrlConversion(provider: ProviderType): boolean {
  return provider === ProviderValues.TRAKT || provider === ProviderValues.TRAKT_CHART;
}
