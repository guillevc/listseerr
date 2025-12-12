/**
 * Provider Values
 *
 * Runtime constants for provider identification.
 * Provides named constants for all supported media list providers.
 *
 * Usage:
 * - Use constants instead of magic strings: `ProviderValues.TRAKT` instead of `'trakt'`
 * - Enables IDE autocomplete for provider values
 * - Single source of truth for all provider identifiers
 */
export const ProviderValues = {
  TRAKT: 'trakt',
  MDBLIST: 'mdblist',
  TRAKT_CHART: 'traktChart',
  STEVENLU: 'stevenlu',
} as const;

/**
 * Provider Type
 *
 * Union type derived from ProviderValues.
 * Automatically stays in sync with runtime values.
 * Shared between server and client for validation and type safety.
 *
 * Type is inferred as: 'trakt' | 'mdblist' | 'traktChart' | 'stevenlu'
 *
 * Used by:
 * - ProviderType Value Object
 * - MediaListDTO
 * - Provider Value Object
 * - All provider-related domain logic
 */
export type ProviderType = (typeof ProviderValues)[keyof typeof ProviderValues];
