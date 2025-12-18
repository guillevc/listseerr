/**
 * Jellyseerr Types
 *
 * Pure TypeScript contracts for Jellyseerr-related data.
 * Schemas must satisfy these types.
 */

export type JellyseerrUrlPrimitive = string;
export type JellyseerrApiKeyPrimitive = string;
export type JellyseerrUserIdPrimitive = number;

export interface JellyseerrConfigPrimitive {
  url: JellyseerrUrlPrimitive;
  apiKey: JellyseerrApiKeyPrimitive;
  userIdJellyseerr: JellyseerrUserIdPrimitive;
}
