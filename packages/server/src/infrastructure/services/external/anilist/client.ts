/**
 * AniList GraphQL Client
 *
 * Fetches anime lists from AniList using their public GraphQL API.
 * No authentication required for public user lists.
 * API documentation: https://anilist.gitbook.io/anilist-apiv2-docs/
 */

import { LoggerService } from '@/server/infrastructure/services/core/logger.adapter';
import type { AnilistStatus } from 'shared/presentation/schemas';
import type { AnilistGraphQLResponse, AnilistMediaEntry, AnilistUrlParsed } from './types';

const logger = new LoggerService('anilist-client');

// AniList API constants
const ANILIST_GRAPHQL_URL = 'https://graphql.anilist.co';
const REQUEST_TIMEOUT_MS = 30000; // 30 seconds timeout

// Rate limiting: AniList allows 90 requests per minute
// We'll add a small delay between requests to be safe
const MIN_REQUEST_INTERVAL_MS = 700; // ~85 requests per minute max
let lastRequestTime = 0;

/**
 * GraphQL query for fetching a user's anime list with a specific status.
 */
const MEDIA_LIST_QUERY = `
query ($userName: String, $status: MediaListStatus) {
  MediaListCollection(userName: $userName, type: ANIME, status: $status) {
    lists {
      name
      status
      entries {
        mediaId
        score
        status
        media {
          id
          title {
            romaji
            english
          }
          format
          episodes
          seasonYear
        }
      }
    }
  }
}
`;

/**
 * Parses an AniList URL in the format: anilist:{username}:{status}
 */
export function parseAnilistUrl(url: string): AnilistUrlParsed | null {
  const pattern = /^anilist:([^:]+):(CURRENT|PLANNING|COMPLETED|DROPPED|PAUSED|REPEATING)$/i;
  const match = url.match(pattern);

  if (!match || !match[1] || !match[2]) {
    logger.warn({ url }, 'Invalid AniList URL format');
    return null;
  }

  const usernameMatch: string = match[1];
  const statusMatch: string = match[2];
  return {
    username: usernameMatch,
    status: statusMatch.toUpperCase() as AnilistStatus,
  };
}

/**
 * Ensures we don't exceed AniList rate limits.
 */
async function respectRateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL_MS) {
    const delay = MIN_REQUEST_INTERVAL_MS - timeSinceLastRequest;
    logger.debug({ delay }, 'Rate limiting: waiting before next request');
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  lastRequestTime = Date.now();
}

/**
 * Fetches a user's anime list from AniList with a specific status.
 *
 * @param username - AniList username
 * @param status - List status to fetch (CURRENT, PLANNING, COMPLETED, etc.)
 * @param maxItems - Maximum number of items to return (null for all)
 * @returns Array of media entries
 */
export async function fetchAnilistList(
  username: string,
  status: AnilistStatus,
  maxItems: number | null
): Promise<AnilistMediaEntry[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    logger.info({ username, status, maxItems }, 'Fetching AniList anime list');

    await respectRateLimit();

    const response = await fetch(ANILIST_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        query: MEDIA_LIST_QUERY,
        variables: {
          userName: username,
          status: status,
        },
      }),
      signal: controller.signal,
    });

    // Handle rate limiting response
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      logger.warn(
        { retryAfter, username, status },
        'AniList rate limit exceeded, request rejected'
      );
      throw new Error(
        `AniList rate limit exceeded. Retry after ${retryAfter ?? 'unknown'} seconds`
      );
    }

    if (!response.ok) {
      const errorBody = await response.text();
      logger.error(
        {
          status: response.status,
          statusText: response.statusText,
          responseBody: errorBody.substring(0, 500),
          username,
        },
        'AniList GraphQL request failed'
      );
      throw new Error(`AniList API error: ${response.statusText}`);
    }

    const result = (await response.json()) as AnilistGraphQLResponse;

    // Check for GraphQL errors
    if (result.errors && result.errors.length > 0) {
      const errorMessages = result.errors.map((e) => e.message).join(', ');
      logger.error({ errors: result.errors, username, status }, 'AniList GraphQL returned errors');
      throw new Error(`AniList GraphQL errors: ${errorMessages}`);
    }

    // Check if we got data
    if (!result.data?.MediaListCollection?.lists) {
      logger.warn(
        { username, status },
        'AniList returned empty result - user may not exist or list is private'
      );
      return [];
    }

    // Flatten all entries from all lists (usually just one list per status)
    const allEntries = result.data.MediaListCollection.lists.flatMap((list) => list.entries);

    logger.info({ username, status, totalEntries: allEntries.length }, 'Fetched AniList entries');

    // Apply maxItems limit if specified
    if (maxItems && maxItems > 0 && allEntries.length > maxItems) {
      logger.debug(
        { totalEntries: allEntries.length, maxItems },
        'Applying maxItems limit to AniList results'
      );
      return allEntries.slice(0, maxItems);
    }

    return allEntries;
  } catch (error) {
    logger.error({ error, username, status }, 'Error fetching AniList list');
    throw new Error(
      `Failed to fetch AniList list for ${username}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  } finally {
    clearTimeout(timeout);
  }
}
