import type { JellyseerrConfig } from '../../db/schema';
import type { MediaItem } from '../trakt/types';
import type {
  JellyseerrRequestPayload,
  JellyseerrRequestResponse,
  ProcessingResult,
} from './types';
import { createLogger } from '../../lib/logger';

const logger = createLogger('jellyseerr-client');

export async function requestToJellyseerr(
  item: MediaItem,
  config: JellyseerrConfig
): Promise<boolean> {
  logger.debug(
    {
      title: item.title,
      year: item.year,
      tmdbId: item.tmdbId,
      mediaType: item.mediaType,
    },
    'Starting Jellyseerr request'
  );
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
        logger.info(
          {
            title: item.title,
            tmdbId: item.tmdbId,
            mediaType: item.mediaType,
            requestId: data.id,
            status: data.status,
          },
          'Successfully requested media to Jellyseerr'
        );
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
        logger.info(
          {
            title: item.title,
            tmdbId: item.tmdbId,
            mediaType: item.mediaType,
          },
          'Media already requested in Jellyseerr - treating as success'
        );
        return true;
      }

      // Other 400 errors - log and fail (will retry next sync)
      logger.warn(
        {
          title: item.title,
          tmdbId: item.tmdbId,
          status: 400,
          error: errorMessage || response.statusText,
        },
        'Request validation failed - will retry next sync'
      );
      return false;
    }

    // Handle 500-level errors - log and fail (will retry next sync)
    if (response.status >= 500) {
      const errorText = await response.text().catch(() => 'Unknown error');
      logger.warn(
        {
          title: item.title,
          tmdbId: item.tmdbId,
          status: response.status,
          error: errorText,
        },
        'Jellyseerr server error - will retry next sync'
      );
      return false;
    }

    // All other error status codes
    logger.warn(
      {
        title: item.title,
        tmdbId: item.tmdbId,
        status: response.status,
        statusText: response.statusText,
      },
      'Request failed - will retry next sync'
    );
    return false;
  } catch (error) {
    // Network errors or other exceptions - log and fail (will retry next sync)
    logger.warn(
      {
        title: item.title,
        tmdbId: item.tmdbId,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      'Request error - will retry next sync'
    );
    return false;
  }
}

export async function requestItemsToJellyseerr(
  items: MediaItem[],
  config: JellyseerrConfig
): Promise<ProcessingResult> {
  logger.info({ totalItems: items.length }, 'Starting batch Jellyseerr requests');

  const result: ProcessingResult = {
    successful: [],
    failed: [],
  };

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    logger.debug(
      {
        progress: `${i + 1}/${items.length}`,
        title: item.title,
        mediaType: item.mediaType,
      },
      'Processing item'
    );

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
      logger.error(
        {
          title: item.title,
          tmdbId: item.tmdbId,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        'Unexpected error processing item'
      );
      result.failed.push({
        item,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  logger.info(
    {
      total: items.length,
      successful: result.successful.length,
      failed: result.failed.length,
      successRate: `${((result.successful.length / items.length) * 100).toFixed(1)}%`,
    },
    'Completed batch Jellyseerr requests'
  );

  return result;
}
