import { parseTraktUrl, buildTraktApiUrl } from './url-parser';
import type { TraktListItem, MediaItem } from './types';

export async function fetchTraktList(
  url: string,
  maxItems: number | null,
  clientId: string
): Promise<MediaItem[]> {
  try {
    // Parse the Trakt URL
    const urlParts = parseTraktUrl(url);

    // Build the API URL with pagination
    const limit = maxItems || 100;
    const apiUrl = buildTraktApiUrl(urlParts, 1, limit);

    // Fetch from Trakt API
    const response = await fetch(apiUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Trakt-Api-Version': '2',
        'Trakt-Api-Key': clientId,
      },
    });

    if (!response.ok) {
      throw new Error(`Trakt API error: ${response.status} ${response.statusText}`);
    }

    const items: TraktListItem[] = await response.json();

    // Transform Trakt items to MediaItem format
    const mediaItems: MediaItem[] = items
      .map((item) => transformTraktItem(item))
      .filter((item): item is MediaItem => item !== null);

    return mediaItems;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch Trakt list: ${error.message}`);
    }
    throw new Error('Failed to fetch Trakt list: Unknown error');
  }
}

function transformTraktItem(item: TraktListItem): MediaItem | null {
  // Handle movie items
  if (item.type === 'movie' && item.movie) {
    const tmdbId = item.movie.ids.tmdb;
    if (!tmdbId) {
      console.warn(`Skipping movie "${item.movie.title}" - no TMDB ID`);
      return null;
    }

    return {
      title: item.movie.title,
      year: item.movie.year,
      tmdbId,
      imdbId: item.movie.ids.imdb || null,
      mediaType: 'movie',
    };
  }

  // Handle show items
  if (item.type === 'show' && item.show) {
    const tmdbId = item.show.ids.tmdb;
    if (!tmdbId) {
      console.warn(`Skipping show "${item.show.title}" - no TMDB ID`);
      return null;
    }

    return {
      title: item.show.title,
      year: item.show.year,
      tmdbId,
      imdbId: item.show.ids.imdb || null,
      mediaType: 'tv',
    };
  }

  console.warn(`Skipping unknown item type: ${item.type}`);
  return null;
}
