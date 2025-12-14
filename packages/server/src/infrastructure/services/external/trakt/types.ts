export interface TraktListItem {
  type: 'movie' | 'show'; // External API type
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
