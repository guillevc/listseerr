export interface MdbListUrlParts {
  username: string;
  listSlug: string;
}

export interface MdbListApiItem {
  id: number;              // TMDB ID
  rank: number;
  adult: number;
  title: string;
  imdb_id: string;
  tvdb_id: number | null;
  language: string;
  mediatype: 'movie' | 'show';
  release_year: number;
  spoken_language: string;
}

export interface MediaItem {
  title: string;
  year: number | null;
  tmdbId: number;
  imdbId: string | null;
  mediaType: 'movie' | 'tv';
}
