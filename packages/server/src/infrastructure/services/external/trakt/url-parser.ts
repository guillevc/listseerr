export interface TraktUrlParts {
  username: string;
  listSlug: string;
  isWatchlist?: boolean;
  sortField?: string;
  sortOrder?: string;
  mediaFilter?: string;
}

export interface TraktParsedUrls {
  apiUrl: string;
  displayUrl: string;
}

export function parseTraktUrl(url: string): TraktUrlParts {
  try {
    const urlObj = new URL(url);

    // Extract path parts: /users/{username}/lists/{listSlug} OR /users/{username}/watchlist
    const pathParts = urlObj.pathname.split('/').filter(Boolean);

    if (
      pathParts.length < 3 ||
      pathParts[0] !== 'users' ||
      !(pathParts[2] === 'lists' || pathParts[2] === 'watchlist')
    ) {
      throw new Error(
        'Invalid Trakt URL format. Expected: https://trakt.tv/users/{username}/lists/{listSlug} or https://trakt.tv/users/{username}/watchlist'
      );
    }

    const username = pathParts[1] || '';
    const isWatchlist = pathParts[2] === 'watchlist';
    const listSlug = isWatchlist ? '' : pathParts[3] || '';

    if (!isWatchlist && !listSlug) {
      throw new Error(
        'Invalid Trakt URL format. Expected: https://trakt.tv/users/{username}/lists/{listSlug}'
      );
    }

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
        [sortField = '', sortOrder = ''] = sortParts;
      }
    }

    return {
      username,
      listSlug,
      isWatchlist,
      sortField,
      sortOrder,
      mediaFilter,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to parse Trakt URL: ${error.message}`, { cause: error });
    }
    throw new Error('Failed to parse Trakt URL: Unknown error', { cause: error });
  }
}

/**
 * Build a filtered display URL containing only sort and display params
 */
function buildFilteredDisplayUrl(parts: TraktUrlParts): string {
  const baseUrl = parts.isWatchlist
    ? `https://trakt.tv/users/${parts.username}/watchlist`
    : `https://trakt.tv/users/${parts.username}/lists/${parts.listSlug}`;
  const queryParts: string[] = [];

  if (parts.mediaFilter) {
    queryParts.push(`display=${parts.mediaFilter}`);
  }
  if (parts.sortField && parts.sortOrder) {
    queryParts.push(`sort=${parts.sortField},${parts.sortOrder}`);
  }

  return queryParts.length > 0 ? `${baseUrl}?${queryParts.join('&')}` : baseUrl;
}

/**
 * Convert a Trakt list display URL to an API URL with sort/display in the path
 * Example: https://trakt.tv/users/username/lists/listslug?sort=added,asc&display=movie
 *       -> apiUrl: https://api.trakt.tv/users/username/lists/listslug/items/movie/added/asc
 *       -> displayUrl: https://trakt.tv/users/username/lists/listslug?display=movie&sort=added,asc
 */
export function convertDisplayUrlToApiUrl(displayUrl: string): TraktParsedUrls {
  const parts = parseTraktUrl(displayUrl);

  // Build API URL
  let apiUrl = parts.isWatchlist
    ? `https://api.trakt.tv/users/${parts.username}/watchlist`
    : `https://api.trakt.tv/users/${parts.username}/lists/${parts.listSlug}/items`;

  if (parts.isWatchlist) {
    if (parts.mediaFilter) {
      const type = parts.mediaFilter === 'movie' ? 'movies' : 'shows';
      apiUrl += `/${type}`;
      if (parts.sortField && parts.sortOrder) {
        apiUrl += `/${parts.sortField}/${parts.sortOrder}`;
      }
    }
  } else {
    // Existing logic for custom lists
    const filter = parts.mediaFilter || 'all';
    apiUrl += `/${filter}`;

    if (parts.sortField && parts.sortOrder) {
      apiUrl += `/${parts.sortField}/${parts.sortOrder}`;
    }
  }

  // Build clean display URL (only sort/display params)
  const cleanDisplayUrl = buildFilteredDisplayUrl(parts);

  return { apiUrl, displayUrl: cleanDisplayUrl };
}
