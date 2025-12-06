/**
 * StevenLu API types
 */

export interface StevenLuItem {
  title: string;
  tmdb_id: number;
  imdb_id: string;
  poster_url: string;
  genres: string[];
}

export interface MediaItem {
  title: string;
  year: number | null;
  tmdbId: number;
  mediaType: 'movie' | 'tv';
}
