import { MdbListUrlParts } from './types';

export function parseMdbListUrl(url: string): MdbListUrlParts {
  // Expected format: https://mdblist.com/lists/{username}/{list-slug}
  const urlPattern = /^https?:\/\/(?:www\.)?mdblist\.com\/lists\/([^/]+)\/([^/?]+)/i;
  const match = url.match(urlPattern);

  if (!match) {
    throw new Error('Invalid MDBList URL format. Expected: https://mdblist.com/lists/{username}/{list-slug}');
  }

  return {
    username: match[1],
    listSlug: match[2],
  };
}

export function buildMdbListApiUrl(parts: MdbListUrlParts, limit: number, apiKey: string): string {
  // Build API URL with required parameters
  const baseUrl = 'https://api.mdblist.com';
  const path = `/lists/${parts.username}/${parts.listSlug}/items/`;
  const params = new URLSearchParams({
    limit: limit.toString(),
    apikey: apiKey,
    unified: 'true',  // Return both movies and shows together
  });

  return `${baseUrl}${path}?${params.toString()}`;
}
