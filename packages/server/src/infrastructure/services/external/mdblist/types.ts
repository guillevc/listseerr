export interface MdbListUrlParts {
  username: string;
  listSlug: string;
}

export interface MdbListApiItem {
  id: number; // TMDB ID
  title: string;
  mediatype: 'movie' | 'show';
  release_year: number;
}

export interface MediaItem {
  title: string;
  year: number | null;
  tmdbId: number;
  mediaType: 'movie' | 'tv';
}
