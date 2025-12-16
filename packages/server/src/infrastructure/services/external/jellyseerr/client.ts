import type { JellyseerrConfig } from '@/server/infrastructure/db/schema';
import type { MediaItemDTO } from 'shared/application/dtos/core/media-item.dto';
import { MediaTypeVO } from 'shared/domain/value-objects/media-type.vo';
import type {
  JellyseerrRequestPayload,
  JellyseerrRequestResponse,
  ProcessingResult,
  JellyseerrPendingRequestsResponse,
  JellyseerrMediaInfoResponse,
} from './types';
import { LoggerService } from '@/server/infrastructure/services/core/logger.service';

const logger = new LoggerService('jellyseerr-client');

function buildHeaders(config: JellyseerrConfig) {
  return {
    'Content-Type': 'application/json',
    'X-Api-Key': config.apiKey,
    'X-Api-User': config.userIdJellyseerr.toString(),
  };
}

export async function requestToJellyseerr(
  item: MediaItemDTO,
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
    const mediaType = MediaTypeVO.create(item.mediaType);
    const payload: JellyseerrRequestPayload = {
      mediaType: mediaType.isTv() ? 'tv' : 'movie',
      mediaId: item.tmdbId,
    };

    // Add seasons array for TV shows
    if (mediaType.isTv()) {
      payload.seasons = [1];
    }

    const response = await fetch(`${config.url}/api/v1/request`, {
      method: 'POST',
      headers: buildHeaders(config),
      body: JSON.stringify(payload),
    });

    // Check for success status codes (200/201)
    if (response.status === 200 || response.status === 201) {
      const data = (await response.json()) as JellyseerrRequestResponse;
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

    // Handle 202 Accepted status - incomplete request (e.g., TV show with no seasons)
    // This is not an error - it means nothing new to request
    // We should cache it to prevent re-requesting
    if (response.status === 202) {
      logger.info(
        {
          title: item.title,
          tmdbId: item.tmdbId,
          mediaType: item.mediaType,
        },
        'Jellyseerr returned 202 Accepted - request incomplete (no seasons available). Treating as success for caching.'
      );
      return true;
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
          'Media previously requested in Jellyseerr - treating as success'
        );
        return true;
      }

      // Other 400 errors - log and fail (will retry next sync)
      logger.error(
        {
          title: item.title,
          tmdbId: item.tmdbId,
          status: 400,
          requestBody: {
            mediaType: item.mediaType,
            mediaId: item.tmdbId,
          },
          responseBody: errorData,
        },
        'Jellyseerr API validation error'
      );
      return false;
    }

    // Handle 500-level errors - log and fail (will retry next sync)
    if (response.status >= 500) {
      const errorBody = await response.text().catch(() => 'Unknown error');
      logger.error(
        {
          title: item.title,
          tmdbId: item.tmdbId,
          status: response.status,
          requestBody: {
            mediaType: item.mediaType,
            mediaId: item.tmdbId,
          },
          responseBody: errorBody,
        },
        'Jellyseerr API server error'
      );
      return false;
    }

    // All other error status codes
    const errorBody = await response.text().catch(() => '');
    logger.error(
      {
        title: item.title,
        tmdbId: item.tmdbId,
        status: response.status,
        requestBody: {
          mediaType: item.mediaType,
          mediaId: item.tmdbId,
        },
        responseBody: errorBody,
      },
      'Jellyseerr API error'
    );
    return false;
  } catch (error) {
    // Network errors or other exceptions - log and fail (will retry next sync)
    logger.error(
      {
        title: item.title,
        tmdbId: item.tmdbId,
        requestBody: {
          mediaType: item.mediaType,
          mediaId: item.tmdbId,
        },
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      'Jellyseerr API network error'
    );
    return false;
  }
}

export async function requestItemsToJellyseerr(
  items: MediaItemDTO[],
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

/**
 * Get the count of pending requests from Jellyseerr
 * @param config - Jellyseerr configuration
 * @returns Number of pending requests
 */
export async function getPendingRequestsCount(config: JellyseerrConfig): Promise<number> {
  logger.debug('Fetching pending requests count from Jellyseerr');

  try {
    const response = await fetch(`${config.url}/api/v1/request?filter=pending&take=1000`, {
      headers: buildHeaders(config),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      logger.error(
        {
          status: response.status,
          statusText: response.statusText,
          url: `${config.url}/api/v1/request?filter=pending&take=1000`,
          responseBody: errorBody,
        },
        'Failed to fetch pending requests from Jellyseerr'
      );
      throw new Error(`Jellyseerr API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as JellyseerrPendingRequestsResponse;
    const count = data.pageInfo.results;

    logger.info({ pendingRequestsCount: count }, 'Successfully fetched pending requests count');

    return count;
  } catch (error) {
    logger.error(
      { error, url: config.url },
      'Failed to get pending requests count from Jellyseerr'
    );
    throw error;
  }
}

/**
 * Get media availability status from Jellyseerr
 *
 * @param tmdbId - TMDB ID of the media
 * @param mediaType - Media type (movie or tv)
 * @param config - Jellyseerr configuration
 * @returns Media info response with status, or null if not found
 */
export async function getMediaAvailability(
  tmdbId: number,
  mediaType: MediaTypeVO,
  config: JellyseerrConfig
): Promise<JellyseerrMediaInfoResponse | null> {
  const endpoint = mediaType.isMovie() ? 'movie' : 'tv';
  logger.debug(
    { tmdbId, mediaType: mediaType.getValue() },
    'Checking media availability in Jellyseerr'
  );

  try {
    const response = await fetch(`${config.url}/api/v1/${endpoint}/${tmdbId}?language=en`, {
      headers: buildHeaders(config),
    });

    if (response.status === 404) {
      logger.debug({ tmdbId }, 'Media not found in Jellyseerr (404)');
      return null;
    }

    if (!response.ok) {
      logger.warn(
        { tmdbId, status: response.status },
        'Failed to fetch media availability from Jellyseerr'
      );
      return null;
    }

    const data = (await response.json()) as JellyseerrMediaInfoResponse;
    logger.debug(
      { tmdbId, status: data.mediaInfo?.status },
      'Media availability fetched from Jellyseerr'
    );
    return data;
  } catch (error) {
    logger.warn(
      { tmdbId, error: error instanceof Error ? error.message : 'Unknown error' },
      'Error fetching media availability from Jellyseerr'
    );
    return null;
  }
}
