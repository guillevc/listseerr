import { JellyseerrConfig, MediaItem } from '../types';

export class JellyseerrService {
  private config: JellyseerrConfig;

  constructor(config: JellyseerrConfig) {
    this.config = config;
  }

  private get baseUrl(): string {
    return this.config.url.replace(/\/$/, '');
  }

  private get headers(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'X-Api-Key': this.config.apiKey,
    };
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/status`, {
        headers: this.headers,
      });

      if (!response.ok) {
        return {
          success: false,
          error: `Connection failed: ${response.status} ${response.statusText}`,
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async requestMedia(item: MediaItem): Promise<{ success: boolean; error?: string }> {
    try {
      const endpoint = item.mediaType === 'movie' ? 'movie' : 'tv';

      const response = await fetch(`${this.baseUrl}/api/v1/request`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          mediaType: endpoint,
          mediaId: item.tmdbId,
          userId: this.config.userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.message || `Request failed: ${response.status}`,
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async checkIfRequested(tmdbId: number, mediaType: 'movie' | 'tv'): Promise<boolean> {
    try {
      const endpoint = mediaType === 'movie' ? 'movie' : 'tv';
      const response = await fetch(`${this.baseUrl}/api/v1/${endpoint}/${tmdbId}`, {
        headers: this.headers,
      });

      if (response.ok) {
        const data = await response.json();
        return data.mediaInfo?.status !== undefined;
      }

      return false;
    } catch (error) {
      console.error('Error checking if media is requested:', error);
      return false;
    }
  }
}
