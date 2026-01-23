/**
 * MDBList URL Logic Functions
 *
 * Centralized URL parsing for MDBList URLs.
 * Shared between frontend and server (DRY principle).
 */

/**
 * Regex pattern for MDBList URLs with named capture groups.
 * Matches: https://mdblist.com/lists/{username}/{list-slug}
 */
export const MDBLIST_URL_PATTERN =
  /^https?:\/\/(?:www\.)?mdblist\.com\/lists\/(?<username>[^/]+)\/(?<listSlug>[^/?]+)\/?$/i;

export interface ParsedMdbListUrl {
  username: string;
  listSlug: string;
}

/**
 * Parses an MDBList URL to extract username and list slug.
 * Returns null if the URL doesn't match the expected pattern.
 *
 * @example
 * parseMdbListUrl('https://mdblist.com/lists/linaspurinis/top-watched-movies-of-the-week')
 * // Returns: { username: 'linaspurinis', listSlug: 'top-watched-movies-of-the-week' }
 */
export function parseMdbListUrl(url: string): ParsedMdbListUrl | null {
  if (!url || typeof url !== 'string') return null;

  const match = url.trim().match(MDBLIST_URL_PATTERN);
  if (!match?.groups) return null;

  const { username, listSlug } = match.groups;
  if (!username || !listSlug) return null;

  return {
    username,
    listSlug,
  };
}
