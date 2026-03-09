import type { SeerrConfig } from '@/server/infrastructure/db/schema';
import type { MediaItemDTO } from 'shared/application/dtos';
import { MediaTypeVO } from '@/server/domain/value-objects/media-type.vo';
import type {
  SeerrRequestPayload,
  SeerrRequestResponse,
  ProcessingResult,
  SeerrPendingRequestsResponse,
  SeerrMediaInfoResponse,
} from './types';
import { LoggerService } from '@/server/infrastructure/services/core/logger.adapter';

const logger = new LoggerService('seerr-client');

function buildHeaders(config: SeerrConfig) {
  return {
    'Content-Type': 'application/json',
    'X-Api-Key': config.apiKey,
    'X-Api-User': config.userIdSeerr.toString(),
  };
}

async function requestToSeerr(item: MediaItemDTO, config: SeerrConfig): Promise<boolean> {
  logger.debug(
    {
      title: item.title,
      year: item.year,
      tmdbId: item.tmdbId,
      mediaType: item.mediaType,
    },
    'Starting Seerr request'
  );
  try {
    const mediaType = MediaTypeVO.create(item.mediaType);
    const payload: SeerrRequestPayload = {
      mediaType: mediaType.isTv() ? 'tv' : 'movie',
      mediaId: item.tmdbId,
    };

    // Add seasons array for TV shows (only when requesting first season)
    if (mediaType.isTv() && config.tvSeasons === 'first') {
      payload.seasons = [1];
    }

    const response = await fetch(`${config.url}/api/v1/request`, {
      method: 'POST',
      headers: buildHeaders(config),
      body: JSON.stringify(payload),
    });

    // Check for success status codes (200/201)
    if (response.status === 200 || response.status === 201) {
      const data = (await response.json()) as SeerrRequestResponse;
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
          'Successfully requested media to Seerr'
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
        'Seerr returned 202 Accepted - request incomplete (no seasons available). Treating as success for caching.'
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
          'Media previously requested in Seerr - treating as success'
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
        'Seerr API validation error'
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
        'Seerr API server error'
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
      'Seerr API error'
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
      'Seerr API network error'
    );
    return false;
  }
}

export async function requestItemsToSeerr(
  items: MediaItemDTO[],
  config: SeerrConfig
): Promise<ProcessingResult> {
  logger.info({ totalItems: items.length }, 'Starting batch Seerr requests');

  const result: ProcessingResult = {
    successful: [],
    failed: [],
  };

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    // Skip if item is undefined (shouldn't happen, but satisfies noUncheckedIndexedAccess)
    if (!item) {
      continue;
    }

    logger.debug(
      {
        progress: `${i + 1}/${items.length}`,
        title: item.title,
        mediaType: item.mediaType,
      },
      'Processing item'
    );

    try {
      const success = await requestToSeerr(item, config);

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
    'Completed batch Seerr requests'
  );

  return result;
}

/**
 * Get the count of pending requests from Seerr
 * @param config - Seerr configuration
 * @returns Number of pending requests
 */
export async function getPendingRequestsCount(config: SeerrConfig): Promise<number> {
  logger.debug('Fetching pending requests count from Seerr');

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
        'Failed to fetch pending requests from Seerr'
      );
      throw new Error(`Seerr API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as SeerrPendingRequestsResponse;
    const count = data.pageInfo.results;

    logger.debug(
      { pendingRequestsCount: count },
      'Successfully fetched pending requests count from Seerr'
    );

    return count;
  } catch (error) {
    logger.error({ error, url: config.url }, 'Failed to get pending requests count from Seerr');
    throw error;
  }
}

/**
 * Get media availability status from Seerr
 *
 * @param tmdbId - TMDB ID of the media
 * @param mediaType - Media type (movie or tv)
 * @param config - Seerr configuration
 * @returns Media info response with status, or null if not found
 */
export async function getMediaAvailability(
  tmdbId: number,
  mediaType: MediaTypeVO,
  config: SeerrConfig
): Promise<SeerrMediaInfoResponse | null> {
  const endpoint = mediaType.isMovie() ? 'movie' : 'tv';
  logger.debug({ tmdbId, mediaType: mediaType.getValue() }, 'Checking media availability in Seerr');

  try {
    const response = await fetch(`${config.url}/api/v1/${endpoint}/${tmdbId}?language=en`, {
      headers: buildHeaders(config),
    });

    if (response.status === 404) {
      logger.debug({ tmdbId }, 'Media not found in Seerr (404)');
      return null;
    }

    if (!response.ok) {
      logger.warn(
        { tmdbId, status: response.status },
        'Failed to fetch media availability from Seerr'
      );
      return null;
    }

    const data = (await response.json()) as SeerrMediaInfoResponse;
    logger.debug(
      { tmdbId, status: data.mediaInfo?.status },
      'Media availability fetched from Seerr'
    );
    return data;
  } catch (error) {
    logger.warn(
      { tmdbId, error: error instanceof Error ? error.message : 'Unknown error' },
      'Error fetching media availability from Seerr'
    );
    return null;
  }
}
