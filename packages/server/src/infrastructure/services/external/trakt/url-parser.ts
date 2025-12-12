export interface TraktUrlParts {
  username: string;
  listSlug: string;
  sortField?: string;
  sortOrder?: string;
  mediaFilter?: string;
}

export function parseTraktUrl(url: string): TraktUrlParts {
  try {
    const urlObj = new URL(url);

    // Extract path parts: /users/{username}/lists/{listSlug}
    const pathParts = urlObj.pathname.split('/').filter(Boolean);

    if (pathParts.length < 4 || pathParts[0] !== 'users' || pathParts[2] !== 'lists') {
      throw new Error(
        'Invalid Trakt URL format. Expected: https://trakt.tv/users/{username}/lists/{listSlug}'
      );
    }

    const username = pathParts[1];
    const listSlug = pathParts[3];

    // Extract query parameters
    const searchParams = urlObj.searchParams;
    let sortField: string | undefined;
    let sortOrder: string | undefined;
    let mediaFilter: string | undefined;

    // Check for display parameter (media filter)
    const display = searchParams.get('display');
    if (display === 'movie') {
      mediaFilter = 'movie';
    } else if (display === 'show') {
      mediaFilter = 'show';
    }

    // Check for sort parameter (e.g., "added,asc" or "title,desc")
    const sort = searchParams.get('sort');
    if (sort) {
      const sortParts = sort.split(',');
      if (sortParts.length === 2) {
        sortField = sortParts[0];
        sortOrder = sortParts[1];
      }
    }

    return {
      username,
      listSlug,
      sortField,
      sortOrder,
      mediaFilter,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to parse Trakt URL: ${error.message}`);
    }
    throw new Error('Failed to parse Trakt URL: Unknown error');
  }
}

/**
 * Convert a Trakt list display URL to an API URL
 * Example: https://trakt.tv/users/username/lists/listslug -> https://api.trakt.tv/users/username/lists/listslug/items
 */
export function convertDisplayUrlToApiUrl(displayUrl: string): string {
  const parts = parseTraktUrl(displayUrl);
  return `https://api.trakt.tv/users/${parts.username}/lists/${parts.listSlug}/items`;
}

export function buildTraktApiUrl(parts: TraktUrlParts, page: number = 1, limit?: number): string {
  const { username, listSlug, sortField, sortOrder, mediaFilter } = parts;

  // Base API URL
  let apiUrl = `https://api.trakt.tv/users/${username}/lists/${listSlug}/items`;

  // Add media filter if specified (movie, show, or default to 'all')
  const filter = mediaFilter || 'all';

  // Add sort parameters if specified
  if (sortField && sortOrder) {
    apiUrl += `/${filter}/${sortField}/${sortOrder}`;
  } else if (filter !== 'all') {
    // If only filter is specified, use default sort (added/asc)
    apiUrl += `/${filter}`;
  }

  // Add pagination parameters
  const params = new URLSearchParams({
    page: page.toString(),
  });

  if (limit) {
    params.append('limit', limit.toString());
  }

  return `${apiUrl}?${params.toString()}`;
}
