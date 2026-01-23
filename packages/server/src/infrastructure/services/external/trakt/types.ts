interface TraktMediaIds {
  tmdb: number;
}

interface TraktMovieInfo {
  title: string;
  year: number;
  ids: TraktMediaIds;
}

interface TraktShowInfo {
  title: string;
  year: number;
  ids: TraktMediaIds;
}

export interface TraktMovieItem {
  type: 'movie';
  movie: TraktMovieInfo;
}

export interface TraktShowItem {
  type: 'show';
  show: TraktShowInfo;
}

export type TraktListItem = TraktMovieItem | TraktShowItem;
