import { ListProvider, MediaItem } from '../types';

export interface ListProviderService {
  fetchListItems(url: string): Promise<MediaItem[]>;
}

class TraktService implements ListProviderService {
  async fetchListItems(url: string): Promise<MediaItem[]> {
    console.log('Fetching from Trakt:', url);
    return [];
  }
}

class LetterboxdService implements ListProviderService {
  async fetchListItems(url: string): Promise<MediaItem[]> {
    console.log('Fetching from Letterboxd:', url);
    return [];
  }
}

class MDBListService implements ListProviderService {
  async fetchListItems(url: string): Promise<MediaItem[]> {
    console.log('Fetching from MDBList:', url);
    return [];
  }
}

class IMDBService implements ListProviderService {
  async fetchListItems(url: string): Promise<MediaItem[]> {
    console.log('Fetching from IMDB:', url);
    return [];
  }
}

class TMDBService implements ListProviderService {
  private apiKey: string = '';

  async fetchListItems(url: string): Promise<MediaItem[]> {
    console.log('Fetching from TMDB:', url);
    const listIdMatch = url.match(/\/list\/(\d+)/);
    if (!listIdMatch) return [];

    const listId = listIdMatch[1];

    try {
      if (!this.apiKey) {
        console.warn('TMDB API key not configured');
        return [];
      }

      const response = await fetch(
        `https://api.themoviedb.org/4/list/${listId}?api_key=${this.apiKey}`
      );

      if (!response.ok) return [];

      const data = await response.json();
      return this.parseListResponse(data);
    } catch (error) {
      console.error('Error fetching TMDB list:', error);
      return [];
    }
  }

  private parseListResponse(data: any): MediaItem[] {
    if (!data.items) return [];

    return data.items.map((item: any) => ({
      title: item.title || item.name,
      year: item.release_date ? new Date(item.release_date).getFullYear() : undefined,
      tmdbId: item.id,
      mediaType: item.media_type === 'movie' ? 'movie' : 'tv',
    }));
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }
}

const services: Record<ListProvider, ListProviderService> = {
  trakt: new TraktService(),
  letterboxd: new LetterboxdService(),
  mdblist: new MDBListService(),
  imdb: new IMDBService(),
  tmdb: new TMDBService(),
};

export function getListProviderService(provider: ListProvider): ListProviderService {
  return services[provider];
}

export async function fetchListItems(provider: ListProvider, url: string): Promise<MediaItem[]> {
  const service = getListProviderService(provider);
  return service.fetchListItems(url);
}
