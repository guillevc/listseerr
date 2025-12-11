export interface TraktListItem {
  type: 'movie' | 'show';
  movie?: {
    title: string;
    year: number;
    ids: {
      tmdb: number;
    };
  };
  show?: {
    title: string;
    year: number;
    ids: {
      tmdb: number;
    };
  };
}

export interface MediaItem {
  title: string;
  year: number | null;
  tmdbId: number;
  mediaType: 'movie' | 'tv';
}
