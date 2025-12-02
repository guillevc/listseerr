export interface TraktListItem {
  rank: number;
  id: number;
  listed_at: string;
  notes: string | null;
  type: 'movie' | 'show';
  movie?: {
    title: string;
    year: number;
    ids: {
      trakt: number;
      slug: string;
      imdb: string;
      tmdb: number;
    };
  };
  show?: {
    title: string;
    year: number;
    ids: {
      trakt: number;
      slug: string;
      imdb: string;
      tmdb: number;
      tvdb?: number;
      tvrage?: number | null;
    };
  };
}

export interface MediaItem {
  title: string;
  year: number | null;
  tmdbId: number;
  imdbId: string | null;
  mediaType: 'movie' | 'tv';
}
