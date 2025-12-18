/**
 * Jellyseerr Logic Functions
 *
 * Pure functions for Jellyseerr-related behavior.
 */

/**
 * Returns the user-facing URL for Jellyseerr links.
 * Uses externalUrl if configured, otherwise falls back to the internal url.
 *
 * @param config - Object containing url and optional externalUrl
 * @returns The URL to use for user-facing links
 */
export function getUserFacingUrl(config: { url: string; externalUrl?: string }): string {
  return config.externalUrl || config.url;
}
