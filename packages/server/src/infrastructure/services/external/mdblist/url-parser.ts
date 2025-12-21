import { InvalidListUrlError } from 'shared/domain/errors';
import { parseMdbListUrl as parseUrl, type ParsedMdbListUrl } from 'shared/domain/logic';
import type { MdbListUrlParts } from './types';

/**
 * Parses an MDBList URL into its component parts.
 * @throws InvalidListUrlError if URL is invalid
 */
export function parseMdbListUrl(url: string): MdbListUrlParts {
  const parsed = parseUrl(url);
  if (!parsed) {
    throw new InvalidListUrlError(url);
  }
  return parsed;
}

// Re-export shared types for convenience
export type { ParsedMdbListUrl };

/**
 * Builds the MDBList API URL from parsed parts.
 */
export function buildMdbListApiUrl(parts: MdbListUrlParts, limit: number, apiKey: string): string {
  const baseUrl = 'https://api.mdblist.com';
  const path = `/lists/${parts.username}/${parts.listSlug}/items/`;
  const params = new URLSearchParams({
    limit: limit.toString(),
    apikey: apiKey,
    unified: 'true',
  });

  return `${baseUrl}${path}?${params.toString()}`;
}
