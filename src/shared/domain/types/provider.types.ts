/**
 * Provider Type
 *
 * Defines the supported media list providers.
 * Shared between server and client for validation and type safety.
 *
 * Used by:
 * - ProviderType Value Object
 * - MediaListDTO
 * - Provider Value Object
 * - All provider-related domain logic
 */
export type ProviderType = 'trakt' | 'mdblist' | 'traktChart' | 'stevenlu';
