import type { JellyseerrConfig } from '../../db/schema';
import type { MediaItem } from '../trakt/types';
import type {
  JellyseerrRequestPayload,
  JellyseerrRequestResponse,
  ProcessingResult,
} from './types';

export async function requestToJellyseerr(
  item: MediaItem,
  config: JellyseerrConfig
): Promise<boolean> {
  try {
    const payload: JellyseerrRequestPayload = {
      mediaType: item.mediaType === 'tv' ? 'tv' : 'movie',
      mediaId: item.tmdbId,
    };

    // Add seasons array for TV shows
    if (item.mediaType === 'tv') {
      payload.seasons = [1];
    }

    const response = await fetch(`${config.url}/api/v1/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': config.apiKey,
        'X-Api-User': config.userIdJellyseerr.toString(),
      },
      body: JSON.stringify(payload),
    });

    // Check for success status codes (200/201)
    if (response.status === 200 || response.status === 201) {
      const data: JellyseerrRequestResponse = await response.json();
      // Validate that the response matches our request
      if (data.media?.tmdbId === item.tmdbId) {
        console.log(`Successfully requested "${item.title}" to Jellyseerr`);
        return true;
      }
    }

    // Handle "already requested" case (treat as success and cache it)
    if (response.status === 400) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        typeof errorData === 'object' && errorData !== null && 'message' in errorData
          ? String(errorData.message)
          : '';

      if (errorMessage.toLowerCase().includes('already')) {
        console.log(`Item "${item.title}" already requested, treating as success`);
        return true;
      }

      // Other 400 errors - log and fail (will retry next sync)
      console.warn(
        `Failed to request "${item.title}" (400): ${errorMessage || response.statusText} - will retry next sync`
      );
      return false;
    }

    // Handle 500-level errors - log and fail (will retry next sync)
    if (response.status >= 500) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.warn(
        `Jellyseerr server error for "${item.title}" (${response.status}): ${errorText} - will retry next sync`
      );
      return false;
    }

    // All other error status codes
    console.warn(
      `Failed to request "${item.title}" (${response.status} ${response.statusText}) - will retry next sync`
    );
    return false;
  } catch (error) {
    // Network errors or other exceptions - log and fail (will retry next sync)
    console.warn(
      `Error requesting "${item.title}" to Jellyseerr: ${error instanceof Error ? error.message : 'Unknown error'} - will retry next sync`
    );
    return false;
  }
}

export async function requestItemsToJellyseerr(
  items: MediaItem[],
  config: JellyseerrConfig
): Promise<ProcessingResult> {
  const result: ProcessingResult = {
    successful: [],
    failed: [],
  };

  for (const item of items) {
    try {
      const success = await requestToJellyseerr(item, config);

      if (success) {
        result.successful.push(item);
      } else {
        result.failed.push({
          item,
          error: 'Request failed',
        });
      }
    } catch (error) {
      result.failed.push({
        item,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return result;
}
