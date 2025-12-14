export interface MdbListUrlParts {
  username: string;
  listSlug: string;
}

export interface MdbListApiItem {
  id: number; // TMDB ID
  title: string;
  mediatype: 'movie' | 'show'; // External API type
  release_year: number;
}
